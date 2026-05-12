import { unstable_cache } from "next/cache";
import { connectDB } from "@/lib/mongodb";
import { SiteContent } from "@/models/SiteContent";

export type PublicSettings = {
  siteName?: string;
  siteTitle?: string;
  siteTagline?: string;
  location?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  twitter?: string;
  isAvailable?: boolean;
  availableForHire?: boolean;
  availableText?: string;
};

export const getPublicSettings = unstable_cache(
  async (): Promise<PublicSettings> => {
    try {
      await connectDB();
      const doc = await SiteContent.findOne({ section: "settings" }).lean<{ data?: PublicSettings }>();
      return doc?.data ?? {};
    } catch {
      return {};
    }
  },
  ["public-site-settings-v1"],
  { revalidate: 300, tags: ["site-settings"] }
);
