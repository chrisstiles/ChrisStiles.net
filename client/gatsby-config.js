const postcssCustomProperties = require('postcss-custom-properties');

module.exports = {
  siteMetadata: {
    title: 'Chris Stiles',
    description: 'Chris Stiles website',
    author: '@chrisryanstiles'
  },
  proxy: {
    prefix: '/api',
    url: 'http://localhost:8080'
  },
  plugins: [
    'gatsby-plugin-react-helmet',
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'images',
        path: `${__dirname}/src/images`
      }
    },
    {
      resolve: 'gatsby-plugin-sass',
      options: {
        postCssPlugins: [postcssCustomProperties()]
      }
    },
    'gatsby-plugin-react-svg',
    'gatsby-transformer-sharp',
    'gatsby-plugin-sharp',
    {
      resolve: 'gatsby-plugin-express',
      options: {
        output: 'gatsby-routes.json'
      }
    },
    {
      resolve: 'gatsby-plugin-typescript',
      options: {
        isTSX: true,
        allExtensions: true
      }
    },
    {
      resolve: 'gatsby-plugin-manifest',
      options: {
        name: 'gatsby-starter-default',
        short_name: 'starter',
        start_url: '/',
        background_color: '#663399',
        theme_color: '#663399',
        display: 'minimal-ui',
        icon: 'src/images/gatsby-icon.png'
      }
    },
    {
      resolve: 'gatsby-plugin-alias-imports',
      options: {
        alias: {
          '@components': 'src/components',
          '@helpers$': 'src/utils/helpers',
          '@images': 'src/images',
          '@layout': 'src/components/Layout',
          '@styles': 'src/styles',
          '@utils': 'src/utils'
        },
        extensions: ['.js', '.ts', '.tsx', '.scss']
      }
    }
  ]
};
