import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Project } from "@/models/Project";
import { isAdminAuthenticated } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!isAdminAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const projects = await Project.find().sort({ order: 1, createdAt: -1 });
  return NextResponse.json({ projects });
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  await connectDB();
  if (!body.slug && body.title) {
    body.slug = body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }
  const project = await Project.create(body);
  return NextResponse.json({ project }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  if (!isAdminAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, ...data } = await req.json();
  await connectDB();
  const project = await Project.findByIdAndUpdate(id, data, { new: true });
  return NextResponse.json({ project });
}

export async function DELETE(req: NextRequest) {
  if (!isAdminAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  await connectDB();
  await Project.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
