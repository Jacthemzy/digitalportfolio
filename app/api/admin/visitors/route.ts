import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Visitor, Ban } from "@/models/Visitor";
import { isAdminAuthenticated } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!isAdminAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const visitors = await Visitor.find().sort({ lastSeen: -1 }).limit(100).lean();
  const bans = await Ban.find({ isActive: true }).lean();
  return NextResponse.json({ visitors, bans });
}

// POST - ban a visitor
export async function POST(req: NextRequest) {
  if (!isAdminAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { visitorId, email, ip, reason, durationDays } = await req.json();
  await connectDB();

  const expiresAt = durationDays ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000) : null;

  const bans = [];

  if (visitorId) {
    await Ban.create({ type: "visitorId", value: visitorId, reason, durationDays, expiresAt, isActive: true });
    await Visitor.findOneAndUpdate({ visitorId }, { isBanned: true, banReason: reason, banExpiresAt: expiresAt, bannedAt: new Date() });
    bans.push("visitorId");
  }
  if (email) {
    await Ban.findOneAndUpdate({ type: "email", value: email.toLowerCase() }, { type: "email", value: email.toLowerCase(), reason, durationDays, expiresAt, isActive: true, createdAt: new Date() }, { upsert: true });
    await Visitor.findOneAndUpdate({ email: email.toLowerCase() }, { isBanned: true, banReason: reason, banExpiresAt: expiresAt, bannedAt: new Date() });
    bans.push("email");
  }
  if (ip) {
    await Ban.findOneAndUpdate({ type: "ip", value: ip }, { type: "ip", value: ip, reason, durationDays, expiresAt, isActive: true, createdAt: new Date() }, { upsert: true });
    bans.push("ip");
  }

  return NextResponse.json({ success: true, bans });
}

// DELETE - unban
export async function DELETE(req: NextRequest) {
  if (!isAdminAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { banId, visitorId, email } = await req.json();
  await connectDB();

  if (banId) {
    await Ban.findByIdAndUpdate(banId, { isActive: false, unbannedAt: new Date(), unbannedReason: "Manually unbanned by admin" });
  }
  if (visitorId) {
    await Ban.updateMany({ type: "visitorId", value: visitorId }, { isActive: false, unbannedAt: new Date() });
    await Visitor.findOneAndUpdate({ visitorId }, { isBanned: false, banReason: null, banExpiresAt: null });
  }
  if (email) {
    await Ban.updateMany({ type: "email", value: email.toLowerCase() }, { isActive: false, unbannedAt: new Date() });
    await Visitor.findOneAndUpdate({ email: email.toLowerCase() }, { isBanned: false, banReason: null, banExpiresAt: null });
  }

  return NextResponse.json({ success: true });
}
