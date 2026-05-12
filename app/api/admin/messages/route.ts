import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { isAdminAuthenticated } from "@/lib/auth";
import { ChatAuditLog, ChatSession, Message } from "@/models/index";
import { sendReplyNotificationEmail } from "@/lib/mailer";

function buildThreads(messages: any[], sessions: any[]) {
  const sessionMap = new Map(sessions.map((session) => [session.sessionId, session]));
  const grouped = new Map<string, any[]>();

  for (const message of messages) {
    const key = message.sessionId;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(message);
  }

  return Array.from(grouped.entries())
    .map(([sessionId, threadMessages]) => {
      const orderedMessages = [...threadMessages].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      const latest = orderedMessages[orderedMessages.length - 1];
      const firstUserMessage = orderedMessages.find((message) => message.sender === "user") || latest;
      const unreadCount = orderedMessages.filter(
        (message) => message.sender === "user" && !message.readByAdmin
      ).length;
      const session = sessionMap.get(sessionId);

      return {
        _id: sessionId,
        sessionId,
        name: latest?.name || firstUserMessage?.name || session?.name || "Unknown",
        email: latest?.email || firstUserMessage?.email || session?.email || "",
        message: latest?.message || "",
        read: unreadCount === 0,
        unreadCount,
        createdAt: latest?.createdAt || firstUserMessage?.createdAt || session?.createdAt,
        blocked: !!session?.blocked,
        blockedReason: session?.blockedReason || "",
        restricted: !!session?.restricted,
        restrictedReason: session?.restrictedReason || "",
        messages: orderedMessages.map((message) => ({
          _id: String(message._id),
          sender: message.sender,
          message: message.message,
          createdAt: message.createdAt,
          readByAdmin: !!message.readByAdmin,
          readByUser: !!message.readByUser,
          deletedByUserAt: message.deletedByUserAt || null,
          deletedForUser: !!message.deletedForUser,
        })),
      };
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function GET(req: NextRequest) {
  if (!isAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const messages = await Message.find().sort({ createdAt: -1 }).limit(500).lean();
  const sessions = await ChatSession.find({
    sessionId: { $in: [...new Set(messages.map((message) => message.sessionId))] },
  }).lean();

  const threads = buildThreads(messages, sessions);
  const audits = await ChatAuditLog.find().sort({ createdAt: -1 }).limit(80).lean();
  return NextResponse.json({ threads, messages: threads, audits });
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sessionId, message } = await req.json();
  if (!sessionId || !String(message || "").trim()) {
    return NextResponse.json({ error: "Session and reply are required." }, { status: 400 });
  }

  await connectDB();
  const session = await ChatSession.findOne({ sessionId });
  if (!session || !session.email || !session.name) {
    return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
  }

  const reply = String(message).trim();
  const createdMessage = await Message.create({
    sessionId,
    name: session.name,
    email: session.email,
    sender: "admin",
    message: reply,
    read: true,
    readByAdmin: true,
    readByUser: false,
  });

  await ChatSession.findOneAndUpdate(
    { sessionId },
    {
      $set: {
        lastAdminReplyAt: new Date(),
        restricted: false,
        restrictedReason: "",
        outstandingUserMessages: 0,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    }
  );
  await ChatAuditLog.create({
    action: "admin_reply_sent",
    actor: "admin",
    sessionId,
    messageId: String(createdMessage._id),
    details: { email: session.email },
  });

  await sendReplyNotificationEmail({
    name: session.name,
    email: session.email,
    reply,
  }).catch(() => {});

  return NextResponse.json({
    success: true,
    reply: {
      _id: String(createdMessage._id),
      sender: "admin",
      message: createdMessage.message,
      createdAt: createdMessage.createdAt,
    },
  });
}

export async function PATCH(req: NextRequest) {
  if (!isAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sessionId, action, reason, days } = await req.json();
  if (!action) {
    return NextResponse.json({ error: "Action is required." }, { status: 400 });
  }

  await connectDB();

  if (action === "apply_retention") {
    const retentionDays = Number(days || 0);
    if (!retentionDays || retentionDays < 1) {
      return NextResponse.json({ error: "Valid retention days required." }, { status: 400 });
    }

    const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
    const oldMessages = await Message.find({ createdAt: { $lt: cutoff } }, { _id: 1, sessionId: 1 }).lean();
    const oldMessageIds = oldMessages.map((message: any) => String(message._id));
    const affectedSessions = [...new Set(oldMessages.map((message: any) => message.sessionId).filter(Boolean))];

    const deleteMessagesResult = await Message.deleteMany({ createdAt: { $lt: cutoff } });

    // Remove fully inactive sessions older than retention window.
    const deleteSessionsResult = await ChatSession.deleteMany({
      expiresAt: { $lt: new Date() },
      createdAt: { $lt: cutoff },
    });

    await ChatAuditLog.create({
      action: "admin_applied_retention",
      actor: "admin",
      details: {
        retentionDays,
        deletedMessages: deleteMessagesResult.deletedCount || 0,
        deletedSessions: deleteSessionsResult.deletedCount || 0,
        affectedSessionsCount: affectedSessions.length,
        oldMessageIds,
      },
    });

    return NextResponse.json({
      success: true,
      deletedMessages: deleteMessagesResult.deletedCount || 0,
      deletedSessions: deleteSessionsResult.deletedCount || 0,
    });
  }

  if (!sessionId) {
    return NextResponse.json({ error: "Session is required for this action." }, { status: 400 });
  }

  if (action === "mark_read") {
    await Message.updateMany(
      { sessionId, sender: "user", readByAdmin: false },
      { $set: { readByAdmin: true, read: true } }
    );
    await ChatAuditLog.create({
      action: "admin_marked_thread_read",
      actor: "admin",
      sessionId,
    });
    return NextResponse.json({ success: true });
  }

  if (action === "block" || action === "unblock" || action === "restrict" || action === "unrestrict") {
    const updates: Record<string, unknown> = {};
    if (action === "block") {
      updates.blocked = true;
      updates.blockedReason = String(reason || "Blocked by admin");
    }
    if (action === "unblock") {
      updates.blocked = false;
      updates.blockedReason = "";
    }
    if (action === "restrict") {
      updates.restricted = true;
      updates.restrictedReason = String(reason || "Replies are temporarily restricted.");
    }
    if (action === "unrestrict") {
      updates.restricted = false;
      updates.restrictedReason = "";
    }

    await ChatSession.findOneAndUpdate({ sessionId }, { $set: updates });
    await ChatAuditLog.create({
      action: `admin_${action}`,
      actor: "admin",
      sessionId,
      details: { reason: String(reason || "") },
    });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Unsupported action." }, { status: 400 });
}

export async function DELETE(req: NextRequest) {
  if (!isAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sessionId, messageId } = await req.json();

  if (messageId) {
    await connectDB();
    await Message.findOneAndDelete({ _id: messageId });
    await ChatAuditLog.create({
      action: "admin_deleted_message",
      actor: "admin",
      messageId,
    });
    return NextResponse.json({ success: true });
  }

  if (!sessionId) {
    return NextResponse.json({ error: "Session is required." }, { status: 400 });
  }

  await connectDB();
  await Message.deleteMany({ sessionId });
  await ChatSession.findOneAndDelete({ sessionId });
  await ChatAuditLog.create({
    action: "admin_deleted_thread",
    actor: "admin",
    sessionId,
  });
  return NextResponse.json({ success: true });
}
