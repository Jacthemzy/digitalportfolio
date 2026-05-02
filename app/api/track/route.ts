import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Visitor, Ban } from "@/models/Visitor";

function getIP(req: NextRequest) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") || "unknown";
}

function parseDevice(ua: string): string {
  if (/mobile|android|iphone/i.test(ua)) return "Mobile";
  if (/tablet|ipad/i.test(ua)) return "Tablet";
  return "Desktop";
}

function parseBrowser(ua: string): string {
  if (/chrome/i.test(ua) && !/edg/i.test(ua)) return "Chrome";
  if (/firefox/i.test(ua)) return "Firefox";
  if (/safari/i.test(ua) && !/chrome/i.test(ua)) return "Safari";
  if (/edg/i.test(ua)) return "Edge";
  if (/opera|opr/i.test(ua)) return "Opera";
  return "Other";
}

// POST - track visitor event
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { visitorId, event, page, element, email, name, timeSpent, fingerprint } = body;

    if (!visitorId) return NextResponse.json({ ok: false });

    const ip = getIP(req);
    const ua = req.headers.get("user-agent") || "";

    await connectDB();

    // Check if banned
    const ban = await Ban.findOne({
      isActive: true,
      $or: [
        { type: "visitorId", value: visitorId },
        { type: "ip", value: ip },
        ...(email ? [{ type: "email", value: email.toLowerCase() }] : []),
      ],
    });

    if (ban) {
      // Check if ban expired
      if (ban.expiresAt && new Date(ban.expiresAt) < new Date()) {
        await Ban.findByIdAndUpdate(ban._id, { isActive: false, unbannedAt: new Date(), unbannedReason: "Expired" });
        await Visitor.findOneAndUpdate({ visitorId }, { isBanned: false, banReason: null, banExpiresAt: null });
      } else {
        return NextResponse.json({ banned: true, reason: ban.reason, expiresAt: ban.expiresAt });
      }
    }

    // Find or create visitor
    let visitor = await Visitor.findOne({ visitorId });

    if (!visitor) {
      visitor = await Visitor.create({
        visitorId,
        ip,
        userAgent: ua,
        device: parseDevice(ua),
        browser: parseBrowser(ua),
        email: email || null,
        name: name || null,
        pages: page ? [{ page, enteredAt: new Date(), timeSpent: 0 }] : [],
        clicks: [],
        sessions: [{ startedAt: new Date() }],
        totalVisits: 1,
        lastSeen: new Date(),
        firstSeen: new Date(),
      });
    } else {
      // Update existing visitor
      const updates: any = { lastSeen: new Date() };
      if (email && !visitor.email) updates.email = email;
      if (name && !visitor.name) updates.name = name;

      if (event === "pageview" && page) {
        updates.$push = { pages: { page, enteredAt: new Date(), timeSpent: 0 } };
        updates.$inc = { totalVisits: 1 };
      }

      if (event === "click" && element) {
        updates.$push = { ...(updates.$push || {}), clicks: { page, element, timestamp: new Date() } };
      }

      if (event === "timespent" && page && timeSpent) {
        // Update time spent on last matching page entry
        await Visitor.findOneAndUpdate(
          { visitorId, "pages.page": page },
          { $set: { "pages.$.timeSpent": timeSpent } }
        );
      }

      if (event === "session_end") {
        updates.$push = { ...(updates.$push || {}), sessions: { startedAt: new Date(Date.now() - (timeSpent || 0)), endedAt: new Date(), duration: timeSpent || 0 } };
      }

      await Visitor.findByIdAndUpdate(visitor._id, updates);
    }

    return NextResponse.json({ ok: true, visitorId });
  } catch (err) {
    return NextResponse.json({ ok: false });
  }
}

// GET - check if visitor is banned
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const visitorId = searchParams.get("visitorId");
  const email = searchParams.get("email");
  const ip = getIP(req);

  if (!visitorId) return NextResponse.json({ banned: false });

  try {
    await connectDB();
    const ban = await Ban.findOne({
      isActive: true,
      $or: [
        { type: "visitorId", value: visitorId },
        { type: "ip", value: ip },
        ...(email ? [{ type: "email", value: email.toLowerCase() }] : []),
      ],
    });

    if (!ban) return NextResponse.json({ banned: false });

    // Check expiry
    if (ban.expiresAt && new Date(ban.expiresAt) < new Date()) {
      await Ban.findByIdAndUpdate(ban._id, { isActive: false });
      return NextResponse.json({ banned: false });
    }

    return NextResponse.json({ banned: true, reason: ban.reason, expiresAt: ban.expiresAt });
  } catch {
    return NextResponse.json({ banned: false });
  }
}
