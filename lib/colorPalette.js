let chroma = require('chroma-js')

let palette = []

for (let h of [0, 58, 90, 125, 165, 200, 250, 299, 320]) {
  palette.push(chroma.hcl(h, 65, 35))
  palette.push(chroma.hcl(h, 82, 65))
  palette.push(chroma.hcl(h, 100, 90))
  palette.push(chroma.hcl(h, 50, 90))
}

for (let l of [7, 35, 64, 93]) {
  palette.push(chroma.hcl(0, 0, l))
}

module.exports = palette
