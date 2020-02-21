
// General Configuration
//
// options in this file are overidden by keys in environment specific files. e.g. dev.js or prod.js

module.exports = {
  appName: 'PageFlo',
  middleware: [
    'performance',
    'body',
    'httpError',
    'session',
    'nuxtRender',
    'router'
  ],
  koa: {
    proxy: false
  },
  koaBody: {
    multipart: false
  },
  services: [
    'init',
    'utils',
    'nuxt',
    'arango',
    'arangofs',
    'schema',
    'sessionStorage',
    // 'settings',
    'bcrypt',
    // 'mailer',
    'images',
    'contentResolver',
    'contentMigration',
    'contentTypeValidator'
  ],
  session: {
    sessionCookieName: 'auth.pageflo.local',
    sessionCookieMaxAge: 1000 * 60 * 60 * 24 * 365
  }
}
