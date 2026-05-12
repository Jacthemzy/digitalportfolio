import type { MetadataRoute } from "next";
import { connectDB } from "@/lib/mongodb";
import { Project } from "@/models/Project";
import { getSiteUrl } from "@/lib/seo/site-url";

/** Generate at request time so builds never block on MongoDB. */
export const dynamic = "force-dynamic";

const STATIC = [
  "/",
  "/about",
  "/skills",
  "/projects",
  "/product-thinking",
  "/social-impact",
  "/cv",
  "/chat",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.85,
  }));

  let projectEntries: MetadataRoute.Sitemap = [];
  try {
    await connectDB();
    const projects = await Project.find({}, { _id: 1, createdAt: 1 }).lean();
    projectEntries = projects.map((p) => ({
      url: `${base}/projects/${String(p._id)}`,
      lastModified: (p as { createdAt?: Date }).createdAt || now,
      changeFrequency: "monthly" as const,
      priority: 0.75,
    }));
  } catch {
    /* Mongo unavailable during build — static routes only */
  }

  return [...staticEntries, ...projectEntries];
}
