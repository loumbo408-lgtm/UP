import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "UP Gabon — Conciergerie Privée",
    short_name: "UP Gabon",
    description:
      "Plateforme d'accompagnement social encadré et de conciergerie privée d'élite à Libreville, Akanda et Port-Gentil.",
    start_url: "/",
    display: "standalone",
    background_color: "#FAF9FB",
    theme_color: "#8807A8",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/brand/up-logo.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/brand/up-logo.jpeg",
        sizes: "512x512",
        type: "image/jpeg",
      },
    ],
  };
}
