
<script>
// import { mapState, mapActions } from 'vuex'
import { mapFields } from 'vuex-map-fields'
import format from '../../../lib/format.js'
import gql from 'graphql-tag'
import _ from 'lodash'

import publicationList from '../../ui/lists/publicationList.vue'

export default {
  apollo: {
    publications: {
      query: gql`
        query allPublications (
          $page: Int,
          $pageSize: Int,
          $search: String
        ) {
          publications: allPublications (
            page: $page,
            pageSize: $pageSize,
            search: $search
          ) {
            count
            pageCount
            items {
              _key
              title
            }
          }
        }
      `,
      variables: function () {
        return {
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
    publicationList
  },
  computed: {
    ...mapFields('settings', {
      viewMode: 'publications.viewMode',
      page: 'publications.page',
      search: 'publications.search'
    }),
    pageSize: function () {
      return this.viewMode === 'list' ? 18 : 18
    }
  },
  methods: {
    ...format('bytes')
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
  <v-container v-if="publications">
    <v-layout justify-space-between align-center class="mb-3">
      <h1 class="primary--text">Publications</h1>
      <v-btn nuxt to="/publications/create" color="primary" rounded>
        <v-icon left>$plus</v-icon> Add New
      </v-btn>
    </v-layout>
    <v-toolbar>
      <!-- <v-btn-toggle v-model="viewMode" class="transparent" mandatory>
        <v-btn :value="`list`" flat>
          <v-icon>$list</v-icon>
        </v-btn>
        <v-btn :value="`grid`" flat>
          <v-icon>$grid</v-icon>
        </v-btn>
      </v-btn-toggle> -->
      <!-- <v-spacer /> -->
      <v-text-field
        v-model="search"
        hide-details
        prepend-icon="$search"
        placeholder="Search"
        solo
        flat
      ></v-text-field>
    </v-toolbar>

    <publicationList v-show="viewMode === 'list'" :items="publications.items" />
    <!-- <componentGrid v-show="viewMode === 'grid'" :components="publications.items" /> -->

    <v-layout justify-center class="my-3">
      <v-pagination v-model="page" :length="publications.pageCount" />
    </v-layout>
  </v-container>
</template>

<style lang="scss" scoped>
  .filename {
    color: #999;
    font-family: monospace;
    font-size: 90%;
  }
</style>

