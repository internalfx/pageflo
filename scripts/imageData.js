const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))
const sharp = require('sharp')
const spec = JSON.parse(process.argv[2])
const Vibrant = require('node-vibrant')

const { input } = spec

const main = async function () {
  const pipeline = sharp(input)
  const imageData = await pipeline.metadata()
  const sampleBuffer = await pipeline.resize(200, null, { withoutEnlargement: true }).toBuffer()
  let colors = await Vibrant.from(sampleBuffer).getPalette()
  colors = Object.values(colors).reduce(function (acc, color) {
    if (color != null) {
      acc.push(color.getHex())
    }
    return acc
  }, [])
  await fs.unlinkAsync(input)

  delete imageData.icc

  process.stdout.write(JSON.stringify({ ...imageData, colors: colors }))
}

Promise.resolve().then(main).catch(function (err) {
  console.log(err)
}).finally(function () {
  process.exit()
})
