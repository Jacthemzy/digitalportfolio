import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Social Impact",
  description:
    "Discover the social impact initiatives and community outcomes Temidayo Jacob has contributed to through technology and mentorship.",
  alternates: {
    canonical: "/social-impact",
  },
};

export default function SocialImpactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
