const ArangoFS = require('@internalfx/arangofs')
const path = require('path')
const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))

module.exports = async function (config) {
  const storagePath = path.join(config.appDir, 'fileStore')

  await fs.mkdirAsync(storagePath, { recursive: true })

  const arangoFS = ArangoFS(config.arango, { path: storagePath })

  await arangoFS.initBucket()

  return arangoFS
}
