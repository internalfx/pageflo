const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))
const sharp = require('sharp')
const _ = require('lodash')
const spec = JSON.parse(process.argv[2])

let { input, output, width, height, background, sizing, format, enlarge } = spec

const main = async function () {
  const buffer = await fs.readFileAsync(input)
  let pipeline = sharp(buffer)
    .rotate()
    .png({ force: false })
    .jpeg({
      quality: 80,
      trellisQuantisation: true,
      overshootDeringing: true,
      optimizeScans: true,
      force: false
    })

  const imageData = await pipeline.metadata()

  if (_.isString(background)) {
    background = `#${background}`
  } else if (!_.isObject(background)) {
    if (imageData.hasAlpha) {
      background = { r: 255, g: 255, b: 255, alpha: 0 }
    } else {
      background = { r: 255, g: 255, b: 255, alpha: 1 }
    }
  }

  pipeline = pipeline.resize({ width, height, fit: sizing, position: sharp.strategy.entropy, background, withoutEnlargement: !enlarge })

  if (format != null) {
    if (format === 'jpg') {
      pipeline = pipeline.flatten({ background })
      pipeline = pipeline.toFormat('jpeg')
    } else if (format === 'png') {
      pipeline = pipeline.toFormat('png')
    }
  }

  await pipeline.toFile(input)
  await fs.renameAsync(input, output)
}

Promise.resolve().then(main).catch(function (err) {
  console.log(err)
}).finally(function () {
  process.exit()
})
