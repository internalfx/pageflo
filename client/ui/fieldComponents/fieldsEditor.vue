
<script>
import _ from 'lodash'
import optionsEditor from './optionsEditor.vue'
import fieldsList from './fieldsList.vue'
import { mapActions, mapState } from 'vuex'
import { mapFields } from 'vuex-map-fields'
import draggable from 'vuedraggable'

import { createId } from '../../../lib/utils.js'
import fieldTypes from '../../../lib/fieldTypes.js'
export default {
  data: function () {
    return {
      newFieldsdialog: false,
      fieldTypes,
      selectedFieldGroup: null,
      showDialog: false
    }
  },
  props: {
    path: String
  },
  components: {
    optionsEditor,
    fieldsList,
    draggable,

  },
  computed: {
    ...mapState('editors/contentType', {
      contentType: state => state.contentType
    }),
    ...mapFields('editors/contentType', {
      selectedFieldId: 'selectedFieldId'
    }),
    fieldTypeList: function () {
      return Object.values(fieldTypes)
    },
    showFieldEditor: {
      get: function () {
        return this.selectedFieldId != null
      },
      set: function (val) {
        if (!val) {
          this.selectedFieldId = null
        }
      }
    }
  },
  methods: {
    ...mapActions([
      'showConfirm'
    ]),
    ...mapActions('editors/contentType', {
      addField: 'addField'
    }),
    cloneField: function (obj) {
      const fieldType = fieldTypes[obj.slug]

      const field = {
        ...fieldType.defaults,
        id: createId(),
        options: {}
      }

      if ([
        'GroupLayout'
      ].includes(field.type)) {
        field.options.groupMode = 'single'
      }

      if ([
        'ReferenceField',
        'SelectField'
      ].includes(field.type)) {
        field.options.selectMode = 'single'
      }

      if ([
        'ColumnLayout'
      ].includes(field.type)) {
        field.slug = _.uniqueId(`${field.type}_`)
        field.label = null
      }

      if ([
        'DateField',
        'MultiLineTextbox',
        'SelectField',
        'SingleLineTextbox'
      ].includes(field.type)) {
        field.options.required = true
      }

      console.log(field)

      return field
    }
  }
}
</script>

<template>
  <div>
    <v-row>
      <v-col cols="9">
        <h2 class="mb-3">Fields</h2>

        <v-card outlined class="pa-12">
          <fieldsList :path="`${path}`" />
        </v-card>
      </v-col>
      <v-col cols="3" class="pl-2">
        <div style="position: sticky; top: 100px;">
          <div class="px-4">
            <v-row class="mt-6 mb-7 align-center">
              <v-col class="d-flex">
                <h3>Add Fields</h3>
              </v-col>
              <v-col cols="auto" class="d-flex justify-end">
              </v-col>
            </v-row>
          </div>
          <draggable
            :value="fieldTypeList"
            :clone="cloneField"
            animation="200"
            class="draggable"
            :group="{ name: 'fields', pull: 'clone', put: false }"
          >
            <template v-for="type of fieldTypeList">
              <div :key="type.slug" class="d-flex align-center handle">
                <div class="px-5 py-3">
                  <v-icon :icon="type.icon" fixed-width>$generic</v-icon>
                </div>
                <div class="px-1 py-3">{{type.title}}</div>
              </div>
            </template>
          </draggable>
        </div>
      </v-col>
    </v-row>
    <v-dialog v-model="showFieldEditor" scrollable max-width="700px">
      <optionsEditor :path="`${path}`" />
    </v-dialog>
  </div>
</template>

<style lang="scss" scoped>
.handle {
  cursor: grab;
}
</style>
