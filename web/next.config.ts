import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // Fotos públicas del bucket "imagenes" de Supabase Storage
    remotePatterns: [
      new URL("https://dtrdbutpvutmxpapmbjw.supabase.co/storage/v1/object/public/**"),
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
