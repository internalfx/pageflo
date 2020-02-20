
<script>
/* global FormData */

import { mapActions } from 'vuex'
// import { mapFields, mapMultiRowFields } from 'vuex-map-fields'
import format from '../../../lib/format.js'
import { to, errMsg } from '../../../lib/utils.js'
import gql from 'graphql-tag'

import _ from 'lodash'
import mime from 'mime-types'

import filePreview from '../../ui/filePreview.vue'

export default {
  apollo: {
    file: {
      query: gql`
        query ($_key: ID!) {
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
          _key: this.file_key
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
      fileData: {},
      inFlight: false,
      saved: false,
      dropReady: false,
      fileUpload: null
    }
  },
  props: {
    file_key: {
      type: String
    },
    showReplace: Boolean
  },
  components: {
    filePreview
  },
  computed: {
  },
  methods: {
    ...mapActions([
      'showConfirm',
      'showAlert',
      'showSnackbar'
    ]),
    ...format('bytes'),
    save: async function () {
      this.inFlight = true
      let res = await to(this.$apollo.mutate({
        mutation: gql`
          mutation ($file: FileInput!) {
            updateFile (file: $file) {
              _key
            }
          }
        `,
        variables: {
          file: this.fileData
        }
      }))

      if (res.isError) {
        this.showSnackbar({ message: errMsg(res), color: 'error' })
      } else {
        this.showSnackbar({ message: 'File saved.', color: 'success' })
      }

      this.inFlight = false
      this.saved = true
      this.result = res.data.updateFileById
    },
    dragover: function () {
      this.dropReady = true
    },
    dragleave: function () {
      this.dropReady = false
    },
    drop: async function (evt) {
      let dataTransfer
      if (evt.target.files) {
        dataTransfer = { files: evt.target.files }
      } else {
        dataTransfer = evt.dataTransfer
      }
      this.dropReady = false
      let files = []
      if (dataTransfer.items) {
        let items = dataTransfer.items
        for (let i = 0; i < items.length; i += 1) {
          if (items[i].kind === 'file') {
            let f = items[i].getAsFile()
            files.push(f)
          }
        }
      } else {
        let items = dataTransfer.files
        for (let i = 0; i < items.length; i += 1) {
          files.push(items[i])
        }
      }

      if (files.length > 1) {
        return this.showAlert({ title: 'Too many files selected.', body: 'You can only upload one file.' })
      }

      let mimeType = mime.lookup(files[0].name)

      let mimeClass = _.isString(mimeType) ? mimeType.split('/')[0] : null

      if (this.file.mimeClass === 'image' && mimeClass !== 'image') {
        return this.showAlert({ title: 'Wrong file type', body: 'An image file can only be replaced with another image.' })
      }
      if (this.file.mimeClass === 'video' && mimeClass !== 'video') {
        return this.showAlert({ title: 'Wrong file type', body: 'A video file can only be replaced with another video.' })
      }

      let newFile = _.first(files)

      this.fileUpload = {
        file: newFile,
        originalFilename: newFile.name,
        size: newFile.size,
        status: 'waiting',
        progress: 0,
        data: null
      }

      this.fileUpload.status = 'transferring'
      let formData = new FormData()
      let data = {
        filename: this.file.filename,
        originalFilename: this.fileUpload.originalFilename
      }
      formData.append('data', JSON.stringify(data))
      formData.append('file', this.fileUpload.file)

      await this.$axios({
        method: 'post',
        url: '/api/file/upload',
        data: formData,
        onUploadProgress: (evt) => {
          let percentCompleted = Math.round((evt.loaded / evt.total) * 100)
          this.fileUpload.progress = percentCompleted
        }
      })
      this.fileUpload.progress = 100
      this.fileUpload.status = 'complete'

      this.$apollo.queries.file.refetch()
    },
    dropClick: function () {
      this.$refs.fileInput.click()
    }
  },
  watch: {
    file: function (val) {
      this.fileData = _.pick(val, '_key', 'title', 'caption', 'altText', 'description')
    }
  }
}
</script>

<template>
  <div v-if="file">
    <v-row>
      <v-col cols="12" sm="6">
        <div class="d-flex justify-center align-center mb-4">
          <div>
            <filePreview :file="file" :config="{ sizing: 'inside', width: 600, height: 400 }" />
          </div>
        </div>

        <div>
          <div><strong>Uploaded Filename:</strong> {{file.uploadedFilename}}</div>
          <div><strong>Filename:</strong> {{file.filename}}</div>
          <div><strong>Size:</strong> {{bytes(file.size)}}</div>
          <div><strong>Type:</strong> {{file.mimeType}}</div>
        </div>
      </v-col>

      <v-col cols="12" sm="6">
        <div v-if="showReplace" class="mb-4">
          <div v-if="fileUpload == null" class="dropzone clickable mt-4" :class="{ready: dropReady}" @dragover.stop.prevent="dragover" @dragleave.stop.prevent="dragleave" @drop.stop.prevent="drop" @click="dropClick">
            <h1>Add Revision</h1>
            <h2><v-icon color="inherit">$upload</v-icon> Click to upload, or drop file here.</h2>
            <input ref="fileInput" type="file" @change="drop" :style="{display: 'none'}"/>
          </div>
          <div v-if="fileUpload != null" class="dropzone mt-4 pa-4">
            <div v-if="fileUpload.status === 'transferring'">
              <h1>Uploading New File...</h1>
              {{fileUpload.originalFilename}}<br>
              {{bytes(fileUpload.size)}}<br>
              <v-progress-linear class="mb-0" style="overflow: visible;" v-model="fileUpload.progress"></v-progress-linear>
            </div>
            <div v-if="fileUpload.status === 'complete'">
              <h1>Upload Complete!</h1>
              {{fileUpload.originalFilename}}<br>
              {{bytes(fileUpload.size)}}<br>
            </div>
          </div>
        </div>

        <v-text-field v-model="fileData.title" label="Title" />
        <v-text-field v-model="fileData.caption" label="Caption" />
        <v-text-field v-model="fileData.altText" label="Alt Text" />
        <v-textarea v-model="fileData.description" label="Description" />

        <v-btn color="primary" :loading="inFlight" :disabled="inFlight" @click="save">
          <v-icon left>$save</v-icon> Save
        </v-btn>
      </v-col>
    </v-row>
  </div>
</template>

<style lang="scss" scoped>

.clickable {
  cursor: pointer;
}

.dropzone {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: white;
  border: 2px dashed #777;
  color: #777;
  width: 100%;
  height: 150px;
  transition: 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);

  &.ready {
    background-color: #cd542d;
    border: 2px dashed #cd542d;
    color: #fff;
  }
}

</style>

