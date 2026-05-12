"use client";

import dynamic from "next/dynamic";

const Navbar = dynamic(() => import("@/components/layout/Navbar"));
const PageTransition = dynamic(() => import("@/components/layout/PageTransition"));
const Cursor = dynamic(() => import("@/components/ui/Cursor"), { ssr: false });
const TrackerWrapper = dynamic(() => import("@/components/ui/TrackerWrapper"), { ssr: false });

export default function ClientShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TrackerWrapper />
      <Cursor />
      <Navbar />
      <PageTransition>{children}</PageTransition>
    </>
  );
}
