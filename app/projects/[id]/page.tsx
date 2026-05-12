import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProjectJourneyClient from "@/components/projects/ProjectJourneyClient";
import { getProjectById } from "@/lib/projects";
import { getSiteUrl } from "@/lib/seo/site-url";

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const project = await getProjectById(id);
  if (!project) {
    return {
      title: "Project Not Found",
      robots: { index: false, follow: false },
    };
  }

  const description =
    project.overview ||
    project.problem ||
    `Explore the full project journey for ${project.title}, including discovery, execution, and results.`;

  return {
    title: `${project.title} Journey`,
    description,
    alternates: {
      canonical: `/projects/${project._id}`,
    },
    openGraph: {
      title: `${project.title} · Temidayo Jacob`,
      description,
      url: `/projects/${project._id}`,
      type: "article",
    },
    twitter: {
      title: `${project.title} · Temidayo Jacob`,
      description,
    },
  };
}

export default async function ProjectJourneyPage({ params }: Params) {
  const { id } = await params;
  const project = await getProjectById(id);
  if (!project) notFound();

  const siteUrl = getSiteUrl();
  const schema = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.overview || project.problem || "",
    url: `${siteUrl}/projects/${project._id}`,
    creator: {
      "@type": "Person",
      name: "Temidayo Jacob",
    },
    about: [project.type, project.role, ...(project.stack || [])].filter(Boolean),
    datePublished: project.year || undefined,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <ProjectJourneyClient project={project} />
    </>
  );
}
