import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Temidayo Jacob Portfolio",
    short_name: "Temidayo",
    description:
      "Portfolio of Temidayo Jacob across product management, digital marketing, and software development.",
    start_url: "/",
    display: "standalone",
    background_color: "#04040a",
    theme_color: "#04040a",
    icons: [],
  };
}
