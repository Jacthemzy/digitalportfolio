import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Selected case studies: software, product, marketing, and design — shipped work by Temidayo Jacob.",
  alternates: { canonical: "/projects" },
  openGraph: {
    title: "Projects — Temidayo Jacob",
    description: "Portfolio projects and case studies.",
    url: "/projects",
  },
};

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
