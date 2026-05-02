import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Analytics } from "@/models/index";
import { isAdminAuthenticated } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!isAdminAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const all = await Analytics.find().sort({ createdAt: -1 }).limit(500);

  const pageViews: Record<string, number> = {};
  const pageTime: Record<string, number> = {};
  all.forEach((a) => {
    pageViews[a.page] = (pageViews[a.page] || 0) + 1;
    pageTime[a.page] = (pageTime[a.page] || 0) + (a.timeSpent || 0);
  });

  const pages = Object.entries(pageViews)
    .map(([page, views]) => ({ page, views, avgTime: Math.round((pageTime[page] || 0) / views) }))
    .sort((a, b) => b.views - a.views);

  const week = new Date(); week.setDate(week.getDate() - 7);
  const recent = await Analytics.find({ createdAt: { $gte: week } });
  const dailyCounts: Record<string, number> = {};
  recent.forEach((a) => {
    const day = new Date(a.createdAt).toLocaleDateString("en-US", { weekday: "short" });
    dailyCounts[day] = (dailyCounts[day] || 0) + 1;
  });
  const daily = Object.entries(dailyCounts).map(([day, count]) => ({ day, count }));
  return NextResponse.json({ pages, daily, total: all.length });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  await connectDB();
  await Analytics.create(body);
  return NextResponse.json({ success: true });
}
