import type { NextConfig } from "next";
import { wgslTurbopackRule } from "@vgpu/wgsl/next";

type WebpackConfig = { module?: { rules?: unknown[] } };

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
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
