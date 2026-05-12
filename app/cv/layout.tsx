import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CV",
  description:
    "View Temidayo Jacob's CV, experience, education, certifications, and project background.",
  alternates: {
    canonical: "/cv",
  },
};

export default function CvLayout({ children }: { children: React.ReactNode }) {
  return children;
}
