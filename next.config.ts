import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    cpus: 1,
    workerThreads: false,
    memoryBasedWorkersCount: true,
  },
};

export default withSentryConfig(nextConfig, {
  silent: true,
  org: "gic",
  project: "intelligence-platform",
  widenClientFileUpload: true,
  sourcemaps: { disable: true }
});
