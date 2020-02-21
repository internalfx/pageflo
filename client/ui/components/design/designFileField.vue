
<script>
import _ from 'lodash'
import { mapFields } from 'vuex-map-fields'
import { mapState } from 'vuex'

import fieldTypes from '../../../../lib/fieldTypes.js'
import filePreview from '../../filePreview.vue'

export default {
  data: function () {
    return {
      file: null
    }
  },
  props: {
    path: String
  },
  components: {
    filePreview
  },
  computed: {
    ...mapState('editors/contentType', {
      contentType: state => state.contentType,
      conflicts: state => state.conflicts
    }),
    error: function () {
      if (this.conflicts && this.conflicts.fieldIds.includes(this.field.id)) {
        return 'This field has the same name as another field.'
      }

      return null
    },
    ...mapFields('editors/contentType', {
      selectedFieldId: 'selectedFieldId'
    }),
    fieldType: function () {
      return fieldTypes[this.field.type]
    },
    field: function () {
      return _.get(this, `contentType.${this.path}`)
    }
  },
  methods: {
  }
}
</script>

<template>
  <div @click.stop="selectedFieldId = field.id" class="field-wrapper">
    <v-card class="mb-3" outlined>
      <v-card-title>{{field.label}}</v-card-title>
      <div class="d-flex align-center">
        <div class="d-flex justify-center align-center" style="max-width: 300px; max-height: 100px;">
          <filePreview :file="file" :config="{ height: 100, background: 'fff', format: 'jpg' }" />
        </div>
        <div>No File Selected</div>
        <div class="pa-4">
          <v-btn color="primary" small>
            <v-icon left>$search</v-icon> Choose File
          </v-btn>
        </div>
      </div>
    </v-card>
    <div class="cover-area"></div>
  </div>
</template>

<style lang="scss" scoped>

.field-wrapper {
  cursor: grab;
  position: relative;

  .cover-area {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }
}

</style>
