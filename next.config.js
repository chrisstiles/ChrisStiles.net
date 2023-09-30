module.exports = withBundleAnalyzer({
  reactStrictMode: true,
  swcMinify: true,
  productionBrowserSourceMaps: process.env.SOURCE_MAP === 'true',
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      exclude: /\.embed\.svg$/,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack', 'svgo-loader']
    });

    config.module.rules.push({
      test: /css-houdini-squircle/,
      type: 'asset'
    });

    config.experiments = {
      ...config.experiments,
      topLevelAwait: true
    };

    return config;
  },
  experimental: {
    modularizeImports: {
      lodash: {
        transform: 'lodash/{{member}}'
      }
    }
  }
});

function withBundleAnalyzer(config) {
  if (process.env.ANALYZE === 'true') {
    return require('@next/bundle-analyzer')({
      enabled: true
    })(config);
  }

  return config;
}
