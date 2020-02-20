
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
      <v-card class="mb-4" outlined>
        <h3 class="pt-4 px-4">{{field.label}}</h3>
        <div class="px-4">
          <v-row>
            <v-col cols="12" sm="6" lg="3">
              <v-text-field label="Caption" hide-details outlined/>
            </v-col>
            <v-col cols="12" sm="6" lg="3">
              <v-text-field label="URL" hide-details outlined/>
            </v-col>
            <v-col cols="12" sm="6" lg="3">
              <v-text-field label="class" hide-details outlined/>
            </v-col>
            <v-col cols="12" sm="6" lg="3">
              <v-switch label="Open in new window" hide-details/>
            </v-col>
          </v-row>
        </div>
      </v-card>
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
