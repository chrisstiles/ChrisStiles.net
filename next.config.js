const loaderUtils = require('loader-utils');
const path = require('path');

module.exports = withBundleAnalyzer({
  // reactStrictMode: true,
  swcMinify: true,
  productionBrowserSourceMaps: process.env.SOURCE_MAP === 'true',
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      exclude: /\.embed\.svg$/,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack', 'svgo-loader']
    });

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

function findLoaderRules(config, loader) {
  const rules = config.module.rules.find(({ oneOf }) => !!oneOf);

  if (!rules) {
    return [];
  }

  let loaderRules = [];

  config.module.rules.forEach(rule => {
    if (!Array.isArray(rule.oneOf)) {
      return;
    }

    rule.oneOf.forEach(entry => {
      const index = [entry.use].flat().findIndex(useRule => {
        if (typeof useRule !== 'string') {
          useRule = useRule?.loader ?? '';
        }

        return useRule?.includes(loader);
      });

      if (index > -1) {
        let loaderRule = entry.use[index];

        if (typeof loaderRule === 'string') {
          const loaderRule = { loader: loaderRule };
          entry.use[index] = loaderRule;
        }

        loaderRules.push(loaderRule);
      }
    });
  });

  return loaderRules;
}

function getLocalIdent(context, localIdentName, localName, options) {
  const fileNameOrFolder = context.resourcePath.match(
    /index\.module\.(css|scss|sass)$/
  )
    ? '[folder]'
    : '[name]';

  const hash = loaderUtils.getHashDigest(
    path.posix.relative(context.rootContext, context.resourcePath) + localName,
    'md5',
    'base64',
    5
  );

  const className = loaderUtils.interpolateName(
    context,
    fileNameOrFolder + '_' + localName + '__' + hash,
    options
  );

  return className.replace('.module_', '_').toLowerCase();
}
