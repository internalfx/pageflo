
<script>
import _ from 'lodash'
import { mapFields } from 'vuex-map-fields'
import { mapState } from 'vuex'

import fieldTypes from '../../../../lib/fieldTypes.js'

export default {
  name: 'designColumnLayout',
  data: function () {
    return {
    }
  },
  props: {
    path: String
  },
  components: {
    fieldsList: function () { return import('../../fieldComponents/fieldsList.vue') }
  },
  computed: {
    ...mapState('editors/contentType', {
      contentType: state => state.contentType
    }),
    ...mapFields('editors/contentType', {
      selectedFieldId: 'selectedFieldId'
    }),
    field: function () {
      return _.get(this.contentType, this.path)
    },
    fieldType: function () {
      return fieldTypes[this.field.type]
    },
    fieldsPath1: function () {
      return `${this.path}.options.columns[0]`
    },
    fieldsPath2: function () {
      return `${this.path}.options.columns[1]`
    },
    fieldList1: function () {
      return _.get(this.contentType, this.fieldsPath1) || []
    },
    fieldList2: function () {
      return _.get(this.contentType, this.fieldsPath2) || []
    }
  },
  methods: {
  }
}
</script>

<template>
<div @click.stop="selectedFieldId = field.id" class="field-wrapper mb-4">
    <div class="d-flex align-center">
      <div class="flex-grow-1" style="overflow: hidden;">
        <div v-if="field.label" class="py-2 handle">
          <h3>{{field.label}}</h3>
        </div>
        <div>
          <v-row class="handle">
            <v-col cols="12" md="6" class="mt-0 pt-0">
              <div :class="{empty: fieldList1.length === 0}" class="fields-container pa-2" style="position: relative; overflow: hidden;">
                <div v-if="fieldList1.length === 0" class="placeholder d-flex justify-center align-center">
                  Drag Fields Here
                </div>
                <fieldsList class="list" :path="fieldsPath1" @select="selectedFieldId = $event" />
              </div>
            </v-col>
            <v-col cols="12" md="6" class="mt-0 pt-0">
              <div :class="{empty: fieldList2.length === 0}" class="fields-container pa-2" style="position: relative; overflow: hidden;">
                <div v-if="fieldList2.length === 0" class="placeholder d-flex justify-center align-center">
                  Drag Fields Here
                </div>
                <fieldsList class="list" :path="fieldsPath2" @select="selectedFieldId = $event" />
              </div>
            </v-col>
          </v-row>
        </div>
      </div>
    </div>
    <div class="cover-area"></div>
  </div>
</template>

<style lang="scss" scoped>

.handle {
  cursor: grab;
}

.handle {
  cursor: grab;
}

.fields-container {
  border: 1px dotted #fff;

  &.empty, &:hover {
    border: 1px dotted #aaa;
  }

  .placeholder {
    position: absolute;
    opacity: 0.5;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }

  .list {
    position: relative;
    z-index: 1;
  }
}

</style>
