
<script>
import _ from 'lodash'
import { mapFields } from 'vuex-map-fields'
import { mapState } from 'vuex'

import fieldTypes from '../../../../lib/fieldTypes.js'

export default {
  data: function () {
    return {
    }
  },
  props: {
    path: String
  },
  components: {
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
  <div @click.stop="selectedFieldId = field.id" class="field-wrapper mb-4">
    <div class="d-flex align-center">
      <div class="mr-3"><v-icon :icon="fieldType.icon" fixed-width>$generic</v-icon></div>
      <div class="d-flex">
        <div class="d-flex justify-center align-center" style="max-width: 300px; max-height: 150px;">
          <!-- <filePreview :file="file" :config="{ height: 150, background: 'fff', format: 'jpg' }" /> -->
        </div>
        <div class="pa-4">
          <v-btn color="primary" outlined rounded>
            <v-icon>$search</v-icon> Search Files
          </v-btn>
        </div>
      </div>
    </div>
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
