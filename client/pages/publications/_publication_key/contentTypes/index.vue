
<script>
import { mapState } from 'vuex'
import { mapFields } from 'vuex-map-fields'
// import format from '../../lib/format.js'
import gql from 'graphql-tag'
import _ from 'lodash'

import contentTypeList from '../../../../ui/lists/contentTypeList.vue'

export default {
  apollo: {
    allContentTypes: {
      query: gql`
        query allContentTypes (
          $publication_key: ID,
          $page: Int,
          $pageSize: Int,
          $search: String,
          $entryPageSize: Int
        ) {
          allContentTypes: allContentTypes (
            publication_key: $publication_key,
            page: $page,
            pageSize: $pageSize,
            search: $search
          ) {
            count
            pageCount
            items {
              _key
              title
              slug
              isWebpage
              urlTemplate
              contentMode
              entries (pageSize: $entryPageSize) {
                items {
                  _key
                }
              }
            }
          }
        }
      `,
      variables: function () {
        return {
          publication_key: this.$route.params.publication_key,
          page: this.page,
          pageSize: this.pageSize,
          search: this.currentSearch,
          entryPageSize: 2
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
    contentTypeList
  },
  computed: {
    ...mapFields('settings', {
      viewMode: 'contentTypes.viewMode',
      page: 'contentTypes.page',
      pageSize: 'contentTypes.pageSize',
      search: 'contentTypes.search'
    }),
    pageSize: function () {
      return this.viewMode === 'list' ? 18 : 18
    }
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
  <v-container v-if="allContentTypes">
    <v-layout justify-space-between align-center class="mb-3">
      <h1 class="primary--text">Content Types</h1>
      <v-btn nuxt :to="`/publications/${$route.params.publication_key}/contentTypes/create`" color="primary" rounded>
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

    <contentTypeList :items="allContentTypes.items" />

  </v-container>
</template>

<style lang="scss" scoped>
  .filename {
    color: #999;
    font-family: monospace;
    font-size: 90%;
  }
</style>

