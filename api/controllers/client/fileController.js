const substruct = require('@internalfx/substruct')

const { arango, aql } = substruct.services.arango
const arangofs = substruct.services.arangofs
const images = substruct.services.images

const _ = require('lodash')
const mime = require('mime-types')

const defaultImageOpts = {
  width: null,
  height: null,
  sizing: 'cover',
  background: null,
  format: null,
  enlarge: true
}

module.exports = {
  download: async function (ctx) {
    const { filename } = ctx.state.params
    let imageOpts = { ...defaultImageOpts, ...ctx.state.params }
    imageOpts = _.pick(imageOpts, ['width', 'height', 'sizing', 'background', 'format', 'enlarge'])

    const returnOriginal = _.isEqual(imageOpts, defaultImageOpts)

    const file = await arango.qNext(aql`
      FOR file IN files
        FILTER file.filename == ${filename}
        RETURN file
    `)

    if (file == null) {
      ctx.throw(404)
    }

    ctx.set('Content-Type', file.mimeType)
    ctx.set('Cache-Control', 'max-age=3600')
    ctx.set('Content-Disposition', `inline; filename="${file.uploadedFilename}"`)

    // IF IMAGE
    if (file.mimeClass === 'image') {
      if (returnOriginal) {
        const gridFile = await arangofs.getFile({ filename: file.filename })
        ctx.body = await arangofs.createReadStream({ _id: gridFile._id })
      } else {
        imageOpts.width = imageOpts.width ? parseInt(imageOpts.width, 10) : null
        imageOpts.height = imageOpts.height ? parseInt(imageOpts.height, 10) : null

        if (imageOpts.format != null) {
          const newMime = mime.lookup(imageOpts.format)
          ctx.set('Content-Type', newMime)
        }

        ctx.body = await images.process({ ...imageOpts, file })
      }
    // IF VIDEO
    } else if (['audio', 'video'].includes(file.mimeClass)) {
      ctx.set('Accept-Ranges', 'bytes')

      const gridFile = await arangofs.getFile({ filename: filename })
      const range = ctx.header.range
      const size = gridFile.size
      const maxEnd = size - 1
      let contentLength = size
      let start = null
      let end = null

      if (range) {
        const parts = range.replace(/bytes=/, '').split('-')
        const partialstart = parts[0]
        const partialend = parts[1]

        start = parseInt(partialstart, 10)
        end = partialend ? parseInt(partialend, 10) : maxEnd
        if (end > maxEnd) {
          ctx.throw(416)
        }
        contentLength = (end - start) + 1

        ctx.status = 206
        ctx.set('Content-Range', `bytes ${start}-${end}/${size}`)
      }

      ctx.set('Content-Length', contentLength)

      ctx.body = await arangofs.createReadStream({ _id: gridFile._id, seekStart: start, seekEnd: end })
    } else {
      const gridFile = await arangofs.getFile({ filename: filename })
      ctx.body = await arangofs.createReadStream({ _id: gridFile._id })
    }
  }
}
