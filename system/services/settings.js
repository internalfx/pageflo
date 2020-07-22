
const substruct = require(`@internalfx/substruct`)

module.exports = async function (config) {
  const { arango, aql } = substruct.services.arango

  const get = async function (key) {
    const record = await arango.qNext(aql`
      RETURN DOCUMENT('sys_settings', ${key})
    `)

    let val = null

    if (record) {
      if (record.type === `DateTime`) {
        val = new Date(record.value)
      } else {
        val = record.value
      }
    }

    return val
  }

  const set = async function (key, value) {
    const obj = {
      value,
      type: null
    }

    if (value instanceof Date) {
      obj.type = `DateTime`
    }

    await arango.q(aql`
      UPSERT { _key: ${key} }
      INSERT MERGE({ _key: ${key} }, ${obj})
      UPDATE ${obj}
      IN sys_settings
    `)

    return true
  }

  const unset = async function (key) {
    await arango.q(aql`
      FOR x IN sys_settings
        FILTER x._key == ${key}
        REMOVE x IN sys_settings
    `)

    return true
  }

  return Object.freeze({
    set,
    get,
    unset
  })
}
