
// let _ = require('lodash')
const { gql } = require('apollo-server-koa')
// let { updateTags } = require('../utils.js')
// let { listSubFields } = require('../../utils.js')

const typeDefs = gql`
  type FileConnection {
    count: Int
    pageCount: Int
    items: [File]
  }

  type File {
    _key: ID!
    publication_key: ID!
    filename: String
    uploadedFilename: String
    title: String
    caption: String
    altText: String
    description: String
    ext: String
    size: Int
    mimeType: String
    mimeClass: String
    colors: [String],
    sha256: String
    pixelWidth: Int
    pixelHeight: Int
    # tags: [String]
  }

  extend type Query {
    allFiles (
      publication_key: ID!,
      page: Int = 1,
      pageSize: Int = 10,
      search: String = "",
      fileType: JSON = null
    ): FileConnection
    getFile (_key: ID): File
  }

  input FileInput {
    _key: ID!
    title: String
    caption: String
    altText: String
    description: String
    # tags: [String]
  }

  extend type Mutation {
    updateFile (file: FileInput!): File
    destroyFile (_key: ID!): File
  }
`

const resolvers = {
  Query: {
    allFiles: async function (obj, args, ctx, info) {
      const offset = args.pageSize * (args.page - 1)
      const search = `%${args.search}%`
      let cursor = await ctx.arango.query(ctx.aql`
        FOR file IN files
          SORT file.updatedAt DESC
          FILTER file.publication_key == ${args.publication_key}
          FILTER LIKE(file.title, ${search}, true) OR LIKE(file.uploadedFilename, ${search}, true)
          FILTER ${args.fileType} == NULL OR file.mimeClass IN ${args.fileType} OR file.mimeType IN ${args.fileType}
          LIMIT ${offset}, ${args.pageSize}
          return file
      `)
      const items = await cursor.all()

      cursor = await ctx.arango.query(ctx.aql`
        FOR file IN files
          FILTER file.publication_key == ${args.publication_key}
          FILTER LIKE(file.title, ${search}, true) OR LIKE(file.uploadedFilename, ${search}, true)
          FILTER ${args.fileType} == NULL OR file.mimeClass IN ${args.fileType} OR file.mimeType IN ${args.fileType}
          COLLECT WITH COUNT INTO length
          RETURN length
      `)
      const count = await cursor.next()

      return {
        count,
        pageCount: Math.ceil(count / args.pageSize),
        items
      }
    },
    getFile: async function (obj, args, ctx, info) {
      if (args._key == null) { return }
      return ctx.arango.qNext(ctx.aql`
        RETURN DOCUMENT('files', ${args._key})
      `)
    }
  },
  Mutation: {
    updateFile: async function (obj, args, ctx, info) {
      const file = args.file
      // let targetTags = file.tags
      // delete file.tags

      // await updateTags(file, targetTags, ctx)

      file.updatedAt = new Date()
      return ctx.arango.qNext(ctx.aql`
        UPDATE ${file._key} WITH ${file} IN files RETURN NEW
      `)
    },
    destroyFile: async function (obj, args, ctx, info) {
      const file = await ctx.arango.qNext(ctx.aql`
        REMOVE { _key: ${args._key} } IN files RETURN OLD
      `)

      // await updateTags(file, [], ctx)

      await ctx.afs.deleteFiles({ filename: file.filename })
      return file
    }
  },
  File: {
    // tags: async function (obj, args, ctx, info) {
    //   let cursor = await ctx.arango.query(ctx.aql`
    //     FOR v IN 1 OUTBOUND ${obj._id} GRAPH 'pageflo'
    //       FILTER IS_SAME_COLLECTION('tags', v)
    //       RETURN v
    //   `)
    //   return cursor.all()
    // }
  }
}

module.exports = {
  typeDefs,
  resolvers
}
