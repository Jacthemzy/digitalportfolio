import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Product Thinking",
  description:
    "Read the product thinking frameworks, decision models, and strategy principles Temidayo Jacob uses before building.",
  alternates: {
    canonical: "/product-thinking",
  },
};

export default function ProductThinkingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
