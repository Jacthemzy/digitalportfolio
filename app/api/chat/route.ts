import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { sendNotificationEmail } from "@/lib/mailer";
import { ChatAuditLog, ChatSession, Message } from "@/models/index";

const ipAttempts = new Map<string, { count: number; firstAttempt: number; lastAttempt: number }>();

const MAX_MESSAGES_PER_SESSION = 50;
const MAX_UNANSWERED_MESSAGES = 3;
const MAX_SESSIONS_PER_IP_PER_HOUR = 3;
const MIN_TIME_BETWEEN_MESSAGES_MS = 1500;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

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
  const spamPatterns = [
    /(.)\1{10,}/,
    /(https?:\/\/[^\s]+\s*){3,}/i,
    /\b(buy|sell|cheap|free|click here|subscribe|winner|congratulations)\b/i,
    /[A-Z]{20,}/,
  ];
  return spamPatterns.some((pattern) => pattern.test(text));
}

function sanitizeText(value: unknown) {
  return String(value ?? "").trim();
}

function normalizeEmail(value: unknown) {
  return sanitizeText(value).toLowerCase();
}

async function loadSession(sessionId: string): Promise<any | null> {
  return ChatSession.findOne({ sessionId }).lean<any>();
}

export async function GET(req: NextRequest) {
  const sessionId = new URL(req.url).searchParams.get("sessionId");
  if (!sessionId) return NextResponse.json({ session: null, messages: [] });

  try {
    await connectDB();
    const session = await loadSession(sessionId);
    if (!session) return NextResponse.json({ session: null, messages: [] });

    if (new Date(session.expiresAt) < new Date()) {
      return NextResponse.json({ session: null, messages: [] });
    }

    const messages = await Message.find({ sessionId }).sort({ createdAt: 1 }).lean<any[]>();

    void Message.updateMany(
      { sessionId, sender: "admin", readByUser: false },
      { $set: { readByUser: true } }
    ).catch(() => {});

    return NextResponse.json({
      session: {
        sessionId: session.sessionId,
        name: session.name || "",
        email: session.email || "",
        messageCount: session.messageCount || 0,
        blocked: !!session.blocked,
        blockedReason: session.blockedReason || "",
        restricted: !!session.restricted,
        restrictedReason: session.restrictedReason || "",
      },
      messages: messages.map((message) => ({
        id: String(message._id),
        sender: message.sender,
        text: message.deletedForUser ? "This message was deleted." : message.message,
        createdAt: message.createdAt,
        readByAdmin: !!message.readByAdmin,
        readByUser: !!message.readByUser,
        deletedForUser: !!message.deletedForUser,
      })),
    });
  } catch {
    return NextResponse.json({ session: null, messages: [] });
  }
}

export async function POST(req: NextRequest) {
  const ip = getClientIP(req);
  const now = Date.now();

  try {
    const body = await req.json();
    const action = sanitizeText(body.action);
    const sessionId = sanitizeText(body.sessionId);
    const name = sanitizeText(body.name);
    const email = normalizeEmail(body.email);
    const message = sanitizeText(body.message);
    const fingerprint = sanitizeText(body.fingerprint);
    const visitorId = sanitizeText(body.visitorId);
    const honeypot = sanitizeText(body.honeypot);
    const timingMs = Number(body.timingMs ?? 0);

    if (honeypot) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    if (timingMs && timingMs < 300) {
      return NextResponse.json({ error: "Too fast. Please slow down." }, { status: 429 });
    }

    await connectDB();

    if (action === "create_session") {
      const ipData = ipAttempts.get(ip);
      if (ipData) {
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

      const existingSession = await ChatSession.findOne({
        $or: [
          ...(fingerprint ? [{ fingerprint }] : []),
          ...(visitorId ? [{ visitorId }] : []),
          { ip },
        ],
        expiresAt: { $gt: new Date() },
      }).sort({ updatedAt: -1, createdAt: -1 }).lean<any>();

      if (existingSession) {
        return NextResponse.json({
          sessionId: existingSession.sessionId,
          resumed: true,
          name: existingSession.name || "",
          email: existingSession.email || "",
          messageCount: existingSession.messageCount || 0,
          blocked: !!existingSession.blocked,
          restricted: !!existingSession.restricted,
        });
      }

      const newSessionId = generateSessionId();
      await ChatSession.create({
        sessionId: newSessionId,
        ip,
        fingerprint,
        visitorId,
        messageCount: 0,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + SESSION_TTL_MS),
      });

      return NextResponse.json({ sessionId: newSessionId, resumed: false });
    }

    if (action === "resume_by_email") {
      if (!email) {
        return NextResponse.json({ error: "Email is required." }, { status: 400 });
      }

      const matchingSession = await ChatSession.findOne({
        email,
        expiresAt: { $gt: new Date() },
      }).sort({ updatedAt: -1, createdAt: -1 }).lean<any>();

      if (!matchingSession) {
        return NextResponse.json({ resumed: false });
      }

      return NextResponse.json({
        resumed: true,
        sessionId: matchingSession.sessionId,
        name: matchingSession.name || "",
        email: matchingSession.email || email,
        blocked: !!matchingSession.blocked,
        restricted: !!matchingSession.restricted,
      });
    }

    if (!sessionId) {
      return NextResponse.json({ error: "Session is required." }, { status: 400 });
    }

    const session = await ChatSession.findOne({ sessionId });
    if (!session) {
      return NextResponse.json({ error: "Invalid session. Please refresh and try again." }, { status: 400 });
    }

    if (new Date(session.expiresAt) < new Date()) {
      return NextResponse.json({ error: "Session expired. Please refresh the page." }, { status: 400 });
    }

    if (session.blocked) {
      return NextResponse.json({
        error: session.blockedReason || "Your chat access has been blocked.",
        blocked: true,
      }, { status: 403 });
    }

    if (action === "update_session") {
      const updates: Record<string, unknown> = {
        expiresAt: new Date(Date.now() + SESSION_TTL_MS),
      };
      if (name) updates.name = name;
      if (email) updates.email = email;
      if (visitorId) updates.visitorId = visitorId;
      if (fingerprint) updates.fingerprint = fingerprint;
      await ChatSession.findOneAndUpdate({ sessionId }, { $set: updates });
      return NextResponse.json({ success: true });
    }

    if (action === "send_message") {
      if (session.restricted) {
        return NextResponse.json({
          error: session.restrictedReason || "This conversation is currently restricted.",
          restricted: true,
        }, { status: 403 });
      }

      if (!message) {
        return NextResponse.json({ error: "Message is required." }, { status: 400 });
      }

      if (!session.name || !session.email) {
        return NextResponse.json({ error: "Please provide your name and email first." }, { status: 400 });
      }

      const unansweredCount = await Message.countDocuments({
        sessionId,
        sender: "user",
        ...(session.lastAdminReplyAt
          ? { createdAt: { $gt: new Date(session.lastAdminReplyAt) } }
          : {}),
      });

      if (unansweredCount >= MAX_UNANSWERED_MESSAGES) {
        const patienceMessage = "Please exercise patience. Temidayo will reply as soon as possible.";
        await ChatSession.findOneAndUpdate(
          { sessionId },
          {
            $set: {
              restricted: true,
              restrictedReason: patienceMessage,
              outstandingUserMessages: unansweredCount,
            },
          }
        );
        await ChatAuditLog.create({
          action: "auto_restrict_unanswered_limit",
          actor: "system",
          sessionId,
          details: { unansweredCount, limit: MAX_UNANSWERED_MESSAGES },
        });
        return NextResponse.json({
          error: patienceMessage,
          restricted: true,
        }, { status: 403 });
      }

      if (session.lastMessage) {
        const timeSinceLast = now - new Date(session.lastMessage).getTime();
        if (timeSinceLast < MIN_TIME_BETWEEN_MESSAGES_MS) {
          return NextResponse.json({ error: "Slow down! Please wait a moment." }, { status: 429 });
        }
      }

      if (session.messageCount >= MAX_MESSAGES_PER_SESSION) {
        return NextResponse.json({
          error: "Message limit reached for this conversation.",
          limitReached: true,
        }, { status: 429 });
      }

      if (message.length < 2) {
        return NextResponse.json({ error: "Message too short." }, { status: 400 });
      }

      if (message.length > 2000) {
        return NextResponse.json({ error: "Message too long (max 2000 characters)." }, { status: 400 });
      }

      if (isSpam(message)) {
        await ChatSession.findOneAndUpdate(
          { sessionId },
          { $set: { blocked: true, blockedReason: "Spam content detected" } }
        );
        return NextResponse.json({ error: "Your message was flagged as spam.", blocked: true }, { status: 400 });
      }

      const createdMessage = await Message.create({
        sessionId,
        name: session.name,
        email: session.email,
        sender: "user",
        message,
        read: false,
        readByAdmin: false,
        readByUser: true,
      });

      await ChatSession.findOneAndUpdate(
        { sessionId },
        {
          $set: {
            name: name || session.name,
            email: email || session.email,
            visitorId: visitorId || session.visitorId,
            fingerprint: fingerprint || session.fingerprint,
            lastMessage: new Date(),
            expiresAt: new Date(Date.now() + SESSION_TTL_MS),
            outstandingUserMessages: unansweredCount + 1,
          },
          $inc: { messageCount: 1 },
        }
      );

      await sendNotificationEmail({
        name: session.name,
        email: session.email,
        message,
      }).catch(() => {});

      return NextResponse.json({
        success: true,
        message: {
          id: String(createdMessage._id),
          sender: "user",
          text: createdMessage.message,
          createdAt: createdMessage.createdAt,
        },
      });
    }

    if (action === "delete_message") {
      const messageId = sanitizeText(body.messageId);
      if (!messageId) {
        return NextResponse.json({ error: "Message id is required." }, { status: 400 });
      }

      const targetMessage = await Message.findOne({
        _id: messageId,
        sessionId,
        sender: "user",
      });

      if (!targetMessage) {
        return NextResponse.json({ error: "Message not found." }, { status: 404 });
      }

      targetMessage.deletedByUserAt = new Date();
      targetMessage.deletedForUser = true;
      targetMessage.deleteReason = "Deleted by sender";
      await targetMessage.save();
      await ChatAuditLog.create({
        action: "user_deleted_message",
        actor: "user",
        sessionId,
        messageId,
        details: { email: session.email || "" },
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unsupported action." }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
