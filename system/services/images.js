
const substruct = require(`@internalfx/substruct`)
const Promise = require(`bluebird`)
const crypto = require(`crypto`)
const path = require(`path`)
const { exec } = require(`promisify-child-process`)
const fs = Promise.promisifyAll(require(`fs`))
const lockFile = Promise.promisifyAll(require(`lockfile`))
const streamPromise = require(`stream-to-promise`)

module.exports = async function (config) {
  const arangofs = substruct.services.arangofs

  // let spec = {
  //   file,
  //   width,
  //   height,
  //   background,
  //   sizing,
  //   format
  // }

  await fs.mkdirAsync(path.join(config.appDir, `cache`, `temp`), { recursive: true })

  const fileExists = async function (filePath) {
    let exists = true

    try {
      await fs.accessAsync(filePath, fs.constants.F_OK)
    } catch (err) {
      exists = false
    }

    return exists
  }

  const process = async function (spec) {
    const { file, width, height, sizing, background, format, enlarge } = spec
    const ext = format != null ? format : file.ext
    // let gridFile = await arangofs.getFile({ filename: file.filename })

    const cacheKey = `${file.sha256}:${width}:${height}:${sizing}:${background}:${format}:${enlarge}.${ext}`
    const cacheHash = crypto.createHash(`sha256`).update(cacheKey).digest(`hex`)

    const tempPath = path.join(config.appDir, `cache`, `temp`, `${cacheHash}.${ext}`)
    const lockPath = path.join(config.appDir, `cache`, `temp`, `${cacheHash}.lock`)
    const cachePath = path.join(config.appDir, `cache`, `${cacheHash}.${ext}`)

    if (await fileExists(cachePath)) {
      return fs.createReadStream(cachePath)
    }

    await lockFile.lockAsync(lockPath, { wait: 30000, stale: 15000 })

    if (await fileExists(cachePath)) {
      await lockFile.unlockAsync(lockPath)
      return fs.createReadStream(cachePath)
    }

    const gridFile = await arangofs.getFile({ filename: file.filename })
    const rStream = await arangofs.createReadStream({ _id: gridFile._id })
    const wStream = fs.createWriteStream(tempPath)
    rStream.pipe(wStream)

    await streamPromise(wStream)

    const args = {
      input: tempPath,
      output: cachePath,
      width,
      height,
      background,
      sizing,
      format,
      enlarge
    }

    const res = await exec(`${config.nodePath} scripts/imageResize.js '${JSON.stringify(args)}'`)
    // console.log(res)
    if (res.stdout) {
      console.log(res.stdout)
    }
    if (res.stderr) {
      console.log(res.stderr)
    }

    await lockFile.unlockAsync(lockPath)
    return fs.createReadStream(cachePath)
  }

  return Object.freeze({
    process
  })
}
