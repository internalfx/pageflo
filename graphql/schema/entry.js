
// const _ = require('lodash')
const { gql } = require('apollo-server-koa')
// let { updateTags } = require('../utils.js')
// let { listSubFields } = require('../../utils.js')

const typeDefs = gql`
  type EntryConnection {
    count: Int
    pageCount: Int
    items: [Entry]
  }

  type Entry {
    _key: ID!
    _id: ID!
    number: Int
    contentType_key: ID!
    contentType: ContentType
    title: String
    content: JSON
    publishDate: DateTime
    createdAt: DateTime
    updatedAt: DateTime
  }

  input EntryInput {
    _key: ID
    _id: ID
    number: Int
    contentType_key: ID!
    title: String
    content: JSON
    publishDate: DateTime
  }

  extend type Query {
    allEntries (
      contentType_key: ID!,
      page: Int = 1,
      pageSize: Int = 10,
      search: String = ""
    ): EntryConnection
    getEntry (_key: ID): Entry
    getEntryReferences (_keys: [ID]): [Entry]
    autocompleteEntryReference (
      contentType_keys: [ID!],
      entry_numbers: [Int],
      search: String = ""
    ): [Entry]
  }

  extend type Mutation {
    upsertEntry (entry: EntryInput!): Entry
    destroyEntry (number: Int!): Entry

    saveEntry (entry: EntryInput!): Entry
    publishEntry (entry: EntryInput!): Entry
  }
`

const resolvers = {
  Query: {
    allEntries: async function (obj, args, ctx, info) {
      const offset = args.pageSize * (args.page - 1)
      const search = `%${args.search}%`

      const { items, count } = await ctx.arango.qNext(ctx.aql`
        let items = (
          FOR item IN entries
            FILTER item.contentType_key == ${args.contentType_key}
            FILTER LIKE(item.title, ${search}, true)
            SORT item.createdAt DESC
            COLLECT num = item.number INTO entryGroup
            RETURN FIRST(entryGroup).item
        )

        let sortedItems = (
          FOR item in items
            SORT item.createdAt DESC
            RETURN item
        )

        RETURN {
          items: SLICE(sortedItems, ${offset}, ${args.pageSize}),
          count: COUNT(sortedItems)
        }
      `)

      return {
        count,
        pageCount: Math.ceil(count / args.pageSize),
        items
      }
    },
    getEntry: async function (obj, args, ctx, info) {
      if (args._key == null) { return }
      return ctx.arango.qNext(ctx.aql`
        RETURN DOCUMENT('entries', ${args._key})
      `)
    },
    getEntryReferences: async function (obj, args, ctx, info) {
      if (args._keys == null) { return [] }

      return ctx.arango.qAll(ctx.aql`
        FOR entry IN entries
          FILTER entry._key IN ${args._keys}
          SORT entry.updatedAt DESC
          RETURN entry
      `)
    },
    autocompleteEntryReference: async function (obj, args, ctx, info) {
      const search = args.search ? `%${args.search}%` : '%%'
      const contentTypeKeys = args.contentType_keys || []
      const entryNumbers = args.entry_numbers || []

      return ctx.arango.qAll(ctx.aql`
        let entry_numbers = (
          FOR entry IN entries
            FILTER entry.contentType_key IN ${contentTypeKeys}
            FILTER LIKE(entry.title, ${search}, true)
            SORT entry.createdAt DESC
            COLLECT num = entry.number INTO entryGroup
            LIMIT 10
            RETURN num
        )

        FOR entry IN entries
            FILTER entry.number IN entry_numbers OR entry.number IN ${entryNumbers}
            SORT entry.createdAt DESC
            COLLECT num = entry.number INTO entryGroup
            RETURN FIRST(entryGroup).entry
      `)
    }
  },
  Mutation: {
    upsertEntry: async function (obj, args, ctx, info) {
      let record = args.entry

      if (record.number == null) {
        record.number = await ctx.getNumber('entry')
      }

      record.createdAt = new Date()
      record.updatedAt = new Date()

      record = await ctx.arango.qNext(ctx.aql`
        INSERT ${record} INTO entries RETURN NEW
      `)

      // await updateTags(record, ctx)

      return record
    },
    saveEntry: async function (obj, args, ctx, info) {
      let record = args.entry

      if (record.number == null) {
        record.number = await ctx.getNumber('entry')
      }

      record.publishDate = null
      record.createdAt = new Date()
      record.updatedAt = new Date()

      record = await ctx.arango.qNext(ctx.aql`
        INSERT ${record} INTO entries RETURN NEW
      `)

      return record
    },
    publishEntry: async function (obj, args, ctx, info) {
      let record = args.entry

      if (record.number == null) {
        record.number = await ctx.getNumber('entry')
      }

      record.publishDate = record.publishDate || new Date()
      record.createdAt = new Date()
      record.updatedAt = new Date()

      record = await ctx.arango.qNext(ctx.aql`
        INSERT ${record} INTO entries RETURN NEW
      `)

      await ctx.arango.q(ctx.aql`
        FOR item IN entries
          FILTER item.number == ${record.number} && item.publishDate == null
          REMOVE item IN entries
      `)

      // await updateTags(record, ctx)

      return record
    },
    // upsertEntry: async function (obj, args, ctx, info) {
    //   let record = args.entry

    //   record.updatedAt = new Date()

    //   if (record._key == null) {
    //     record.createdAt = new Date()
    //     record = await ctx.arango.qNext(ctx.aql`
    //       INSERT ${record} INTO entries RETURN NEW
    //     `)
    //   }

    //   record = await ctx.arango.qNext(ctx.aql`
    //     UPDATE ${record._key} WITH ${record} IN entries RETURN NEW
    //   `)

    //   // await updateTags(record, ctx)

    //   return record
    // },
    destroyEntry: async function (obj, args, ctx, info) {
      await ctx.arango.qNext(ctx.aql`
        FOR item IN entries
          FILTER item.number == ${args.number}
          REMOVE item IN entries
      `)
    }
  },
  Entry: {
    contentType: async function (obj, args, ctx, info) {
      return ctx.arango.qNext(ctx.aql`
        RETURN DOCUMENT('contentTypes', ${obj.contentType_key})
      `)
    }
  }
}

module.exports = {
  typeDefs,
  resolvers
}
