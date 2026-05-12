import type { Metadata } from "next";
import { connectDB } from "@/lib/mongodb";
import { Project } from "@/models/Project";

type Props = { children: React.ReactNode; params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  let title = "Project";
  let description = "Case study and project journey — Temidayo Jacob portfolio.";

  try {
    await connectDB();
    const project = await Project.findById(id).lean<{ title?: string; overview?: string; tag?: string }>();
    if (project?.title) {
      title = project.title;
      const snippet = (project.overview || "").replace(/\s+/g, " ").trim().slice(0, 155);
      description = snippet || `${project.title} — ${project.tag || "Portfolio"} case study.`;
    }
  } catch {
    /* defaults */
  }

  return {
    title,
    description,
    alternates: { canonical: `/projects/${id}` },
    openGraph: {
      title: `${title} — Temidayo Jacob`,
      description,
      url: `/projects/${id}`,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} — Temidayo Jacob`,
      description,
    },
    robots: { index: true, follow: true },
  };
}

export default function ProjectDetailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
