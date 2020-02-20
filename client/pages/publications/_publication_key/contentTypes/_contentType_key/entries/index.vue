
<script>
// import { mapState } from 'vuex'
import { mapFields } from 'vuex-map-fields'
// import format from '../../lib/format.js'
import gql from 'graphql-tag'
import _ from 'lodash'

import entryList from '../../../../../../ui/lists/entryList.vue'

export default {
  apollo: {
    allEntries: {
      query: gql`
        query allEntries (
          $contentType_key: ID!,
          $page: Int,
          $pageSize: Int,
          $search: String
        ) {
          allEntries: allEntries (
            contentType_key: $contentType_key,
            page: $page,
            pageSize: $pageSize,
            search: $search
          ) {
            count
            pageCount
            items {
              _key
              number
              title
              # content
            }
          }
        }
      `,
      variables: function () {
        return {
          contentType_key: this.$route.params.contentType_key,
          page: this.page,
          pageSize: this.pageSize,
          search: this.currentSearch
        }
      },
      fetchPolicy: 'network-only'
    },
    contentType: {
      query: gql`
        query getContentType ($_key: ID!) {
          contentType: getContentType (_key: $_key) {
            _key
            publication_key
            title
            isWebpage
            urlTemplate
            contentMode
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
      variables: function () {
        return {
          _key: this.$route.params.contentType_key
        }
      },
      fetchPolicy: 'network-only'
    }
  },
  data: function () {
    return {
      currentSearch: ''
    }
  },
  components: {
    entryList
  },
  computed: {
    ...mapFields('settings', {
      viewMode: 'entries.viewMode',
      page: 'entries.page',
      pageSize: 'entries.pageSize',
      search: 'entries.search'
    })
  },
  methods: {
  },
  mounted: function () {
    this.currentSearch = this.search
  },
  watch: {
    search: _.debounce(function (val) {
      this.currentSearch = val
      this.page = 1
    }, 333, { maxWait: 1000 })
  }
}
</script>

<template>
  <v-container v-if="allEntries && contentType">
    <v-layout justify-space-between align-center class="mb-3">
      <h1 class="primary--text">{{contentType.title}} > Entries</h1>
      <v-btn nuxt :to="{ path: `/publications/${$route.params.publication_key}/contentTypes/${$route.params.contentType_key}/entries/create` }" color="primary" rounded>
        <v-icon left>$plus</v-icon> Add New
      </v-btn>
    </v-layout>
    <v-toolbar>
      <v-text-field
        v-model="search"
        hide-details
        prepend-icon="$search"
        placeholder="Search"
        solo
        flat
      ></v-text-field>
    </v-toolbar>

    <entryList :items="allEntries.items" />

  </v-container>
</template>

<style lang="scss" scoped>
  .filename {
    color: #999;
    font-family: monospace;
    font-size: 90%;
  }
</style>
