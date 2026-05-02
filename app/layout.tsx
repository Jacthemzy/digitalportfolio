import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Cursor from "@/components/ui/Cursor";
import PageTransition from "@/components/layout/PageTransition";
import TrackerWrapper from "@/components/ui/TrackerWrapper";

export const metadata: Metadata = {
  title: "Temidayo Jacob — Product Manager · Digital Marketer · Software Developer",
  description:
    "A world-class portfolio. Product Manager, Digital Marketer, and Software Developer building meaningful products from Lagos, Nigeria.",
  keywords: ["Temidayo Jacob", "Product Manager", "Digital Marketer", "Software Developer", "Lagos", "Nigeria"],
  openGraph: {
    title: "Temidayo Jacob",
    description: "Product Manager · Digital Marketer · Software Developer",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <TrackerWrapper />
        <Cursor />
        <Navbar />
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}
