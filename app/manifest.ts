import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Crispy Duck",
    short_name: "CrispyDuck",
    description: "A Weight Analysis Scanner built with Next.js",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any", // Explicitly satisfies the 'any' purpose requirement
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    // This array clears your Richer Install UI errors
    screenshots: [
      {
        src: "/screenshot-mobile.png",
        sizes: "750x1334", // Replace with your actual mobile screenshot dimensions
        type: "image/png",
        form_factor: "narrow", // Targets mobile layout
        label: "Crispy Duck on Mobile",
      },
      {
        src: "/screenshot-desktop.png",
        sizes: "1920x1080", // Replace with your actual desktop screenshot dimensions
        type: "image/png",
        form_factor: "wide", // Targets desktop layout
        label: "Crispy Duck on Desktop",
      },
    ],
  };
}
