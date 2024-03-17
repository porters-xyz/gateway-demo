/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  env: {
    apiUrl: process.env.NEXT_PUBLIC_API_ENDPOINT,
  },
  webpack: (config) => {
    config.externals.push("pino-pretty");
    config.resolve.fallback = { fs: false, net: false, tls: false };
    return config;
  },
  async rewrites() {
    return [
      {
        source: "/siwe",
        destination: `${apiUrl}siwe`,
      },
    ];
  },
};

module.exports = nextConfig;
