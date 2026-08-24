import type { NextConfig } from "next";

const githubPages = process.env.GITHUB_PAGES === "1";

const nextConfig: NextConfig = {
  basePath: githubPages ? "/shf-arshjul" : "",
  assetPrefix: githubPages ? "/shf-arshjul" : "",
  trailingSlash: githubPages,
};

export default nextConfig;
