import { unstable_cache } from "next/cache";
import { connectDB } from "@/lib/mongodb";
import { Project } from "@/models/Project";

export type ProjectPhase = {
  name: string;
  icon: string;
  status: "completed" | "in-progress" | "planned";
  duration: string;
  description: string;
  tasks: string[];
  tools: string[];
  outcome: string;
};

export type ProjectMetric = {
  label: string;
  value: string;
  change: string;
  positive: boolean;
};

export type PortfolioProject = {
  _id: string;
  num: string;
  title: string;
  slug?: string;
  type: "software" | "product" | "marketing" | "design";
  tag: string;
  tagColor: string;
  year: string;
  status: "completed" | "in-progress" | "concept";
  duration: string;
  role: string;
  team?: string;
  client?: string;
  overview: string;
  problem: string;
  solution?: string;
  impact?: string;
  phases: ProjectPhase[];
  metrics: ProjectMetric[];
  stack: string[];
  links?: { live?: string; github?: string; caseStudy?: string };
  featured?: boolean;
  createdAt?: string | Date;
};

export const getProjects = unstable_cache(
  async (): Promise<PortfolioProject[]> => {
    await connectDB();
    const projects = await Project.find().sort({ order: 1, createdAt: -1 }).lean<any[]>();
    return projects.map((project) => ({ ...project, _id: String(project._id) }));
  },
  ["portfolio-projects-v1"],
  { revalidate: 300, tags: ["projects"] }
);

export async function getProjectById(id: string): Promise<PortfolioProject | null> {
  await connectDB();
  const project = await Project.findById(id).lean<any>();
  if (!project) return null;
  return { ...project, _id: String(project._id) };
}
