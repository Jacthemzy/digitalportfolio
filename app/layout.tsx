import type { Metadata, Viewport } from "next";
import "./globals.css";
import ClientShell from "@/components/layout/ClientShell";
import StructuredData from "@/components/seo/StructuredData";
import { getMetadataBase } from "@/lib/seo/site-url";

const siteTitle = "Temidayo Jacob — Product Manager · Digital Marketer · Software Developer";
const siteDescription =
  "Portfolio of Temidayo Jacob: product management, growth marketing, and software engineering — case studies, CV, and contact from Lagos, Nigeria.";

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: {
    default: siteTitle,
    template: "%s · Temidayo Jacob",
  },
  description: siteDescription,
  applicationName: "Temidayo Jacob Portfolio",
  authors: [{ name: "Temidayo Jacob", url: "/" }],
  creator: "Temidayo Jacob",
  publisher: "Temidayo Jacob",
  category: "portfolio",
  keywords: [
    "Temidayo Jacob",
    "Temidayo Jacob portfolio",
    "product manager Nigeria",
    "digital marketer Lagos",
    "software developer portfolio",
    "full stack developer Nigeria",
    "growth marketing",
    "product strategy",
  ],
  alternates: {
    canonical: "/",
  },
  formatDetection: {
    email: false,
    telephone: false,
    address: false,
  },
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: "/",
    siteName: "Temidayo Jacob",
    title: siteTitle,
    description: siteDescription,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Temidayo Jacob Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export const viewport: Viewport = {
  themeColor: [{ media: "(prefers-color-scheme: dark)", color: "#04040a" }],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <StructuredData />
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
