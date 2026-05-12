import type { Metadata } from "next";
import ProjectsPageClient from "@/components/projects/ProjectsPageClient";
import { getProjects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Explore Temidayo Jacob's project case studies across software development, product management, and growth marketing.",
  alternates: {
    canonical: "/projects",
  },
  openGraph: {
    title: "Projects · Temidayo Jacob",
    description:
      "Project journeys, case studies, metrics, and execution stories across product, marketing, and engineering.",
    url: "/projects",
  },
  twitter: {
    title: "Projects · Temidayo Jacob",
    description:
      "Project journeys, case studies, metrics, and execution stories across product, marketing, and engineering.",
  },
};

export default async function ProjectsPage() {
  const projects = await getProjects();
  return <ProjectsPageClient initialProjects={projects} />;
}
