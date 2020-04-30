
<script>
import { mapState } from 'vuex'
import { mapFields } from 'vuex-map-fields'
import format from '../../../../../lib/format.js'
import gql from 'graphql-tag'
import _ from 'lodash'

import fileList from '../../../../ui/lists/fileList.vue'
// import fileGrid from '../../../../ui/grids/fileGrid.vue'
// import filePreview from '../../../../ui/filePreview.vue'
// import imageColors from '../../../../ui/imageColors.vue'

export default {
  apollo: {
    allFiles: {
      query: gql`
        query allFiles (
          $publication_key: ID!,
          $page: Int,
          $pageSize: Int,
          $search: String,
          $fileType: JSON
        ) {
          allFiles: allFiles (
            publication_key: $publication_key,
            page: $page,
            pageSize: $pageSize,
            search: $search,
            fileType: $fileType
          ) {
            count
            pageCount
            items {
              _key
              title
              filename
              uploadedFilename
              size
              sha256
              mimeType
              mimeClass
              ext
              pixelWidth
              pixelHeight
              colors
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
          fileType: this.fileType
        }
      },
      fetchPolicy: 'network-only'
    }
  },
  data: function () {
    return {
      currentSearch: '',
      headers: [
        { text: 'Preview', value: 'preview', sortable: false },
        { text: 'Title', value: 'title', sortable: false },
        { text: 'Colors', value: 'colors', sortable: false },
        { text: 'Type', value: 'mimeType' },
        { text: 'Size', value: 'size', align: 'right' }
      ],
      fileTypes: [
        { text: 'Any Type', value: null },
        { text: 'Image', value: ['image'] },
        { text: 'Video', value: ['video'] },
        { text: 'Text', value: ['text'] },
        { text: 'PDF', value: ['application/pdf'] },
        {
          text: 'Archive',
          value: [
            'application/x-bzip2',
            'application/gzip',
            'application/x-xz',
            'application/zip'
          ]
        }
      ]
    }
  },
  components: {
    fileList,
    // fileGrid,
    // filePreview,
    // imageColors
  },
  computed: {
    ...mapFields('settings', {
      viewMode: 'files.viewMode',
      page: 'files.page',
      pageSize: 'files.pageSize',
      search: 'files.search',
      fileType: 'files.fileType'
    })
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
    }, 333, { maxWait: 1000 }),
    fileType: function (val) {
      this.page = 1
    }
  }
}
</script>

<template>
  <v-container v-if="allFiles">
    <v-layout justify-space-between align-center class="mb-3">
      <h1 class="primary--text">Files</h1>
      <v-btn nuxt :to="`/publications/${$route.params.publication_key}/files/create`" color="primary" rounded>
        <v-icon left>$upload</v-icon> Add New
      </v-btn>
    </v-layout>
    <v-toolbar>
      <!-- <v-btn-toggle v-model="viewMode" class="transparent" mandatory>
        <v-btn :value="`list`" text>
          <v-icon>$list</v-icon>
        </v-btn>
        <v-btn :value="`grid`" text>
          <v-icon>$grid</v-icon>
        </v-btn>
      </v-btn-toggle>
      <v-spacer /> -->
      <v-select
        v-model="fileType"
        :items="fileTypes"
        hide-details
        solo
      ></v-select>
      <v-spacer />
      <v-text-field
        v-model="search"
        hide-details
        prepend-icon="$search"
        placeholder="Search"
        solo
      ></v-text-field>
    </v-toolbar>
    <fileList v-if="viewMode === 'list'" :fileConnection="allFiles" />
    <!-- <fileGrid v-if="viewMode === 'grid'" :files="allFiles.files" />
    <div v-if="viewMode === 'grid'" class="d-flex justify-center my-3">
      <v-pagination v-model="page" :length="allFiles.pageCount" />
    </div> -->
  </v-container>
</template>

<style lang="scss" scoped>
  .filename {
    color: #999;
    font-family: monospace;
    font-size: 90%;
  }
</style>
