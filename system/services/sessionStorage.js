const substruct = require(`@internalfx/substruct`)
const _ = require(`lodash`)
// const lruCache = require('lru-cache')

module.exports = async function (config) {
  const { arango, aql } = substruct.services.arango
  // let cache = lruCache({
  //   max: 10000
  // })

  config.session.load = async function (token) {
    let data = {}

    if (token) {
      // data = cache.get(token)
      data = null

      if (data == null) {
        const storedSession = await arango.qNext(aql`
          FOR x IN sys_sessions
            FILTER x._key == ${token}
            return x
        `)

        if (storedSession != null) {
          data = storedSession.data
          // cache.set(token, data)
        }
      }

      if (data == null) {
        data = {}
        // cache.set(token, data)
      }
    }

    return data
  }

  config.session.save = async function (token, data) {
    // cache.set(token, data)

    const obj = {
      _key: token,
      data
    }

    await arango.query(aql`
      UPSERT ${_.pick(obj, `_key`)} INSERT ${obj} REPLACE ${_.omit(obj, `_key`)} IN sys_sessions
    `)
  }
}
