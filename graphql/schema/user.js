
// let _ = require('lodash')
const { gql } = require('apollo-server-koa')
// let { listSubFields } = require('../../utils.js')

const typeDefs = gql`
type UserConnection {
    count: Int
    pageCount: Int
    items: [User]
  }

  type User {
    _key: ID!
    fistName: String
    lastName: String
    email: String
    createdAt: DateTime
    updatedAt: DateTime
  }

  input UserInput {
    _key: ID
    fistName: String
    lastName: String
    email: String
  }

  extend type Query {
    allUsers (
      page: Int = 1,
      pageSize: Int = 10,
      search: String = ""
    ): UserConnection
    getUser (_key: ID!): User
  }

  extend type Mutation {
    upsertUser (user: UserInput!): User
  }
`

const resolvers = {
  Query: {
    allUsers: async function (obj, args, ctx, info) {
      const offset = args.pageSize * (args.page - 1)
      const search = `%${args.search || ''}%`

      const { items, count } = await ctx.arango.qNext(ctx.aql`
        let items = (
          FOR user IN users
            FILTER LIKE(user.email, ${search}, true)
            SORT user.email ASC
            RETURN user
        )

        RETURN {
          items: SLICE(items, ${offset}, ${args.pageSize}),
          count: COUNT(items)
        }
      `)

      return {
        count,
        pageCount: Math.ceil(count / args.pageSize),
        items
      }
    },
    getUser: async function (obj, args, ctx, info) {
      return ctx.arango.qNext(ctx.aql`
        RETURN DOCUMENT('users', ${args._key})

      `)
    }
  },
  Mutation: {
    upsertUser: async function (obj, args, ctx, info) {
      let record = args.user

      record.updatedAt = new Date()

      if (record._key == null) {
        record.createdAt = new Date()
        record = await ctx.arango.qNext(ctx.aql`
          INSERT ${record} INTO users RETURN NEW
        `)
      } else {
        record = await ctx.arango.qNext(ctx.aql`
          UPDATE ${record._key} WITH ${record} IN users RETURN NEW
        `)
      }

      return record
    }
  },
  User: {
  }
}

module.exports = {
  typeDefs,
  resolvers
}
