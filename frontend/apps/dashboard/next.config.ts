import type { NextConfig } from "next";
import { withMicrofrontends } from "@vercel/microfrontends/next/config";

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {},
  async rewrites() {
    return [
      {
        source: "/backend/:path*",
        destination: "http://localhost:5000/:path*",
      },
    ];
  },
};

export default withMicrofrontends(nextConfig);
