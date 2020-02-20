// const substruct = require('@internalfx/substruct')
const _ = require('lodash')
// const Promise = require('bluebird')

module.exports = async function (config) {
  // const { arango, aql } = substruct.services.arango

  const getConflicts = function (template) {
    const output = {
      paths: {},
      fieldIds: []
    }

    template.fields.forEach(function (field) {
      getConflictsField(field, output, 'fields')
    })

    output.fieldIds = _.uniq(output.fieldIds)

    return output
  }

  const addField = function (field, output, path) {
    if (output.paths[path] == null) {
      output.paths[path] = [field.id]
    } else {
      output.paths[path].push(field.id)
      output.fieldIds = [...output.fieldIds, ...output.paths[path]]
    }
  }

  const getConflictsField = function (field, output, path) {
    if (field.type === 'ColumnLayout') {
      const fields = _.isArray(_.get(field, 'options.columns')) ? _.get(field, 'options.columns').flat() : []

      fields.forEach(function (subField) {
        getConflictsField(subField, output, path)
      })
    } else if (field.type === 'GroupLayout') {
      addField(field, output, `${path}.${field.slug}`)
      const fields = _.get(field, 'options.fields') || []

      fields.forEach(function (subField) {
        getConflictsField(subField, output, `${path}.${field.slug}`)
      })
    } else {
      addField(field, output, `${path}.${field.slug}`)
    }
  }

  return {
    getConflicts
  }
}
