/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  webpack: (config) => {
    config.externals.push("pino-pretty");
    config.resolve.fallback = { fs: false, net: false, tls: false };
    return config;
  },
  async redirects() {
    return [
      {
        source: "/siwe",
        destination: String(process.env.API_ENDPOINT) + "siwe",
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
