
<script>
/* global FormData */

// import { mapState } from 'vuex'
// import { mapFields, mapMultiRowFields } from 'vuex-map-fields'
import format from '../../../../../lib/format.js'
import { to } from '../../../../../lib/utils.js'
// import gql from 'graphql-tag'
import _ from 'lodash'

import fileForm from '../../../../ui/forms/fileForm.vue'

export default {
  apollo: {
  },
  data: function () {
    return {
      files: [],
      paused: true,
      dropReady: false,
      queueTableHeaders: [
        { text: 'Filename', value: 'filename', sortable: false }
      ]
    }
  },
  components: {
    fileForm
  },
  computed: {
    filesWaiting: function () {
      return this.files.filter(f => f.status === 'waiting')
    },
    filesInQueue: function () {
      return this.files.filter(function (file) {
        return ['waiting', 'transferring'].includes(file.status)
      })
    },
    filesComplete: function () {
      return this.files.filter(function (file) {
        return file.data != null
      })
    }
  },
  methods: {
    ...format('bytes'),
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
      const files = []
      if (dataTransfer.items) {
        const items = dataTransfer.items
        for (let i = 0; i < items.length; i += 1) {
          if (items[i].kind === 'file') {
            const f = items[i].getAsFile()
            files.push(f)
          }
        }
      } else {
        const items = dataTransfer.files
        for (let i = 0; i < items.length; i += 1) {
          files.push(items[i])
        }
      }

      for (let idx = 0; idx < files.length; idx += 1) {
        const file = files[idx]
        this.files.push({
          id: _.uniqueId(),
          file: file,
          originalFilename: file.name,
          size: file.size,
          status: 'waiting',
          progress: 0,
          data: null
        })
        this.paused = false
      }
    },
    sendFiles: async function () {
      while (this.filesWaiting.length > 0) {
        const file = _.first(this.filesWaiting)
        file.status = 'transferring'
        const formData = new FormData()
        const data = {
          originalFilename: file.originalFilename,
          publication_key: this.$route.params.publication_key
        }
        formData.append('data', JSON.stringify(data))
        formData.append('file', file.file)

        const res = await to(this.$axios({
          method: 'post',
          url: '/api/file/upload',
          data: formData,
          onUploadProgress: (evt) => {
            const percentCompleted = Math.round((evt.loaded / evt.total) * 100)
            file.progress = percentCompleted
          }
        }))

        if (res.isError) {
          file.progress = 100
          file.status = 'failed'
        } else {
          file.progress = 100
          file.status = 'complete'
          file.data = res.data
        }
      }

      this.paused = true
    },
    dropClick: function () {
      this.$refs.fileInput.click()
    },
    canExit: function () {
      return this.filesInQueue.length === 0
    },
    beforeRouteLeave: async function () {
      await this.$store.dispatch('showPrompt', {
        title: 'Upload in progress...',
        body: 'You are currently uploading files, leaving this page before they are finished will cause them to be corrupted.',
        choices: ['ok']
      })

      return false
    }
  },
  watch: {
    paused: function (val) {
      if (val === false) {
        this.sendFiles()
      }
    }
  }
}
</script>

<template>
  <v-container>
    <h1 class="primary--text mb-3">Add Files</h1>

    <div class="dropzone mb-3" :class="{ready: dropReady}" @dragover.stop.prevent="dragover" @dragleave.stop.prevent="dragleave" @drop.stop.prevent="drop" @click="dropClick">
      <h2><v-icon color="inherit">$upload</v-icon> Click to upload, or drop files here.</h2>
      <input ref="fileInput" type="file" multiple @change="drop" :style="{display: 'none'}"/>
    </div>

    <div v-if="filesInQueue.length > 0">
      <h2 class="">Upload Queue</h2>
      <v-simple-table>
        <thead>
          <tr>
            <th class="text-left">Filename</th>
            <th class="text-left">Size</th>
            <th class="text-left">Status</th>
            <th class="text-left">Progress</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="file of filesInQueue" :key="file.id">
            <td>{{file.originalFilename}}</td>
            <td>{{bytes(file.size)}}</td>
            <td>{{file.status}}</td>
            <td style="width: 25%;">
              <v-progress-linear v-model="file.progress"></v-progress-linear>
            </td>
          </tr>
        </tbody>
      </v-simple-table>
    </div>

    <div v-if="filesComplete.length > 0">
      <h2 class="">Uploaded Files</h2>
      <v-card class="mb-3 pa-4" v-for="file of filesComplete" :key="file.id">
        <fileForm :file_key="file.data._key" />
      </v-card>
    </div>

  </v-container>
</template>

<style lang="scss" scoped>

.dropzone {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: white;
  border: 2px dashed #777;
  color: #777;
  width: 100%;
  height: 200px;
  margin-bottom: 1.5em;
  cursor: pointer;
  transition: 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);

  &.ready {
    background-color: #cd542d;
    border: 2px dashed #cd542d;
    color: #fff;
  }
}

</style>
