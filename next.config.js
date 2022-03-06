// @ts-check

/** @type {import('next').NextConfig} */
module.exports = {
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
