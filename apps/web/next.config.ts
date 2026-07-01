import type { NextConfig } from "next";

// Static export so the site deploys to GitHub Pages (and any static host) with no
// server. All pages — home, every document, every topic — are pre-rendered to HTML
// at build time; search runs client-side over the bundled corpus. When the Phase 2
// backend lands, drop `output: "export"` and point lib/api.ts at the API instead.
//
// NEXT_PUBLIC_BASE_PATH is "/unredacted" on GitHub Pages (project sites are served
// from a subpath) and empty locally.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  // GitHub Pages serves folders, so /search must be /search/index.html.
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
