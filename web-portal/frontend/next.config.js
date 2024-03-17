/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  webpack: (config) => {
    config.externals.push("pino-pretty");
    config.resolve.fallback = { fs: false, net: false, tls: false };
    return config;
  },
  async rewrites() {
    return [
      {
        source: "/siwe",
        destination: process.env.NEXT_PUBLIC_API_ENDPOINT + "siwe",
      },
    ];
  },
};

module.exports = nextConfig;
