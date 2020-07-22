const ArangoFS = require(`@internalfx/arangofs`)
const Promise = require(`bluebird`)
const fs = Promise.promisifyAll(require(`fs`))

module.exports = async function (config) {
  const storagePath = config.arangoFS.path

  await fs.mkdirAsync(storagePath, { recursive: true })

  const arangoFS = ArangoFS(config.arango, { path: storagePath })

  await arangoFS.initBucket()

  return arangoFS
}
