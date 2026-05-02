"use client";
import { useVisitorTracker } from "@/hooks/useVisitorTracker";

export default function TrackerWrapper() {
  useVisitorTracker();
  return null;
}
