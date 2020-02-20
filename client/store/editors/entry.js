
import { getField, updateField } from 'vuex-map-fields'
import _ from 'lodash'
import gql from 'graphql-tag'
import Vue from 'vue'

import { cleanMutation } from '../../../lib/utils.js'
// import fieldTypes from '../../../lib/fieldTypes.js'

export const state = function () {
  return {
    entry: null,
    contentType: null
  }
}

export const mutations = {
  updateField,
  set: function (state, payload) {
    Object.entries(payload).forEach(function ([key, val]) {
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

      path.forEach(function (part, idx, path) {
        if (part.nextType === null) {
          Vue.set(obj, part.value, val)
        } else if (_.has(obj, part.value) === false) {
          if (part.nextType === 'index') {
            Vue.set(obj, part.value, [])
          } else if (part.nextType === 'key') {
            Vue.set(obj, part.value, {})
          }
        }

        obj = _.get(obj, part.value)
      })
    })
  }
}

export const actions = {
  newEntry: async function ({ state, rootState, commit, dispatch, getters, rootGetters }, contentTypeKey) {
    commit('set', {
      entry: null,
      contentType: null
    })

    const entry = {
      contentType_key: contentTypeKey,
      title: null,
      content: {},
      publishDate: null,
      createdAt: null,
      updatedAt: null
    }

    const res = await this.$gqlClient.query({
      query: gql`
        query getContentType ($_key: ID) {
          record: getContentType (_key: $_key) {
            _key
            publication_key
            title
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
        _key: contentTypeKey
      },
      fetchPolicy: 'network-only'
    })

    const contentType = cleanMutation(_.get(res, 'data.record'))

    commit('set', {
      entry,
      contentType
    })
  },
  loadEntry: async function ({ state, rootState, commit, dispatch, getters, rootGetters }, _key) {
    commit('set', {
      entry: null,
      contentType: null
    })

    const res = await this.$gqlClient.query({
      query: gql`
        query getEntry ($_key: ID) {
          record: getEntry (_key: $_key) {
            _key
            number
            contentType_key
            contentType {
              _key
              publication_key
              title
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
            title
            content
            publishDate
            createdAt
            updatedAt
          }
        }
      `,
      variables: {
        _key
      },
      fetchPolicy: 'network-only'
    })

    const entry = cleanMutation(_.get(res, 'data.record'))

    commit('set', {
      entry: _.omit(entry, 'contentType'),
      contentType: _.get(entry, 'contentType')
    })
  },
  saveEntry: async function ({ state, rootState, commit, dispatch, getters, rootGetters }) {
    const res = await this.$gqlClient.mutate({
      mutation: gql`
        mutation ($entry: EntryInput!) {
          record: saveEntry (entry: $entry) {
            _key
            number
            contentType_key
            contentType {
              _key
              publication_key
              title
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
            title
            content
            publishDate
            createdAt
            updatedAt
          }
        }
      `,
      variables: {
        entry: _.omit(state.entry, 'createdAt', 'updatedAt', '_key')
      },
      refetchQueries: ['allEntries']
    })

    const entry = cleanMutation(_.get(res, 'data.record'))

    commit('set', {
      entry: _.omit(entry, 'contentType'),
      contentType: _.get(entry, 'contentType')
    })

    return _.omit(entry, 'contentType')
  },
  publishEntry: async function ({ state, rootState, commit, dispatch, getters, rootGetters }, publishDate = null) {
    commit('set', {
      'entry.publishDate': publishDate
    })

    const res = await this.$gqlClient.mutate({
      mutation: gql`
        mutation ($entry: EntryInput!) {
          record: publishEntry (entry: $entry) {
            _key
            number
            contentType_key
            contentType {
              _key
              publication_key
              title
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
            title
            content
            publishDate
            createdAt
            updatedAt
          }
        }
      `,
      variables: {
        entry: _.omit(state.entry, 'createdAt', 'updatedAt', '_key')
      },
      refetchQueries: ['allEntries']
    })

    const entry = cleanMutation(_.get(res, 'data.record'))

    commit('set', {
      entry: _.omit(entry, 'contentType'),
      contentType: _.get(entry, 'contentType')
    })

    return _.omit(entry, 'contentType')
  }
}

export const getters = {
  getField
}
