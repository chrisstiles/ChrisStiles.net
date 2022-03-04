// @ts-check

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  swcMinify: true,
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      exclude: /\.embed\.svg$/,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack', 'svgo-loader']
    });

    return config;
  }
};

module.exports = config;
