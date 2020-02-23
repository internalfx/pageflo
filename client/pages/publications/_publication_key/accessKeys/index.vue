
<script>
import { mapState } from 'vuex'
import { mapFields } from 'vuex-map-fields'
// import format from '../../lib/format.js'
import gql from 'graphql-tag'
import _ from 'lodash'

import accessKeyList from '../../../../ui/lists/accessKeyList.vue'

export default {
  apollo: {
    allAccessKeys: {
      query: gql`
        query allAccessKeys (
          $publication_key: ID,
          $page: Int,
          $pageSize: Int,
          $search: String
        ) {
          allAccessKeys: allAccessKeys (
            publication_key: $publication_key,
            page: $page,
            pageSize: $pageSize,
            search: $search
          ) {
            count
            pageCount
            items {
              _key
              publication_key
              title
              environment
              apikey
              createdAt
              updatedAt
            }
          }
        }
      `,
      variables: function () {
        return {
          publication_key: this.$route.params.publication_key,
          page: this.page,
          pageSize: this.pageSize,
          search: this.currentSearch
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
    accessKeyList
  },
  computed: {
    ...mapFields('settings', {
      viewMode: 'accessKeys.viewMode',
      page: 'accessKeys.page',
      pageSize: 'accessKeys.pageSize',
      search: 'accessKeys.search'
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
  <v-container v-if="allAccessKeys">
    <v-layout justify-space-between align-center class="mb-3">
      <h1 class="primary--text">Access Keys</h1>
      <v-btn nuxt :to="`/publications/${$route.params.publication_key}/accessKeys/create`" color="primary" rounded>
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

    <accessKeyList :items="allAccessKeys.items" />

  </v-container>
</template>

<style lang="scss" scoped>
  .filename {
    color: #999;
    font-family: monospace;
    font-size: 90%;
  }
</style>

