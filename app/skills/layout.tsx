import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Skills",
  description:
    "Explore Temidayo Jacob's technical, product, and marketing skills across software development, strategy, analytics, and growth.",
  alternates: {
    canonical: "/skills",
  },
};

export default function SkillsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
