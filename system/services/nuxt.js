
module.exports = async function (config) {
  const { Nuxt, Builder } = require('nuxt')
  const nuxtConfig = require('../../nuxt.config.js')

  // Config Overrides
  nuxtConfig.dev = (config.env !== 'production')
  nuxtConfig.axios.baseURL = config.baseURL
  nuxtConfig.apollo.clientConfigs.default.httpEndpoint = `${config.baseURL}/api/graphql`
  nuxtConfig.env.baseURL = config.baseURL
  nuxtConfig.env.isDevelopment = (config.env === 'development')

  const nuxt = new Nuxt(nuxtConfig)

  await nuxt.ready()

  if (config.argv.build === true) {
    new Builder(nuxt).build()
  }

  return nuxt
}
