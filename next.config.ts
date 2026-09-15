import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Menos variantes = menos cola en el optimizador (preview no se clava).
    deviceSizes: [640, 750, 1080, 1280, 1920],
    imageSizes: [256, 384, 640],
    qualities: [75, 85, 90],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        pathname: "/portales-prod-images/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
