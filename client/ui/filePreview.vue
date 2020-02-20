
<script>

import _ from 'lodash'
import { buildQueryString } from '../../lib/utils.js'

const archiveTypes = [
  'application/x-debian-package',
  'application/zip'
]

const wordTypes = [
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.oasis.opendocument.text'
]

const excelTypes = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
]

export default {
  data () {
    return {
      conf: {}
    }
  },
  props: {
    file: Object,
    config: Object,
    showInfo: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    mimeIcon: function () {
      if (this.file) {
        if (archiveTypes.includes(this.file.mimeType)) {
          return '$fileArchive'

        } else if (['application/pdf'].includes(this.file.mimeType)) {
          return '$filePdf'

        } else if (wordTypes.includes(this.file.mimeType)) {
          return '$fileWord'

        } else if (excelTypes.includes(this.file.mimeType)) {
          return '$fileExcel'

        } else if (['audio'].includes(this.file.mimeClass)) {
          return '$fileAudio'

        } else {
          return '$file'
        }
      }
    },
    query: function () {
      return `?${buildQueryString({ sha256: this.file.sha256, ...this.conf })}`
    },
    url: function () {
      return `/api/file/download/${this.file.filename}${this.query}`
    },
    videoHeight: function () {
      if (Number.isFinite(this.conf.height)) {
        return this.conf.height
      }
    }
  },
  methods: {
    load: function (evt) {
      this.$emit('load', evt)
    }
  },
  watch: {
    'config': _.debounce(function (val) {
      this.conf = val
    }, 500, {})
  },
  mounted: function () {
    this.conf = this.config
  },
  beforeMount: function () {
    this.conf = this.config
  }
}
</script>

<template>
  <div>
    <div v-if="file">
      <div v-if="file.mimeClass === 'image'">
        <img @load="load" :src="url" />
      </div>
      <div v-else-if="file.mimeClass === 'video'">
        <video @loadeddata="load" :src="url" preload="none" controls :style="{'max-height': `${this.videoHeight}px`}"></video>
      </div>
      <div v-else style="max-width: 128px; padding: 20px;">
        <div class="d-flex flex-column align-center">
          <div style="display: inline-block;">
            <v-icon x-large>{{mimeIcon}}</v-icon>
          </div>
          <div class="file-info pa-2" v-if="showInfo">
            <div class="text-xs-center text-truncate">{{file.uploadedFilename}}</div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="file == null">
      <div style="max-width: 128px; padding: 20px;">
        <div style="display: inline-block;">
          <v-icon x-large>$cancel</v-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>

video, img {
  display: block;
  max-width: 100%;
  // max-height: 30vh;
}

.file-info {
  max-width: 100%;
}

</style>
