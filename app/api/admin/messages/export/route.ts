import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { isAdminAuthenticated } from "@/lib/auth";
import { ChatAuditLog, ChatSession, Message } from "@/models/index";

export async function GET(req: NextRequest) {
  if (!isAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const [messages, sessions, auditLogs] = await Promise.all([
    Message.find().sort({ createdAt: -1 }).lean(),
    ChatSession.find().sort({ createdAt: -1 }).lean(),
    ChatAuditLog.find().sort({ createdAt: -1 }).lean(),
  ]);

  return NextResponse.json({
    exportedAt: new Date().toISOString(),
    totals: {
      messages: messages.length,
      sessions: sessions.length,
      auditLogs: auditLogs.length,
    },
    sessions,
    messages,
    auditLogs,
  });
}
