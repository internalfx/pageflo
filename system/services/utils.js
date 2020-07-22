'use strict'

const crypto = require(`crypto`)
const path = require(`path`)

module.exports = function (config) {
  config.scriptsDir = path.join(config.appDir, `assets`, `scripts`)

  const to = function (promise) {
    return promise.then(function (val) {
      return val
    }).catch(function (err) {
      err.isError = true
      return err
    })
  }

  const uniqueId = function (length) {
    const letters = `ABCDEFGHIJKLMNOPQRSTUVWXYZ`
    const numbers = `1234567890`
    const bytes = Array.from(crypto.randomBytes(length))

    const value = bytes.map(function (byte, idx) {
      if (idx % 2) {
        return letters[byte % letters.length].toString()
      } else {
        return numbers[byte % numbers.length].toString()
      }
    })

    return value.join(``)
  }

  return Object.freeze({
    to,
    uniqueId
  })
}
