import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  experimental: {
    // Most visitors are first-time visitors (often recruiters), so styles arrive
    // with the HTML instead of as a separate render-blocking request.
    inlineCss: true,
  },
};

export default nextConfig;
