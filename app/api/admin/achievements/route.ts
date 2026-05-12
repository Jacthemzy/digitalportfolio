import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Achievement } from "@/models/index";
import { isAdminAuthenticated } from "@/lib/auth";

export async function GET(req: NextRequest) {
  await connectDB();
  const adminRequest = isAdminAuthenticated(req);
  const achievements = await Achievement.find(adminRequest ? {} : { published: true }).sort({ order: 1, createdAt: -1 }).lean();
  return NextResponse.json({ achievements });
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  await connectDB();
  const achievement = await Achievement.create(body);
  return NextResponse.json({ achievement }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  if (!isAdminAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, ...data } = await req.json();
  await connectDB();
  const achievement = await Achievement.findByIdAndUpdate(id, data, { new: true });
  return NextResponse.json({ achievement });
}

export async function DELETE(req: NextRequest) {
  if (!isAdminAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  await connectDB();
  await Achievement.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
