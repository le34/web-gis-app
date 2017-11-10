/* eslint no-new: 0 */
const webpack = require('webpack')
module.exports = {
  /*
  ** Headers of the page
  */
  mode: 'spa',
  router: {
    middleware: 'check-auth'
  },
  head: {
    link: [
      { rel: 'stylesheet', type: 'text/css', href: 'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons' },
      { rel: 'stylesheet', type: 'text/css', href: 'https://fonts.googleapis.com/css?family=Pacifico:400' }
    ],
    meta: [
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, minimal-ui' }
    ]
  },
  modules: [
    // Simple usage
    // '@nuxtjs/pwa',
    // With options
    ['@nuxtjs/pwa', {
      optimize: false,
      meta: {
        viewport: false,
        name: 'Survey'
      }
    }],
    ['@nuxtjs/axios', {
      baseURL: 'http://localhost:3000/api',
      browserBaseURL: '/api'
    }]
  ],
  /*
  ** Global CSS
  */
  css: [
    { src: '~/assets/style/app.styl', lang: 'styl' }
  ],
  /*
  ** Add axios globally
  */
  plugins: [
    '~/plugins/vuetify.js',
    '~/plugins/feathers-client.js'
  ],
  build: {
    vendor: ['axios', 'vuetify'],
    plugins: [
      new webpack.EnvironmentPlugin({
        FEATHERS: 'http://localhost:3030'
      })
    ],
    /*
    ** Run ESLINT on save
    */
    extend (config, ctx) {
      if (ctx.isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }
      if (!ctx.dev && ctx.isClient) {
        config.module.noParse = /(mapbox-gl)\.js$/
      }
    }
  }
}
