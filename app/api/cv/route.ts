import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { CvSession } from "@/models/index";
import { v4 as uuid } from "uuid";

export async function POST() {
  await connectDB();
  const sessionId = uuid();
  const expiresAt = new Date(Date.now() + 90000);
  await CvSession.create({ sessionId, expiresAt });
  return NextResponse.json({ sessionId, expiresAt }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const sessionId = new URL(req.url).searchParams.get("sessionId");
  if (!sessionId) return NextResponse.json({ valid: false });
  await connectDB();
  const s = await CvSession.findOne({ sessionId });
  if (!s) return NextResponse.json({ valid: false });
  const valid = new Date(s.expiresAt) > new Date();
  const remaining = Math.max(0, Math.floor((new Date(s.expiresAt).getTime() - Date.now()) / 1000));
  return NextResponse.json({ valid, remaining });
}
