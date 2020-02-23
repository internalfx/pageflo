
// let _ = require('lodash')
const { gql } = require('apollo-server-koa')
// let { listSubFields } = require('../../utils.js')
const { uniqueId } = require('../../lib/utils.js')

const typeDefs = gql`
  type AccessKeyConnection {
    count: Int
    pageCount: Int
    items: [AccessKey]
  }

  type AccessKey {
    _key: ID!
    publication_key: ID!
    title: String
    environment: String
    apikey: String
    createdAt: DateTime
    updatedAt: DateTime
  }

  extend type Query {
    allAccessKeys (
      publication_key: ID = null,
      page: Int = 1,
      pageSize: Int = 10,
      search: String = ""
    ): AccessKeyConnection
    getAccessKey (_key: ID): AccessKey
  }

  input AccessKeyInput {
    _key: ID
    publication_key: ID!
    title: String
    environment: String!
  }

  extend type Mutation {
    upsertAccessKey (accessKey: AccessKeyInput!): AccessKey
    destroyAccessKey (_key: ID!): AccessKey
  }
`

const resolvers = {
  Query: {
    allAccessKeys: async function (obj, args, ctx, info) {
      const offset = args.pageSize * (args.page - 1)
      const search = `%${args.search}%`

      const { items, count } = await ctx.arango.qNext(ctx.aql`
        let items = (
          FOR item IN accessKeys
            FILTER item.publication_key == ${args.publication_key}
            FILTER LIKE(item.title, ${search}, true)
            SORT item.title DESC
            RETURN item
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
    getAccessKey: async function (obj, args, ctx, info) {
      if (args._key == null) { return }
      return ctx.arango.qNext(ctx.aql`
        RETURN DOCUMENT('accessKeys', ${args._key})
      `)
    }
  },
  Mutation: {
    upsertAccessKey: async function (obj, args, ctx, info) {
      let record = args.accessKey

      record.updatedAt = new Date()

      if (record._key == null) {
        record.apikey = uniqueId(40)
        record.createdAt = new Date()
        record = await ctx.arango.qNext(ctx.aql`
          INSERT ${record} INTO accessKeys RETURN NEW
        `)
      } else {
        record = await ctx.arango.qNext(ctx.aql`
          UPDATE ${record._key} WITH ${record} IN accessKeys RETURN NEW
        `)
      }

      return record
    },
    destroyAccessKey: async function (obj, args, ctx, info) {
      await ctx.arango.qNext(ctx.aql`
        REMOVE { _key: ${args._key} } IN accessKeys RETURN OLD
      `)
    }
  },
  AccessKey: {
  }
}

module.exports = {
  typeDefs,
  resolvers
}
