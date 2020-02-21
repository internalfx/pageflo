
import { getField, updateField } from 'vuex-map-fields'
import _ from 'lodash'
import gql from 'graphql-tag'
import Vue from 'vue'

import { cleanMutation, to } from '../../../lib/utils.js'

export const state = function () {
  return {
    contentType: null,
    conflicts: null,
    selectedFieldId: null,
    changeCounter: 0
  }
}

export const mutations = {
  updateField,
  set: function (state, payload) {
    Object.entries(payload).forEach(function ([key, val]) {
      if (val === undefined) {
        val = null
      }

      val = JSON.parse(JSON.stringify(val))
      const trackChange = key.match(/^contentType/) != null

      if (_.get(state, key) === val) {
        return
      }

      let path = key.split(/(?:\.|\[)/)

      path = path.map(function (item) {
        if (item.substr(-1) === ']') {
          return {
            type: 'index',
            value: parseInt(item.replace(']', ''), 10)
          }
        } else {
          return {
            type: 'key',
            value: item
          }
        }
      })

      let obj = state

      for (let i = 0; i < path.length; i += 1) {
        const isLast = i >= path.length - 1
        const part = path[i]

        if (isLast) {
          part.nextType = null
        } else {
          part.nextType = path[i + 1].type
        }
      }

      for (const part of path) {
        if (part.nextType === null) {
          Vue.set(obj, part.value, val)
          if (trackChange) { state.changeCounter += 1 }
        } else {
          const objValue = _.get(obj, part.value)
          if (part.nextType === 'index' && _.isArray(objValue) === false) {
            Vue.set(obj, part.value, [])
          } else if (part.nextType === 'key' && _.isObject(objValue) === false) {
            Vue.set(obj, part.value, {})
          }
        }

        obj = _.get(obj, part.value)
      }
    })
  }
}

export const actions = {
  // addField: function ({ state, commit }, payload) {
  //   const fieldType = fieldTypes[payload.type]
  //   const field = {
  //     ...fieldType.defaults,
  //     id: createId(),
  //     options: {}
  //   }

  //   console.log(field)
  //   const fields = [...state.contentType.fields, field]

  //   const selectList = [
  //     'SelectField'
  //   ]

  //   if (selectList.includes(field.type)) {
  //     field.options.selectMode = 'single'
  //   } else if (field.type === 'ColumnLayout') {
  //     field.slug = _.uniqueId(`${field.type}_`)
  //     field.label = null
  //   }

  //   if (!['GroupLayout', 'ColumnLayout', 'CheckboxField'].includes(field.type)) {
  //     field.options.required = true
  //   }

  //   commit('set', {
  //     'contentType.fields': fields,
  //     selectedFieldId: field.id
  //   })
  // },
  newContentType: async function ({ state, rootState, commit, dispatch, getters, rootGetters }) {
    commit('set', {
      contentType: null,
      selectedFieldId: null
    })

    const newObj = {
      publication_key: rootState.route.params.publication_key,
      title: null,
      slug: null,
      isWebpage: true,
      urlTemplate: null,
      contentMode: 'single',
      fields: [],
      createdAt: null,
      updatedAt: null
    }

    commit('set', {
      contentType: newObj,
      changeCounter: 0
    })
  },
  loadContentType: async function ({ state, rootState, commit, dispatch, getters, rootGetters }, _key) {
    commit('set', {
      contentType: null,
      selectedFieldId: null
    })

    const res = await this.$gqlClient.query({
      query: gql`
        query getContentType ($_key: ID) {
          record: getContentType (_key: $_key) {
            _key
            publication_key
            title
            slug
            isWebpage
            urlTemplate
            contentMode
            createdAt
            updatedAt
            fields {
              id
              type
              label
              slug
              options
            }
          }
        }
      `,
      variables: {
        _key
      },
      fetchPolicy: 'network-only'
    })

    const record = cleanMutation(_.get(res, 'data.record'))

    commit('set', {
      contentType: record,
      changeCounter: 0
    })
  },
  saveContentType: async function ({ state, rootState, commit, dispatch, getters, rootGetters }) {
    commit('set', {
      conflicts: null
    })

    const res = await to(this.$gqlClient.mutate({
      mutation: gql`
        mutation ($contentType: ContentTypeInput!) {
          upsertContentType (contentType: $contentType) {
            _key
            publication_key
            title
            slug
            isWebpage
            urlTemplate
            contentMode
            createdAt
            updatedAt
            fields {
              id
              type
              label
              slug
              options
            }
          }
        }
      `,
      variables: {
        contentType: _.omit(state.contentType, 'createdAt', 'updatedAt')
      },
      refetchQueries: ['allContentTypes']
    }))

    if (res.isError) {
      const conflicts = _.get(res, 'graphQLErrors[0].extensions.conflicts')

      commit('set', {
        conflicts
      })

      throw res
    } else {
      const contentType = cleanMutation(_.get(res, 'data.upsertContentType'))

      commit('set', {
        contentType,
        changeCounter: 0
      })
    }
  },
  cleanupContentType: function ({ commit }) {
    commit('set', {
      contentType: null,
      conflicts: null,
      selectedFieldId: null,
      changeCounter: 0
    })
  }
}

export const getters = {
  getField
}
