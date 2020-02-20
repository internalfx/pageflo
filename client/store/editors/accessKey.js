
import { getField, updateField } from 'vuex-map-fields'
import _ from 'lodash'
import gql from 'graphql-tag'

import { cleanMutation } from '../../../lib/utils.js'

export const state = function () {
  return {
    accessKey: null
  }
}

export const mutations = {
  updateField,
  set: function (state, payload) {
    const newState = _.cloneDeep(state)
    Object.entries(payload).forEach(function ([key, val]) {
      _.set(newState, key, val)
    })
    for (const [key, val] of Object.entries(newState)) {
      state[key] = val
    }
  }
}

export const actions = {
  newAccessKey: async function ({ state, rootState, commit, dispatch, getters, rootGetters }) {
    const newObj = {
      publication_key: rootState.publication_key,
      title: null,
      createdAt: null,
      updatedAt: null
    }

    commit('set', {
      accessKey: newObj
    })
  },
  loadAccessKey: async function ({ state, rootState, commit, dispatch, getters, rootGetters }, _key) {
    commit('set', {
      accessKey: null
    })

    const res = await this.$gqlClient.query({
      query: gql`
        query getAccessKey ($_key: ID) {
          record: getAccessKey (_key: $_key) {
            _key
            publication_key
            title
            apikey
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

    const record = cleanMutation(_.get(res, 'data.record'))

    commit('set', {
      accessKey: record
    })
  },
  saveAccessKey: async function ({ state, rootState, commit, dispatch, getters, rootGetters }) {
    const res = await this.$gqlClient.mutate({
      mutation: gql`
        mutation ($accessKey: AccessKeyInput!) {
          upsertAccessKey (accessKey: $accessKey) {
            _key
            publication_key
            title
            apikey
            createdAt
            updatedAt
          }
        }
      `,
      variables: {
        accessKey: _.pick(state.accessKey, '_key', 'publication_key', 'title')
      },
      refetchQueries: ['allAccessKeys']
    })

    const record = cleanMutation(_.get(res, 'data.upsertAccessKey'))

    commit('set', {
      accessKey: record
    })
  }
}

export const getters = {
  getField
}
