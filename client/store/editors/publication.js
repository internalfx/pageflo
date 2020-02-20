
import { getField, updateField } from 'vuex-map-fields'
import _ from 'lodash'
import gql from 'graphql-tag'
import Vue from 'vue'

import { cleanMutation } from '../../../lib/utils.js'

export const state = function () {
  return {
    publication: null
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
  newPublication: async function ({ state, rootState, commit, dispatch, getters, rootGetters }, contentTypeKey) {
    commit('set', {
      publication: null
    })

    const publication = {
      title: null,
      createdAt: null,
      updatedAt: null
    }

    commit('set', {
      publication
    })
  },
  loadPublication: async function ({ state, rootState, commit, dispatch, getters, rootGetters }, _key) {
    commit('set', {
      publication: null
    })

    const res = await this.$gqlClient.query({
      query: gql`
        query getPublication ($_key: ID) {
          record: getPublication (_key: $_key) {
            _key
            title
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

    const publication = cleanMutation(_.get(res, 'data.record'))

    commit('set', {
      publication
    })
  },
  savePublication: async function ({ state, rootState, commit, dispatch, getters, rootGetters }) {
    const res = await this.$gqlClient.mutate({
      mutation: gql`
        mutation ($publication: PublicationInput!) {
          record: upsertPublication (publication: $publication) {
            _key
            title
            createdAt
            updatedAt
          }
        }
      `,
      variables: {
        publication: _.omit(state.publication, 'createdAt', 'updatedAt')
      },
      refetchQueries: ['allPublications']
    })

    const publication = cleanMutation(_.get(res, 'data.record'))

    commit('set', {
      publication
    })
  }
}

export const getters = {
  getField
}
