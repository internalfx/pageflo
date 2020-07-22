const substruct = require(`@internalfx/substruct`)
const _ = require(`lodash`)
const Promise = require(`bluebird`)

module.exports = async function (config) {
  const { arango, aql } = substruct.services.arango

  const migrateContent = async function (after, before) {
    const changes = []

    const aList = buildList(after.fields)
    const bList = buildList(before.fields)

    for (const bField of bList) {
      const aField = aList.find(function (item) {
        return bField.id === item.id
      })

      if (aField == null) {
        changes.push({
          type: `fieldRemoved`,
          before: bField,
          after: aField
        })
      } else if (aField.path !== bField.path) {
        changes.push({
          type: `fieldMoved`,
          before: bField,
          after: aField
        })
      }
    }

    if (changes.length > 0) {
      const entries = arango.qAll(aql`
        FOR entry IN entries
          FILTER entry.contentType_key == ${after._key}
          SORT entry.createdAt DESC
          COLLECT num = entry.number INTO entryGroup
          RETURN FIRST(entryGroup).entry
      `)

      await Promise.map(entries, async function (entry) {
        for (const change of changes) {
          if (change.type === `fieldRemoved`) {
            removeContent(entry, change.before.path)
          } else if (change.type === `fieldMoved`) {
            const oldValue = removeContent(entry, change.before.path)
            addContent(entry, oldValue, change.after.path)
          }
        }

        arango.q(aql`
          REPLACE ${entry._key} WITH ${entry} IN entries
        `)
      })
    }
  }

  const addContent = function (obj, content, path) {
    const pathParts = path.split(`.`)
    const part = _.first(pathParts)
    const isLast = pathParts.length === 1

    if (isLast) {
      obj[part] = content
    }

    const childObj = _.get(obj, part)

    if (_.isArray(childObj)) {
      childObj.forEach(function (item, idx) {
        addContent(item, content, pathParts.slice(1).join(`.`))
      })
    } else if (_.isPlainObject(childObj)) {
      addContent(childObj, content, pathParts.slice(1).join(`.`))
    }
  }

  const removeContent = function (obj, path) {
    const pathParts = path.split(`.`)
    const part = _.first(pathParts)
    const isLast = pathParts.length === 1

    if (isLast) {
      const value = obj[part]
      delete obj[part]
      return value
    }

    const childObj = _.get(obj, part)

    if (childObj == null) {
      return null
    } else if (_.isArray(childObj)) {
      let value = null

      childObj.forEach(function (item, idx) {
        if (idx === 0) {
          value = removeContent(item, pathParts.slice(1).join(`.`))
        } else {
          removeContent(item, pathParts.slice(1).join(`.`))
        }
      })

      return value
    } else if (_.isPlainObject(childObj)) {
      return removeContent(childObj, pathParts.slice(1).join(`.`))
    }
  }

  const buildList = function (fields, path = `content`) {
    const list = []

    for (const field of fields) {
      if (field.type === `ColumnLayout`) {
        const subFields = _.isArray(_.get(field, `options.columns`)) ? _.get(field, `options.columns`).flat() : []

        const subList = buildList(subFields, path)

        for (const subField of subList) {
          list.push(subField)
        }
      } else if (field.type === `GroupLayout`) {
        const subFields = _.get(field, `options.fields`) || []

        const subList = buildList(subFields, `${path}.${field.slug}`)

        for (const subField of subList) {
          list.push(subField)
        }
      } else {
        list.push({ ...field, path: `${path}.${field.slug}` })
      }
    }

    return list
  }

  return {
    migrateContent
  }
}
