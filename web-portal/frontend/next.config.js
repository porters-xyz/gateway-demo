/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    config.module.rules.push({
      test: /\.(woff|woff2|eot|ttf|otf)$/,
      use: [
        {
          loader: "file-loader",
          options: {
            outputPath: "static/fonts/",
            publicPath: "/_next/static/fonts/",
            name: "[name].[ext]",
          },
        },
      ],
    });
    return config;
  },
  images: {
    domains: ["api.web3modal.com", "tokens.1inch.io"],
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
