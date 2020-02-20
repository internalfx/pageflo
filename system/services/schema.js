const substruct = require('@internalfx/substruct')
const Promise = require('bluebird')

module.exports = async function (config) {
  const { arango, aql } = substruct.services.arango

  const collectionList = [
    'accessKeys',
    'contentTypes',
    'entries',
    'files',
    'publications',
    'users',
    'sys_sessions',
    'sys_settings'
  ]

  Promise.map(collectionList, async function (collectionName) {
    const collection = arango.collection(collectionName)
    const exists = await collection.exists()
    if (exists === false) {
      await collection.create()
    }
  })
}
