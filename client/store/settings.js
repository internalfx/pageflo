
import _ from 'lodash'
import { getField, updateField } from 'vuex-map-fields'

export const state = function () {
  return {
    accessKeys: {
      viewMode: 'list',
      page: 1,
      pageSize: 10,
      search: ''
    },
    publications: {
      viewMode: 'list',
      page: 1,
      pageSize: 10,
      search: ''
    },
    contentTypes: {
      viewMode: 'list',
      page: 1,
      pageSize: 10,
      search: ''
    },
    entries: {
      viewMode: 'list',
      page: 1,
      pageSize: 10,
      search: ''
    },
    files: {
      viewMode: 'list',
      page: 1,
      pageSize: 10,
      search: '',
      fileType: null
    },
    filesDialog: {
      viewMode: 'list',
      page: 1,
      pageSize: 10,
      search: '',
      fileType: null
    }
  }
}

export const mutations = {
  updateField,
  set: function (state, payload) {
    Object.entries(payload).forEach(function ([key, val]) {
      _.set(state, key, val)
    })
  }
}

export const actions = {
}

export const getters = {
  getField
}
