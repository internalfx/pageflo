
const urljoin = require('url-join')
const _ = require('lodash')

export default function (config) {
  const width = config.width
  const height = config.height
  const sizing = config.sizing

  return [
    {
      name: 'image',
      type: 'dom',
      render: function ({ env, options, payload }) {
        const inBrowser = (typeof document !== 'undefined')
        const filename = payload.filename
        const altText = payload.altText || ''
        const className = payload.className || ''
        const path = `${config.baseURL}/api/file/download/`

        const params = []
        let query = ''

        if (inBrowser) {
          params.push(`r=${Date.now()}`)
        }

        if (Number.isFinite(width)) {
          params.push(`width=${width}`)
        }
        if (Number.isFinite(height)) {
          params.push(`height=${height}`)
        }
        if (!_.isEmpty(sizing)) {
          params.push(`sizing=${sizing}`)
        }

        if (params.length > 0) {
          query = `?${params.join('&')}`
        }

        const doc = inBrowser ? document : env.dom
        const img = doc.createElement('img')
        img.setAttribute('class', className)
        img.setAttribute('alt', altText)
        img.src = urljoin(path, filename, query)

        return img
      }
    },
    {
      name: 'video',
      type: 'dom',
      render: function ({ env, options, payload }, dom) {
        const inBrowser = (typeof document !== 'undefined')
        const filename = payload.filename
        const className = payload.className || ''
        const path = `${config.baseURL}/api/file/download/`

        const params = []
        let query = ''
        params.push(`r=${Date.now()}`)

        if (params.length > 0) {
          query = `?${params.join('&')}`
        }

        const doc = inBrowser ? document : env.dom
        const video = doc.createElement('video')
        video.setAttribute('class', className)
        video.setAttribute('controls', null)
        video.src = urljoin(path, filename, query)
        return video
      }
    }
  ]
}
