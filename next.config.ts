import type { NextConfig } from "next";

const figmaPreviewHostname = process.env.FIGMA_PUBLIC_URL
  ? new URL(process.env.FIGMA_PUBLIC_URL).hostname
  : "app-sjtb6wf3pdc5qzbjcv7yc73wzc6ctcgmsuqg2v26ndhxopojtmej.makeproxy-c.figma.site";

const nextConfig: NextConfig = {
  allowedDevOrigins: process.env.FIGMA ? [figmaPreviewHostname] : undefined,
};

export default nextConfig;
