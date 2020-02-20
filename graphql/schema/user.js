
// let _ = require('lodash')
const { gql } = require('apollo-server-koa')
// let { listSubFields } = require('../../utils.js')

const typeDefs = gql`
  type User {
    _id: ID!
    _key: ID!
    email: String
    settings: JSON
    created_at: DateTime
    updated_at: DateTime
  }

  extend type Query {
    allUsers (page: Int = 1): [User]
    userById (_id: ID!): User
  }

  extend type Mutation {
    updateMySettings (_id: ID!, settings: JSON!): User
  }
`

const resolvers = {
  Query: {
    allUsers: async function (obj, args, ctx, info) {
      const cursor = await ctx.arango.query(ctx.aql`
        for x in user
          return x
      `)
      return cursor.all()
    },
    userById: async function (obj, args, ctx, info) {
      const cursor = await ctx.arango.query(ctx.aql`
        for x in user
          FILTER x._id == ${args._id}
          return x
      `)
      return cursor.next()
    }
  },
  Mutation: {
    updateMySettings: async function (obj, args, ctx, info) {
      const update = {
        settings: args.settings,
        updatedAt: new Date()
      }
      const cursor = await ctx.arango.query(ctx.aql`
        UPDATE ${ctx.user._key} WITH ${update} IN users RETURN NEW
      `)
      return cursor.next()
    }
  },
  User: {
  }
}

module.exports = {
  typeDefs,
  resolvers
}
