
// let _ = require('lodash')
// let Promise = require('bluebird')

const updateTags = async function (obj, ctx) {
  const tags = obj.tags || []

  const tagList = await ctx.arango.qAll(ctx.aql`
    FOR tag IN tags
      RETURN tag
  `)

  const missingTags = tags.filter(function (tag) {
    return tagList.find(t => t.title === tag) == null
  })

  // console.log({ tagList, tags, missingTags })

  if (missingTags.length > 0) {
    await ctx.arango.q(ctx.aql`
      FOR title IN ${missingTags}
        INSERT { title } INTO tags
    `)
  }

  await ctx.arango.q(ctx.aql`
    let removeList = (
      FOR tag IN tags
        let hasPublication = COUNT(
          FOR item IN publications
            FILTER tag.title IN item.tags
            RETURN true
        ) > 0

        let hasContentType = COUNT(
          FOR item IN contentTypes
            FILTER tag.title IN item.tags
            RETURN true
        ) > 0

        let isUsed = hasPublication OR hasContentType
        FILTER isUsed == false

        RETURN tag
    )

    FOR item IN removeList
      REMOVE item._key IN tags
  `)
}

module.exports = Object.freeze({
  updateTags
})

// let getNumber = async function (type) {
//   try {
//     let key = numberMap[type]

//     if (key == null) {
//       throw new Error('invalid type for getNumber')
//     }

//     let collections = {
//       exclusive: ['sys_settings']
//     }

//     let action = String(function (params) {
//       let db = require('@arangodb').db
//       let aql = require('@arangodb').aql

//       let setting = db._query(aql`
//         FOR setting IN sys_settings
//           FILTER setting._key == ${params.key}
//           RETURN setting
//       `).toArray()

//       if (setting.length > 0) {
//         setting = setting[0]
//       } else {
//         setting = db._query(aql`
//           INSERT { _key: ${params.key}, value: 0 } IN sys_settings RETURN NEW
//         `).toArray()[0]
//       }

//       let value = setting.value
//       value += 1
//       setting.value += value

//       db._query(aql`
//         UPDATE ${setting} WITH { value: ${value} } IN sys_settings
//       `)

//       return value
//     })

//     let params = {
//       key
//     }

//     let number = await arango.transaction(
//       collections,
//       action,
//       params,
//       {
//         // lockTimeout: 0
//       }
//     )

//     return number
//   } catch (err) {
//     console.log(err)
//     // console.log('GETNUMBER WE CAUGHT ONE!!!!! ==============================================')
//   }
// }
