<script>

import _ from 'lodash'
import { mapState } from 'vuex'

import format from '../../../lib/format.js'
import { mapFields } from 'vuex-map-fields'

import filePreview from '../filePreview.vue'
import imageColors from '../imageColors.vue'
import gql from 'graphql-tag'

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
      inFlight: false,
      currentSearch: '',
      headers: [
        { text: 'Preview', value: 'preview', sortable: false },
        { text: 'Title', value: 'title', sortable: false },
        { text: 'Type/Color', value: 'mimeType', sortable: false },
        { text: 'Size', value: 'size', sortable: false, align: 'right' }
      ],
      fileTypeList: [
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
      ],
      selectedFileValue: []
    }
  },
  props: {
    value: Boolean,
    allowedTypes: Array
  },
  components: {
    filePreview,
    imageColors
  },
  computed: {
    ...mapState({
      publication_key: 'publication_key'
    }),
    ...mapFields('settings', {
      viewMode: 'filesDialog.viewMode',
      page: 'filesDialog.page',
      pageSize: 'filesDialog.pageSize',
      search: 'filesDialog.search',
      fileType: 'filesDialog.fileType'
    }),
    visible: {
      get: function () {
        return this.value
      },
      set: function (value) {
        this.$emit('input', value)
      }
    },
    selectedFile: function () {
      return _.get(this, 'selectedFileValue[0]') || null
    },
    notReady: function () {
      return (
        this.selectedFile == null
      )
    },
    fileTypes: function () {
      return this.fileTypeList.filter((item) => {
        if (this.allowedTypes) {
          return _.intersection(item.value, this.allowedTypes).length > 0
        } else {
          return true
        }
      })
    }
  },
  methods: {
    ...format('bytes'),
    paginate: function (args) {
      this.pageSize = args.itemsPerPage
    },
    clickOk: function () {
      this.$emit('select', this.selectedFile)
    }
  },
  mounted: function () {
    this.currentSearch = this.search
    this.fileType = _.get(this, 'fileTypes[0].value') || null
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
  <div>
    <v-dialog v-model="visible" max-width="1000">
      <v-card>
        <v-card-title class="primary white--text">
          Choose File
        </v-card-title>
        <v-card-text v-if="allFiles">
          <v-toolbar>
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

          <v-data-table
            :headers="headers"
            :items="allFiles.items"
            class="striped clickable"
            item-key="_key"
            @pagination="paginate"
            no-data-text="No files match your search."
            :items-per-page.sync="pageSize"
            :server-items-length="allFiles.count"
            :page.sync="page"
            :footer-props="{ 'items-per-page-options': [5] }"
            :loading="$apollo.queries.allFiles.loading"
            @click:row="selectedFileValue = [$event]"
            v-model="selectedFileValue"
            show-select
            single-select
          >
            <template v-slot:item.preview="{item}">
              <filePreview :file="item" :config="{ width: 80, height: 80, background: 'fff', format: 'jpg' }" />
            </template>
            <template v-slot:item.title="{item}">
              <h2>{{item.title}}</h2>
              <div>{{item.uploadedFilename}}</div>
              <div class="filename mt-1">{{item.filename}}</div>
            </template>
            <template v-slot:item.mimeType="{item}">
              <div class="mb-2">{{item.mimeType}}</div>
              <imageColors :colors="item.colors" />
            </template>
            <template v-slot:item.size="{item}">
              {{bytes(item.size)}}
              <div v-if="item.mimeClass === 'image'" class="font-weight-light">
                {{item.pixelWidth}} x {{item.pixelHeight}}
              </div>
            </template>
          </v-data-table>
        </v-card-text>
        <v-card-actions>
          <v-btn large color="primary" :disabled="notReady" @click="clickOk"><v-icon left>$complete</v-icon> ok</v-btn>
          <v-btn class="ml-1" text color="secondary" @click="visible = false"><v-icon left>$cancel</v-icon> Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style lang="scss" scoped>
</style>
