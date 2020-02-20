const substruct = require('@internalfx/substruct')
const getCards = require('../../lib/mobileDocCards').default
const _ = require('lodash')
const Promise = require('bluebird')

const MobiledocDOMRenderer = require('mobiledoc-dom-renderer').default
const SimpleDOM = require('simple-dom')
const { JSDOM } = require('jsdom')

module.exports = async function (config) {
  const { arango, aql } = substruct.services.arango

  const renderMobileDoc = function (doc, cardConfig) {
    var renderer = new MobiledocDOMRenderer({
      cards: getCards(cardConfig),
      dom: new JSDOM().window.document
    })
    var rendered = renderer.render(doc)
    var serializer = new SimpleDOM.HTMLSerializer([])
    var html = serializer.serializeChildren(rendered.result)
    return html
  }

  const resolveEntry = async function (entryNumber, spec) {
    spec = { depth: 3, env: 'prod', ...spec }
    console.log('resolveEntry =================', entryNumber, spec)
    spec.depth -= 1

    const output = {}

    // let entry = await arango.qNext(aql`
    //   RETURN DOCUMENT('entries', ${entryNumber})
    // `)

    let entry = null

    if (spec.env === 'dev') {
      entry = await arango.qNext(aql`
        FOR entry IN entries
          FILTER entry.number == ${entryNumber}
          SORT entry.createdAt DESC
          LIMIT 1
          RETURN entry
      `)
    } else {
      entry = await arango.qNext(aql`
        FOR entry IN entries
          FILTER entry.number == ${entryNumber}
          SORT entry.publishDate DESC
          LIMIT 1
          RETURN entry
      `)
    }

    if (entry == null) {
      return null
    }

    const contentType = await arango.qNext(aql`
      RETURN DOCUMENT('contentTypes', ${entry.contentType_key})
    `)

    await Promise.map(contentType.fields, async function (field) {
      // output[field.slug] = await resolveField(field, entry.content, spec)
      const result = await resolveField(field, entry.content, spec)

      if (_.isPlainObject(result)) {
        for (const [key, val] of Object.entries(result)) {
          output[key] = val
        }
      } else {
        output[field.slug] = result
      }
    })

    return { ...entry, content: output }
  }

  const resolveField = async function (field, input, spec) {
    let output = null

    if (!Number.isFinite(spec.depth)) {
      throw new Error('Depth is required')
    }

    if (field.type === 'RichTextEditor') {
      if (_.isPlainObject(input[field.slug])) {
        const data = input[field.slug]
        console.time('renderMobileDoc')
        output = renderMobileDoc(data, { ...field.options.imageSize })
        console.timeEnd('renderMobileDoc')
      } else {
        output = input[field.slug] || null
      }
    } else if (field.type === 'SelectField') {
      if (field.options.selectMode === 'multiple') {
        const val = input[field.slug]

        if (_.isArray(val)) {
          output = val
        } else if (_.isString(val)) {
          output = [val]
        } else {
          output = []
        }
      } else {
        const val = input[field.slug]

        if (_.isString(val)) {
          output = val
        } else if (_.isArray(val)) {
          output = _.first(val)
        } else {
          output = null
        }
      }
    } else if (field.type === 'GroupLayout') {
      if (field.options.groupMode === 'multiple') {
        input = input[field.slug] || []
        const subFields = _.get(field, 'options.fields') || []
        output = []

        output = await Promise.map(input, async function (inputItem) {
          const itemOutput = {}
          await Promise.map(subFields, async function (subField) {
            const result = await resolveField(subField, inputItem, spec)

            if (_.isPlainObject(result)) {
              for (const [key, val] of Object.entries(result)) {
                itemOutput[key] = val
              }
            } else {
              itemOutput[field.slug] = result
            }
          })

          return itemOutput
        })
      } else {
        const subInput = input[field.slug] || {}
        const fields = _.get(field, 'options.fields') || []
        output = {}

        await Promise.map(fields, async function (subField) {
          const result = await resolveField(subField, subInput, spec)

          if (_.isPlainObject(result)) {
            for (const [key, val] of Object.entries(result)) {
              output[key] = val
            }
          } else {
            output[field.slug] = result
          }
        })
      }
    } else if (field.type === 'ColumnLayout') {
      const fields = _.get(field, 'options.columns').flat() || []
      output = {}

      await Promise.map(fields, async function (subField) {
        output[subField.slug] = await resolveField(subField, input, spec)
      })
    } else if (field.type === 'BooleanField') {
      output = input[field.slug] || false
    } else if (field.type === 'FileField') {
      const value = {
        uploadedFilename: null,
        ext: null,
        mimeType: null,
        size: 0,
        url: null
      }

      const fileKey = input[field.slug] || null

      if (fileKey != null) {
        const file = await arango.qNext(aql`
          RETURN DOCUMENT('files', ${fileKey})
        `)

        if (file != null) {
          value.uploadedFilename = file.uploadedFilename
          value.ext = file.ext
          value.mimeType = file.mimeType
          value.size = file.size
          value.url = `${config.baseURL}/api/client/file/download/${file.filename}`
        }
      }

      output = {
        [field.slug]: value
      }
    } else if (field.type === 'LinkField') {
      const value = {
        caption: null,
        url: null,
        className: null,
        newWindow: false,
        ..._.pick(input[field.slug], 'caption', 'url', 'className', 'newWindow')
      }

      output = {
        [field.slug]: value
      }
    } else if (field.type === 'ReferenceField') {
      console.log('ReferenceField', input[field.slug])
      if (spec.depth <= 0) {
        output = { [field.slug]: `$ref:${field.slug}` }
      } else if (field.options.selectMode === 'multiple') {
        output = []
        const entryNumbers = input[field.slug] || []

        output = await Promise.map(entryNumbers, async function (entryNumber) {
          return resolveEntry(entryNumber, spec)
        })
      } else {
        let value = null
        const entryNumber = input[field.slug] || null

        if (entryNumber != null) {
          value = await resolveEntry(entryNumber, spec)
        }

        output = { [field.slug]: value }
      }
    } else {
      output = input[field.slug] || null
    }

    return output
  }

  return {
    resolveEntry
  }
}
