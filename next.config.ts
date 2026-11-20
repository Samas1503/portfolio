import type { NextConfig } from "next";
import { wgslTurbopackRule } from "@vgpu/wgsl/next";

type WebpackConfig = { module?: { rules?: unknown[] } };

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // pdfkit loads its standard fonts with a dynamic require that file tracing misses.
  outputFileTracingIncludes: {
    "/api/cv": ["./node_modules/pdfkit/js/standard-fonts/**", "./node_modules/pdfkit/js/data/**"],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
      allowedOrigins: ["*"],
    },
  },
  turbopack: {
    rules: {
      "*.wgsl": wgslTurbopackRule({ minify: true }),
    },
  },
  webpack(config: WebpackConfig) {
    config.module ??= {};
    config.module.rules ??= [];
    config.module.rules.push({
      test: /\.wgsl$/,
      loader: "@vgpu/wgsl/loader-webpack",
      options: { minify: true },
    });
    return config;
  },
};

export default nextConfig;
