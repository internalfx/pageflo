const Promise = require(`bluebird`)
const { createId } = require(`../../../lib/utils.js`)
const palette = require(`../../../lib/colorPalette.js`)
const substruct = require(`@internalfx/substruct`)

const config = substruct.config
const { arango, aql } = substruct.services.arango
const arangofs = substruct.services.arangofs
const images = substruct.services.images

const _ = require(`lodash`)
const multiparty = require(`multiparty`)
const streamPromise = require(`stream-to-promise`)
const { Transform } = require(`stream`)
const mime = require(`mime-types`)
const chroma = require(`chroma-js`)
const path = require(`path`)
const fs = Promise.promisifyAll(require(`fs`))
const { exec } = require(`promisify-child-process`)

const defaultImageOpts = {
  width: null,
  height: null,
  sizing: `cover`,
  background: null,
  format: null,
  enlarge: true
}

const createPassthru = function () {
  const passthru = new Transform()

  passthru._transform = function (chunk, encoding, callback) {
    callback(null, chunk)
  }

  passthru.on(`error`, function (err) {
    console.log(err)
  })

  return passthru
}

module.exports = {
  upload: async function (ctx) {
    const form = new multiparty.Form({})
    const passthru = createPassthru()
    const isComplete = {}

    isComplete.promise = new Promise(function (resolve, reject) {
      isComplete.resolve = resolve
      isComplete.reject = reject
    })

    form.on(`error`, function (err) {
      console.log(`Error parsing form: ` + err.stack)
    })

    form.on(`part`, function (part) {
      if (!part.filename) {
        streamPromise(part)
          .then(async function (data) {
            data = JSON.parse(data.toString())

            if (data.originalFilename == null) {
              throw new Error(`originalFilename is required`)
            }

            let ext = _.last(data.originalFilename.split(`.`)).toLowerCase()

            if (ext === `jpeg`) {
              ext = `jpg`
            }

            let filename = data.filename
            if (filename == null) {
              filename = createId()
            }

            let file = await arango.qNext(aql`
              FOR file IN files
                FILTER file.filename == ${filename}
                RETURN file
            `)

            if (file == null) {
              file = {
                filename,
                publication_key: data.publication_key,
                createdAt: new Date()
              }
            }

            const writeStream = await arangofs.createWriteStream({ filename: filename })
            passthru.pipe(writeStream)

            await streamPromise(writeStream).catch(function (err) {
              console.log(err)
            })

            let gridFile = await arangofs.getFile({ filename: filename })

            file.ext = ext
            file.uploadedFilename = data.originalFilename
            file.mimeType = mime.lookup(ext)
            file.mimeClass = _.isString(file.mimeType) ? file.mimeType.split(`/`)[0] : null
            file.size = gridFile.size
            file.sha256 = gridFile.sha256
            file.updatedAt = new Date()

            if ([`image/gif`, `image/jpeg`, `image/png`].includes(file.mimeType)) {
              gridFile = await arangofs.readFile({ filename: filename })

              const tempPath = path.join(config.appDir, `cache`, createId())
              await fs.writeFileAsync(tempPath, gridFile.buffer)

              const res = await exec(`${config.nodePath} scripts/imageData.js '${JSON.stringify({ input: tempPath })}'`)
              const imageData = JSON.parse(res.stdout)

              file.pixelWidth = imageData.width
              file.pixelHeight = imageData.height

              let colors = Object.values(imageData.colors).reduce(function (acc, color) {
                if (color != null) {
                  acc.push(chroma(color).lab())
                }
                return acc
              }, [])

              const labPalette = palette.map(c => c.lab())

              colors = colors.map(function (color) {
                let best = null

                for (const item of labPalette) {
                  const itemDist = Math.sqrt(Math.pow((item[0] - color[0]), 2) + Math.pow((item[1] - color[1]), 2) + Math.pow((item[2] - color[2]), 2))

                  if (best == null || itemDist < best.dist) {
                    best = {
                      dist: itemDist,
                      color: item
                    }
                  }
                }

                return best.color
              })

              colors = colors.map(c => chroma.lab(c).hex())
              colors = _.uniq(colors)
              file.colors = colors.map(c => chroma(c).hex())
            } else {
              file.colors = []
            }

            file.updatedAt = new Date()

            file = await arango.qNext(aql`
              UPSERT {filename: ${file.filename}} INSERT ${file} UPDATE ${file} IN files RETURN NEW
            `)

            isComplete.resolve(file)
          })
          .catch(function (err) {
            isComplete.reject(err)
          })
      } else if (part.filename) {
        part.pipe(passthru)
      }

      part.on(`error`, function (err) {
        console.log(err)
      })
    })

    form.parse(ctx.req)

    const data = await isComplete.promise

    ctx.body = data
  },

  download: async function (ctx) {
    const { filename } = ctx.state.params
    let imageOpts = { ...defaultImageOpts, ...ctx.state.params }
    imageOpts = _.pick(imageOpts, [`width`, `height`, `sizing`, `background`, `format`, `enlarge`])

    const returnOriginal = _.isEqual(imageOpts, defaultImageOpts)

    const cursor = await arango.query(aql`
      FOR file IN files
        FILTER file.filename == ${filename}
        RETURN file
    `)
    const file = await cursor.next()

    if (file == null) {
      ctx.throw(404)
    }

    ctx.set(`Content-Type`, file.mimeType)
    // ctx.set('connection', 'close')
    ctx.set(`Cache-Control`, `max-age=3600`)
    ctx.set(`Content-Disposition`, `inline; filename="${file.uploadedFilename}"`)

    // IF IMAGE
    if (file.mimeClass === `image`) {
      if (returnOriginal) {
        const gridFile = await arangofs.getFile({ filename: file.filename })
        ctx.body = await arangofs.createReadStream({ _id: gridFile._id })
      } else {
        imageOpts.width = imageOpts.width ? parseInt(imageOpts.width, 10) : null
        imageOpts.height = imageOpts.height ? parseInt(imageOpts.height, 10) : null

        if (imageOpts.format != null) {
          const newMime = mime.lookup(imageOpts.format)
          ctx.set(`Content-Type`, newMime)
        }

        ctx.body = await images.process({ ...imageOpts, file })
      }
    // IF VIDEO
    } else if ([`audio`, `video`].includes(file.mimeClass)) {
      ctx.set(`Accept-Ranges`, `bytes`)

      const gridFile = await arangofs.getFile({ filename: filename })
      const range = ctx.header.range
      const size = gridFile.size
      const maxEnd = size - 1
      let contentLength = size
      let start = null
      let end = null

      if (range) {
        const parts = range.replace(/bytes=/, ``).split(`-`)
        const partialstart = parts[0]
        const partialend = parts[1]

        start = parseInt(partialstart, 10)
        end = partialend ? parseInt(partialend, 10) : maxEnd
        if (end > maxEnd) {
          ctx.throw(416)
        }
        contentLength = (end - start) + 1

        ctx.status = 206
        ctx.set(`Content-Range`, `bytes ${start}-${end}/${size}`)
      }

      ctx.set(`Content-Length`, contentLength)

      ctx.body = await arangofs.createReadStream({ _id: gridFile._id, seekStart: start, seekEnd: end })
    } else {
      const gridFile = await arangofs.getFile({ filename: filename })
      ctx.body = await arangofs.createReadStream({ _id: gridFile._id })
    }
  }
}
