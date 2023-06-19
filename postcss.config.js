const prodOnlyPlugins =
  process.env.NODE_ENV !== 'production'
    ? {}
    : {
        'postcss-pxtorem': {
          rootValue: 18,
          selectorBlackList: [/^html$/]
        }
      };

module.exports = {
  plugins: {
    ...prodOnlyPlugins,
    // 'postcss-inset': {},
    'postcss-logical': {},
    'postcss-flexbugs-fixes': {},
    'postcss-font-variant': {},
    'postcss-preset-env': {
      autoprefixer: {
        flexbox: 'no-2009'
      },
      stage: 3,
      features: {
        'custom-properties': false
      }
    }
  }
};
