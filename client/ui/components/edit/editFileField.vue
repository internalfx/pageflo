<script>
import _ from 'lodash'

import { mapState, mapMutations } from 'vuex'
import gql from 'graphql-tag'

import filePreview from '../../filePreview.vue'
import filesDialog from '../../dialogs/filesDialog.vue'

export default {
  apollo: {
    file: {
      query: gql`
        query ($_key: ID) {
          file: getFile (_key: $_key) {
            _key
            title
            caption
            altText
            description
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
      `,
      variables: function () {
        return {
          _key: this.valueModel
        }
      },
      result: function (res) {
        this.fileData = _.omit(res.data.record, '__typename')
      },
      fetchPolicy: 'no-cache'
    }
  },
  data: function () {
    return {
      dialog: false
    }
  },
  props: {
    field: Object,
    path: String
  },
  components: {
    filePreview,
    filesDialog
  },
  computed: {
    ...mapState('editors/entry', {
      contentType: state => state.contentType,
      entry: state => state.entry
    }),
    valueModel: {
      get: function () {
        return _.get(this, `entry.content.${this.path}`)
      },
      set: function (val) {
        this.storeSet({ [`entry.content.${this.path}`]: val })
      }
    }
  },
  methods: {
    ...mapMutations('editors/entry', {
      storeSet: 'set'
    }),
    selectFile: function (file) {
      this.dialog = false
      this.valueModel = file._key
    }
  }
}
</script>

<template>
  <v-card class="mb-3" outlined>
    <v-card-title>{{field.label}}</v-card-title>
    <div class="d-flex align-center">
      <div class="d-flex justify-center align-center" style="max-width: 300px; max-height: 100px;">
        <filePreview :file="file" :config="{ height: 100, background: 'fff', format: 'jpg' }" />
      </div>
      <div v-if="valueModel == null">No File Selected</div>
      <div class="pa-4">
        <v-btn color="primary" small @click="dialog = true">
          <v-icon left>$search</v-icon> Choose File
        </v-btn>
        <v-btn v-if="valueModel != null" small color="secondary" @click="valueModel = null">
          <v-icon left>$cancel</v-icon> Remove File
        </v-btn>
      </div>
    </div>
    <filesDialog v-model="dialog" @select="selectFile" />
  </v-card>
</template>

<style lang="scss" scoped>
</style>
