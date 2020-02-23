const substruct = require('@internalfx/substruct')
const { arango, aql } = substruct.services.arango
const { resolveEntry } = substruct.services.contentResolver
const Promise = require('bluebird')
// const _ = require('lodash')

module.exports = {
  list: async function (ctx) {
    ctx.set('Access-Control-Allow-Origin', '*')
    ctx.set('Access-Control-Allow-Headers', '*')

    if (ctx.method === 'OPTIONS') {
      ctx.body = null
      return
    }

    const contentTypeSlug = ctx.state.params.content_type || null
    const apikey = ctx.headers.apikey || null

    const accessKey = await arango.qNext(aql`
      FOR item IN accessKeys
        FILTER item.apikey == ${apikey}
        RETURN item
    `)

    if (accessKey == null) {
      return ctx.throw(403)
    }

    const env = accessKey.environment
    const publicationKey = accessKey.publication_key

    const contentType = await arango.qNext(aql`
      FOR item IN contentTypes
        FILTER item.publication_key == ${publicationKey}
        FILTER item.slug == ${contentTypeSlug}
        RETURN item
    `)

    if (contentType == null) {
      return ctx.throw(400, 'Content Type not found')
    }

    let entryNumbers = []

    entryNumbers = await arango.qAll(aql`
      FOR item IN entries
        FILTER item.contentType_key == ${contentType._key}
        SORT ${env === 'dev' ? 'item.createdAt' : 'item.publishDate'} DESC
        COLLECT num = item.number INTO entryGroup
        RETURN FIRST(entryGroup).item.number
    `)

    const entries = await Promise.map(entryNumbers, async function (entryNumber) {
      return resolveEntry(entryNumber, { env })
    })

    ctx.body = entries
  },

  show: async function (ctx) {
    ctx.set('Access-Control-Allow-Origin', '*')
    ctx.set('Access-Control-Allow-Headers', '*')

    if (ctx.method === 'OPTIONS') {
      ctx.body = null
      return
    }

    const contentTypeSlug = ctx.state.params.content_type || null
    let entryNumber = isNaN(ctx.state.params.number) ? null : parseInt(ctx.state.params.number, 10)
    const apikey = ctx.headers.apikey || null

    if (entryNumber == null) {
      return ctx.throw(403, 'number is required')
    }

    const accessKey = await arango.qNext(aql`
      FOR item IN accessKeys
        FILTER item.apikey == ${apikey}
        RETURN item
    `)

    if (accessKey == null) {
      return ctx.throw(403)
    }

    const env = accessKey.environment
    const publicationKey = accessKey.publication_key

    const contentType = await arango.qNext(aql`
      FOR item IN contentTypes
        FILTER item.publication_key == ${publicationKey}
        FILTER item.slug == ${contentTypeSlug}
        RETURN item
    `)

    if (contentType == null) {
      return ctx.throw(400, 'Content Type not found')
    }

    entryNumber = await arango.qNext(aql`
      FOR entry IN entries
        FILTER entry.contentType_key == ${contentType._key} && entry.number == ${entryNumber}
        SORT ${env === 'dev' ? 'entry.createdAt' : 'entry.publishDate'} DESC
        LIMIT 1
        RETURN entry.number
    `)

    ctx.body = await resolveEntry(entryNumber, { env })
  }
}
