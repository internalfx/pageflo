const mkdirp = require('mkdirp')
const path = require('path')

module.exports = async function (config) {
  await mkdirp(path.join(config.appDir, 'cache'))

  if (process.env.NODE_PATH) {
    config.nodePath = process.env.NODE_PATH
  } else {
    config.nodePath = 'node'
  }
}
