/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "standalone",
    webpack: (config) => {
        config.externals.push("pino-pretty", "lokijs", "encoding");
        return config;
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "api.web3modal.com",
                port: "",
            },
            {
                protocol: "https",
                hostname: "ethereum-optimism.github.io",
            },
        ],
    },
    async rewrites() {
        return [
            {
                source: "/api/:path*",
                destination: `${process.env.API_ENDPOINT}:path*`,
            },
        ];
    },
};

module.exports = nextConfig;
