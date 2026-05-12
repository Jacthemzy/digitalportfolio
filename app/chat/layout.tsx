import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chat",
  description:
    "Start a direct conversation with Temidayo Jacob through the portfolio chat.",
  alternates: {
    canonical: "/chat",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return children;
}
