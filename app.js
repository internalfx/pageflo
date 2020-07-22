require(`@babel/register`)({
  cwd: __dirname,
  plugins: [`@babel/plugin-transform-modules-commonjs`],
  only: [
    `./lib/*`
  ]
})

require(`./lib/cycle.js`)
const substruct = require(`@internalfx/substruct`)
const { ApolloServer, AuthenticationError, UserInputError } = require(`apollo-server-koa`)
const { typeDefs, resolvers } = require(`./graphql/index.js`)
const path = require(`path`)
const numeral = require(`numeral`)

const configPath = path.join(process.cwd(), `config.js`)
const userConfig = require(configPath)

substruct.configure({
  ...userConfig,
  runDir: process.cwd(),
  appDir: __dirname
})

const main = async function () {
  const apollo = new ApolloServer({
    typeDefs,
    resolvers,
    formatError: function (error) {
      const data = JSON.decycle(error)
      console.log(`================================================================== GRAPHQL ERROR`)
      console.dir(data, { colors: true, depth: null })
      console.log(`================================================================================`)
      return data
    },
    context: async function ({ ctx }) {
      const session = ctx.state.session
      const { arango, aql, getNumber } = substruct.services.arango
      const afs = substruct.services.arangofs
      const utils = substruct.services.utils
      const config = substruct.config

      const user = await arango.qNext(aql`
        for u in users
          filter u._key == ${session.userKey || null}
          return u
      `)

      if (user == null) {
        throw new AuthenticationError(`You are not logged in`)
      }

      const userInputError = function (message, data) {
        throw new UserInputError(message, data)
      }

      return {
        session,
        arango,
        aql,
        getNumber,
        afs,
        utils,
        config,
        user,
        services: substruct.services,

        userInputError
      }
    }
  })

  await substruct.load()
  await substruct.start()

  apollo.applyMiddleware({ app: substruct.koa, path: `/api/graphql` })
  console.log(`Server Started...`)
  // setInterval(function () {
  //   const stats = {
  //     rss: numeral(process.memoryUsage().rss).format('0.00b'),
  //     heapTotal: numeral(process.memoryUsage().heapTotal).format('0.00b'),
  //     heapUsed: numeral(process.memoryUsage().heapUsed).format('0.00b'),
  //     external: numeral(process.memoryUsage().external).format('0.00b')
  //   }
  //   console.log(stats)
  // }, 600000)
}

main().catch(function (err) {
  console.log(err)
})
