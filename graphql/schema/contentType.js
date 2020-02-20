
// let _ = require('lodash')
const { gql } = require('apollo-server-koa')
// const { updateTags } = require('../utils.js')
// let { listSubFields } = require('../../utils.js')

const typeDefs = gql`
  type ContentTypeConnection {
    count: Int
    pageCount: Int
    items: [ContentType]
  }

  enum ContentType_contentMode {
    single
    multiple
  }

  type ContentType {
    _key: ID!
    publication_key: ID!
    title: String
    slug: String
    isWebpage: Boolean
    urlTemplate: String
    contentMode: ContentType_contentMode
    fields: [ContentTypeField]
    entries (
      page: Int = 1,
      pageSize: Int = 10
    ): EntryConnection
    createdAt: DateTime
    updatedAt: DateTime
  }

  input ContentTypeInput {
    _key: ID
    publication_key: ID!
    title: String
    slug: String
    isWebpage: Boolean
    urlTemplate: String
    contentMode: ContentType_contentMode
    fields: [ContentTypeFieldInput]
  }

  type ContentTypeField {
    id: ID!
    type: String
    label: String
    slug: String
    options: JSON
  }

  input ContentTypeFieldInput {
    id: ID!
    type: String
    label: String
    slug: String
    options: JSON
  }

  extend type Query {
    allContentTypes (
      publication_key: ID = null,
      page: Int = 1,
      pageSize: Int = 10,
      search: String = ""
    ): ContentTypeConnection
    getContentType (_key: ID): ContentType
  }

  extend type Mutation {
    upsertContentType (contentType: ContentTypeInput!): ContentType
    destroyContentType (_key: ID!): ContentType
  }
`

const resolvers = {
  Query: {
    allContentTypes: async function (obj, args, ctx, info) {
      const offset = args.pageSize * (args.page - 1)
      const search = `%${args.search}%`

      // console.log(args)

      const { items, count } = await ctx.arango.qNext(ctx.aql`
        let items = (
          FOR item IN contentTypes
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
    getContentType: async function (obj, args, ctx, info) {
      if (args._key == null) { return }
      return ctx.arango.qNext(ctx.aql`
        RETURN DOCUMENT('contentTypes', ${args._key})
      `)
    }
  },
  Mutation: {
    upsertContentType: async function (obj, args, ctx, info) {
      let record = args.contentType

      const conflicts = ctx.services.contentTypeValidator.getConflicts(record)

      if (conflicts.fieldIds.length > 0) {
        ctx.userInputError('Some content type fields have the same name.', { conflicts })
      }

      record.updatedAt = new Date()

      if (record._key == null) {
        record.createdAt = new Date()
        record = await ctx.arango.qNext(ctx.aql`
          INSERT ${record} INTO contentTypes RETURN NEW
        `)
      } else {
        const prevRecord = await ctx.arango.qNext(ctx.aql`
          RETURN DOCUMENT('contentTypes', ${record._key})
        `)

        await ctx.services.contentMigration.migrateContent(record, prevRecord)

        record = await ctx.arango.qNext(ctx.aql`
          UPDATE ${record._key} WITH ${record} IN contentTypes RETURN NEW
        `)
      }

      return record
    },
    destroyContentType: async function (obj, args, ctx, info) {
      const record = await ctx.arango.qNext(ctx.aql`
        REMOVE { _key: ${args._key} } IN contentTypes RETURN OLD
      `)

      await ctx.arango.q(ctx.aql`
        FOR item IN entries
          FILTER item.contentType_key == ${args._key}
          REMOVE item IN entries
      `)

      return record
    }
  },
  ContentType: {
    entries: async function (obj, args, ctx, info) {
      const offset = args.pageSize * (args.page - 1)

      const { items, count } = await ctx.arango.qNext(ctx.aql`
        let items = (
          FOR item IN entries
            FILTER item.contentType_key == ${obj._key}
            SORT item.updatedAt DESC
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
    }
  }
}

module.exports = {
  typeDefs,
  resolvers
}
