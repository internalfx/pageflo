<script>
import _ from 'lodash'
import gql from 'graphql-tag'

import { mapActions, mapState, mapMutations } from 'vuex'

export default {
  apollo: {
    entries: {
      query: gql`
        query autocompleteEntryReference (
          $contentType_keys: [ID!]
          $entry_numbers: [Int]
          $search: String
        ) {
          entries: autocompleteEntryReference (
            contentType_keys: $contentType_keys
            entry_numbers: $entry_numbers
            search: $search
          ) {
            _key
            number
            contentType_key
            contentType {
              title
            }
            title
          }
        }
      `,
      variables: function () {
        return {
          contentType_keys: _.get(this, 'field.options.allowedContentTypes') || [],
          entry_numbers: this.entryNumbers,
          search: this.search
        }
      },
      fetchPolicy: 'network-only'
    }
  },
  data: function () {
    return {
      search: null
    }
  },
  props: {
    field: Object,
    path: String
  },
  components: {
  },
  computed: {
    ...mapState('editors/entry', {
      contentType: state => state.contentType,
      entry: state => state.entry
    }),
    entryNumbers: function () {
      const value = this.valueModel

      if (Number.isFinite(value)) {
        return [value]
      } else if (_.isArray(value)) {
        return value
      }

      return []
    },
    valueModel: {
      get: function () {
        const value = _.get(this, `entry.content.${this.path}`)

        if (this.field.options.selectMode === 'multiple') {
          if (Number.isFinite(value) === true) {
            return [value]
          } else if (_.isArray(value) === false) {
            return []
          }
        } else if (this.field.options.selectMode === 'single') {
          if (_.isArray(value) === true && Number.isFinite(_.first(value)) === true) {
            return _.first(value)
          } else if (Number.isFinite(value) === false) {
            return null
          }
        }

        return value
      },
      set: function (val) {
        if (val === undefined) {
          val = null
        }
        this.storeSet({ [`entry.content.${this.path}`]: val })
      }
    }
  },
  methods: {
    ...mapMutations('editors/entry', {
      storeSet: 'set'
    }),
    ...mapActions(['showConfirm'])
  },
  watch: {
  }
}
</script>

<template>
  <div v-if="entries" class="mb-3">
    <v-autocomplete
      v-model="valueModel"
      :items="entries"
      :loading="$apollo.queries.entries.loading"
      :search-input.sync="search"
      item-text="title"
      item-value="number"
      clearable
      :label="field.label"
      :multiple="field.options.selectMode === 'multiple'"
      outlined
    >
      <template v-slot:item="{item}">
        <span class="font-italic mr-2">{{item.contentType.title}}:</span>
        {{item.title}}
      </template>
      <template v-slot:selection="{item}">
        <v-chip
          label
        >
          <span class="font-italic mr-2">{{item.contentType.title}}:</span>
          <nuxt-link :to="{ path: '/entries/edit', query: { _key: item._key } }">
            {{item.title}}
          </nuxt-link>
        </v-chip>
      </template>
    </v-autocomplete>
  </div>
</template>

<style lang="scss" scoped>
</style>
