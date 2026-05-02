import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Message } from "@/models/index";
import { sendNotificationEmail } from "@/lib/mailer";
import { Schema, model, models } from "mongoose";

// ── Rate limit store (in-memory + DB backed) ──
const ChatSessionSchema = new Schema({
  sessionId: { type: String, required: true, unique: true },
  ip: String,
  fingerprint: String,
  name: String,
  email: String,
  messageCount: { type: Number, default: 0 },
  lastMessage: Date,
  completed: { type: Boolean, default: false },
  blocked: { type: Boolean, default: false },
  blockedReason: String,
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) }, // 24h
});

const ChatSession = models.ChatSession || model("ChatSession", ChatSessionSchema);

// In-memory rate limit (per IP, resets on server restart)
const ipAttempts = new Map<string, { count: number; firstAttempt: number; lastAttempt: number }>();

const MAX_MESSAGES_PER_SESSION = 5;
const MAX_SESSIONS_PER_IP_PER_HOUR = 3;
const MIN_TIME_BETWEEN_MESSAGES_MS = 2000; // 2 seconds min between messages
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function getClientIP(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    req.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

function generateSessionId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function isSpam(text: string): boolean {
  // Check for spam patterns
  const spamPatterns = [
    /(.)\1{10,}/,                    // repeated characters: aaaaaaaaaa
    /(https?:\/\/[^\s]+\s*){3,}/i,  // 3+ URLs
    /\b(buy|sell|cheap|free|click here|subscribe|winner|congratulations)\b/i,
    /[A-Z]{20,}/,                    // excessive caps
  ];
  return spamPatterns.some(p => p.test(text));
}

function containsProfanity(text: string): boolean {
  // Basic list — extend as needed
  const blocked = ["spam", "hack", "test test test"];
  const lower = text.toLowerCase();
  return blocked.some(w => lower.includes(w) && lower.length < 20);
}

// GET - fetch session state (for browser refresh persistence)
export async function GET(req: NextRequest) {
  const sessionId = new URL(req.url).searchParams.get("sessionId");
  if (!sessionId) return NextResponse.json({ session: null });
  try {
    await connectDB();
    const session = await ChatSession.findOne({ sessionId, blocked: false });
    if (!session) return NextResponse.json({ session: null });
    // Check if expired
    if (new Date(session.expiresAt) < new Date()) {
      return NextResponse.json({ session: null });
    }
    return NextResponse.json({
      session: {
        sessionId: session.sessionId,
        name: session.name,
        email: session.email,
        messageCount: session.messageCount,
        completed: session.completed,
      }
    });
  } catch {
    return NextResponse.json({ session: null });
  }
}

// POST - create session or send message
export async function POST(req: NextRequest) {
  const ip = getClientIP(req);
  const now = Date.now();

  try {
    const body = await req.json();
    const { action, sessionId, name, email, message, fingerprint, honeypot, timingMs } = body;

    // ── HONEYPOT CHECK (bot detection) ──
    // If honeypot field is filled, it's a bot
    if (honeypot) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    // ── TIMING CHECK (too fast = bot) ──
    if (timingMs !== undefined && timingMs < 500) {
      return NextResponse.json({ error: "Too fast. Please slow down." }, { status: 429 });
    }

    await connectDB();

    // ── CREATE SESSION ──
    if (action === "create_session") {
      // Check IP rate limit
      const ipData = ipAttempts.get(ip);
      if (ipData) {
        // Reset if window expired
        if (now - ipData.firstAttempt > RATE_LIMIT_WINDOW_MS) {
          ipAttempts.set(ip, { count: 1, firstAttempt: now, lastAttempt: now });
        } else if (ipData.count >= MAX_SESSIONS_PER_IP_PER_HOUR) {
          const waitMinutes = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - ipData.firstAttempt)) / 60000);
          return NextResponse.json({
            error: `Too many conversations. Please wait ${waitMinutes} minute${waitMinutes !== 1 ? "s" : ""} before trying again.`,
            rateLimit: true,
          }, { status: 429 });
        } else {
          ipAttempts.set(ip, { ...ipData, count: ipData.count + 1, lastAttempt: now });
        }
      } else {
        ipAttempts.set(ip, { count: 1, firstAttempt: now, lastAttempt: now });
      }

      // Check if IP already has active incomplete session
      const existingSession = await ChatSession.findOne({
        ip,
        completed: false,
        blocked: false,
        expiresAt: { $gt: new Date() },
      });

      if (existingSession) {
        // Return existing session so they continue where they left off
        return NextResponse.json({
          sessionId: existingSession.sessionId,
          resumed: true,
          name: existingSession.name,
          email: existingSession.email,
          messageCount: existingSession.messageCount,
          completed: existingSession.completed,
        });
      }

      // Create new session
      const newSessionId = generateSessionId();
      await ChatSession.create({
        sessionId: newSessionId,
        ip,
        fingerprint: fingerprint || "",
        messageCount: 0,
        completed: false,
        blocked: false,
      });

      return NextResponse.json({ sessionId: newSessionId, resumed: false });
    }

    // ── SEND MESSAGE ──
    if (action === "send_message") {
      if (!sessionId || !message) {
        return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
      }

      // Fetch session
      const session = await ChatSession.findOne({ sessionId });
      if (!session) {
        return NextResponse.json({ error: "Invalid session. Please refresh and try again." }, { status: 400 });
      }

      // Check if blocked
      if (session.blocked) {
        return NextResponse.json({
          error: `Your session has been blocked: ${session.blockedReason || "Suspicious activity detected."}`,
          blocked: true,
        }, { status: 403 });
      }

      // Check if expired
      if (new Date(session.expiresAt) < new Date()) {
        return NextResponse.json({ error: "Session expired. Please refresh the page." }, { status: 400 });
      }

      // Check message rate (too fast between messages)
      if (session.lastMessage) {
        const timeSinceLast = now - new Date(session.lastMessage).getTime();
        if (timeSinceLast < MIN_TIME_BETWEEN_MESSAGES_MS) {
          return NextResponse.json({ error: "Slow down! Please wait a moment." }, { status: 429 });
        }
      }

      // Check message count limit
      if (session.messageCount >= MAX_MESSAGES_PER_SESSION) {
        return NextResponse.json({
          error: "Message limit reached for this session.",
          limitReached: true,
        }, { status: 429 });
      }

      // Spam check
      if (isSpam(message)) {
        await ChatSession.findByIdAndUpdate(session._id, { blocked: true, blockedReason: "Spam content detected" });
        return NextResponse.json({ error: "Your message was flagged as spam.", blocked: true }, { status: 400 });
      }

      // Length check
      if (message.trim().length < 2) {
        return NextResponse.json({ error: "Message too short." }, { status: 400 });
      }
      if (message.length > 2000) {
        return NextResponse.json({ error: "Message too long (max 2000 characters)." }, { status: 400 });
      }

      // Update session with name/email if provided
      const updates: any = {
        messageCount: session.messageCount + 1,
        lastMessage: new Date(),
      };
      if (name) updates.name = name;
      if (email) updates.email = email;

      // Mark as completed when final message sent
      if (session.name && session.email && message) {
        updates.completed = true;
      }

      await ChatSession.findByIdAndUpdate(session._id, updates);

      // Save message to DB only when we have full details
      if (session.name && session.email) {
        const finalName = name || session.name;
        const finalEmail = email || session.email;
        await Message.create({ name: finalName, email: finalEmail, message });
        sendNotificationEmail({ name: finalName, email: finalEmail, message }).catch(console.error);
      }

      return NextResponse.json({ success: true, messageCount: session.messageCount + 1 });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 });
  }
}
