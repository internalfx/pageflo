
// let _ = require('lodash')
const { gql } = require('apollo-server-koa')
// let { updateTags } = require('../utils.js')
// let { listSubFields } = require('../../utils.js')

const typeDefs = gql`
  type PublicationConnection {
    count: Int
    pageCount: Int
    items: [Publication]
  }

  type Publication {
    _key: ID!
    title: String
    createdAt: DateTime
    updatedAt: DateTime
  }

  extend type Query {
    allPublications (
      page: Int = 1,
      pageSize: Int = 10,
      search: String = ""
    ): PublicationConnection
    getPublication (_key: ID): Publication
  }

  input PublicationInput {
    _key: ID
    _id: ID
    title: String
  }

  extend type Mutation {
    upsertPublication (publication: PublicationInput!): Publication
    destroyPublication (_key: ID!): Publication
  }
`

const resolvers = {
  Query: {
    allPublications: async function (obj, args, ctx, info) {
      const offset = args.pageSize * (args.page - 1)
      const search = `%${args.search}%`

      const { items, count } = await ctx.arango.qNext(ctx.aql`
        let items = (
          FOR org IN publications
            FILTER LIKE(org.title, ${search}, true)
            SORT org.title DESC
            RETURN org
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
    getPublication: async function (obj, args, ctx, info) {
      if (args._key == null) { return }
      return ctx.arango.qNext(ctx.aql`
        RETURN DOCUMENT('publications', ${args._key})
      `)
    }
  },
  Mutation: {
    upsertPublication: async function (obj, args, ctx, info) {
      let record = args.publication

      record.updatedAt = new Date()

      if (record._key == null) {
        record.createdAt = new Date()
        record = await ctx.arango.qNext(ctx.aql`
          INSERT ${record} INTO publications RETURN NEW
        `)
      } else {
        record = await ctx.arango.qNext(ctx.aql`
          UPDATE ${record._key} WITH ${record} IN publications RETURN NEW
        `)
      }

      // await updateTags(publication, ctx)

      return record
    },
    destroyPublication: async function (obj, args, ctx, info) {
      await ctx.arango.qNext(ctx.aql`
        REMOVE { _key: ${args._key} } IN publications RETURN OLD
      `)
    }
  },
  Publication: {
  }
}

module.exports = {
  typeDefs,
  resolvers
}
