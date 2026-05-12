import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Project } from "@/models/Project";

// GET all projects (public)
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const projects = await Project.find().sort({ order: 1, createdAt: -1 }).lean();
    return NextResponse.json({ projects });
  } catch {
    return NextResponse.json({ projects: [] });
  }
}
