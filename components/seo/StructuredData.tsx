import { getSiteUrl } from "@/lib/seo/site-url";
import { getPublicSettings } from "@/lib/seo/public-settings";

const DEFAULT_NAME = "Temidayo Jacob";
const DEFAULT_TAGLINE = "Product Manager · Digital Marketer · Software Developer";

export default async function StructuredData() {
  const base = getSiteUrl();
  const s = await getPublicSettings();

  const name = (s.siteName || s.siteTitle || DEFAULT_NAME).trim();
  const jobTitle = (s.siteTagline || DEFAULT_TAGLINE).trim();
  const sameAs = [s.linkedin, s.github, s.twitter].filter(Boolean) as string[];

  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    jobTitle,
    url: base,
    email: s.email || undefined,
    telephone: s.phone || undefined,
    address: s.location
      ? { "@type": "PostalAddress", addressLocality: s.location }
      : undefined,
    sameAs: sameAs.length ? sameAs : undefined,
    knowsAbout: [
      "Product management",
      "Digital marketing",
      "Software development",
      "Growth strategy",
    ],
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: `${name} — Portfolio`,
    url: base,
    description:
      "Portfolio of Temidayo Jacob — product, marketing, and engineering work from Lagos, Nigeria.",
    inLanguage: "en",
    publisher: { "@type": "Person", name, url: base },
  };

  const professionalService = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: `${name} Portfolio`,
    url: base,
    description:
      "Product management, digital marketing, and software development portfolio and professional profile.",
    areaServed: "Worldwide",
    founder: { "@type": "Person", name },
    sameAs: sameAs.length ? sameAs : undefined,
  };

  const graph = {
    "@context": "https://schema.org",
    "@graph": [person, website, professionalService],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
