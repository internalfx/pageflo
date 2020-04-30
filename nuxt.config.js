
const path = require('path')

module.exports = {
  apollo: {
    clientConfigs: {
      default: {
        httpLinkOptions: {
          credentials: 'same-origin'
        }
      }
    }
  },
  auth: {
    strategies: {
      local: {
        endpoints: {
          login: { url: '/api/auth/login', method: 'post', propertyName: 'token' },
          logout: { url: '/api/auth/logout', method: 'post' },
          user: { url: '/api/auth/user', method: 'get', propertyName: 'user' }
        }
      }
    },
    token: {
      prefix: 'pageflo.'
    },
    cookie: {
      options: {
        maxAge: 60 * 60 * 24 * 300
      }
    },
    localStorage: {},
    rewriteRedirects: true,
    fullPathRedirect: true
  },
  axios: {},
  build: {
    babel: {
      presets: function ({ isServer }) {
        return [
          [
            require.resolve('@nuxt/babel-preset-app'),
            // require.resolve('@nuxt/babel-preset-app-edge'), // For nuxt-edge users
            {
              buildTarget: isServer ? 'server' : 'client',
              corejs: { version: 3 }
            }
          ]
        ]
      }
    },
    extend: function (config, { isDev, isClient }) {
      if (isDev && isClient) {
        config.devtool = 'inline-source-map'
      }
    },
    parallel: true,
    splitChunks: {
      layouts: false,
      pages: false,
      commons: false
    }
  },
  css: [
  ],
  buildModules: [
    '@nuxtjs/vuetify'
  ],
  env: {},
  head: {
    title: 'PageFlo',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, minimal-ui' },
      { hid: 'description', name: 'description', content: 'PageFlo' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/icon.png' }
    ]
  },
  mode: 'spa',
  loading: { color: '#888888' },
  modules: [
    '@nuxtjs/apollo',
    '@nuxtjs/auth',
    '@nuxtjs/axios'
  ],
  plugins: [
    'plugins/fontAwesomeSolid.js',
    'plugins/graphClient.js',
    'plugins/startup.js'
  ],
  rootDir: path.join(__dirname),
  router: {
    middleware: [
      'auth'
    ],
    extendRoutes: function (routes, resolve) {
      routes.push({
        path: '/',
        redirect: '/publications'
      })
    }
  },
  srcDir: path.join(__dirname, 'client'),
  vuetify: {
    defaultAssets: false,
    optionsPath: path.join(__dirname, 'client', 'vuetify.options.js')
  }
}
