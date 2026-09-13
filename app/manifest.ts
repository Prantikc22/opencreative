import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "OpenCreative",
    short_name: "OpenCreative",
    description: "Open-source AI creative studio for complete marketing campaigns.",
    start_url: "/",
    display: "standalone",
    background_color: "#11110f",
    theme_color: "#ff4d3d",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
