
<script>
import { mapActions } from 'vuex'
import { mapFields } from 'vuex-map-fields'
import format from '../../../lib/format.js'
import gql from 'graphql-tag'
import { to, errMsg } from '../../../lib/utils.js'

import filePreview from '../filePreview.vue'
import imageColors from '../imageColors.vue'

export default {
  apollo: {
  },
  data: function () {
    return {
      inFlight: false,
      headers: [
        { text: 'Preview', value: 'preview', sortable: false },
        { text: 'Title', value: 'title', sortable: false },
        { text: 'Type/Color', value: 'mimeType', sortable: false },
        { text: 'Size', value: 'size', sortable: false, align: 'right' },
        { text: 'Actions', value: 'actions', sortable: false, align: 'right' }
      ]
    }
  },
  props: {
    fileConnection: Object
  },
  components: {
    filePreview,
    imageColors
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
    ...mapActions([
      'showConfirm',
      'showSnackbar'
    ]),
    ...format('bytes'),
    destroy: async function (file) {
      this.inFlight = true

      const choice = await this.showConfirm({
        title: 'Are you sure?',
        body: `File ${file.title} (${file.filename}) will be deleted!`
      })

      if (choice === 'yes') {
        const res = await to(this.$apollo.mutate({
          mutation: gql`
            mutation ($_key: ID!) {
              destroyFile (_key: $_key) {
                _key
              }
            }
          `,
          variables: {
            _key: file._key
          },
          refetchQueries: ['allFiles']
        }))

        if (res.isError) {
          console.log(res)
        }

        if (res.isError) {
          this.showSnackbar({ message: errMsg(res), color: 'error' })
        } else {
          this.showSnackbar({ message: 'File deleted.', color: 'secondary' })
        }
      }

      this.inFlight = false
    },
    paginate: function (args) {
      this.pageSize = args.itemsPerPage
    }
  }
}
</script>

<template>
  <v-data-table
    :headers="headers"
    :items="fileConnection.items"
    item-key="_key"
    class="striped"
    @pagination="paginate"
    no-data-text="No files match your search."
    :server-items-length="fileConnection.count"
    :page.sync="page"
    :footer-props="{ 'items-per-page-options': [6,12,24] }"
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
    <template v-slot:item.actions="{item}">
      <v-tooltip top>
        <template v-slot:activator="{on}">
          <span v-on="on">
            <v-btn text fab small class="ma-0 mr-2" :to="`/publications/${$route.params.publication_key}/files/${item._key}/edit`">
              <v-icon>$edit</v-icon>
            </v-btn>
          </span>
        </template>
        <span>Edit</span>
      </v-tooltip>
      <v-tooltip top>
        <template v-slot:activator="{on}">
          <span v-on="on">
            <v-btn text fab small color="error" class="ma-0" @click="destroy(item)">
              <v-icon>$delete</v-icon>
            </v-btn>
          </span>
        </template>
        <span>Delete</span>
      </v-tooltip>
    </template>
  </v-data-table>
</template>

<style lang="scss" scoped>
  .filename {
    color: #999;
    font-family: monospace, monospace;
    font-size: 90%;
  }
</style>
