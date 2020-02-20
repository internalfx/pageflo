
let { GraphQLScalarType } = require('graphql')
let { gql } = require('apollo-server-koa')
let moment = require('moment')

let typeDefs = gql`
  scalar DateTime
`

let resolvers = {
  DateTime: new GraphQLScalarType({
    name: 'DateTime',
    description: 'Date/Time value',
    parseValue: function (value) {
      let result = null

      if (value != null) {
        result = moment(value).toDate()
      }

      return result
    },
    serialize: function (value) {
      let result = null

      if (value != null) {
        result = moment(value).toISOString()
      }

      return result
    },
    parseLiteral: function (ast) {
      console.log(ast)
      // if (ast.kind === Kind.INT) {
      //   return parseInt(ast.value, 10)
      // }
      return null
    }
  })
}

module.exports = {
  typeDefs,
  resolvers
}
