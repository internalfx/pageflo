
<script>
import _ from 'lodash'

import { mapFields } from 'vuex-map-fields'
import { mapState, mapMutations, mapActions } from 'vuex'

import fieldTypes from '../../../lib/fieldTypes.js'

import choicesOption from './optionEditors/choicesOption.vue'
import contentTypesOption from './optionEditors/contentTypesOption.vue'
import groupModeOption from './optionEditors/groupModeOption.vue'
import hintOption from './optionEditors/hintOption.vue'
import imageSizeOption from './optionEditors/imageSizeOption.vue'
import requiredOption from './optionEditors/requiredOption.vue'
import selectModeOption from './optionEditors/selectModeOption.vue'

export default {
  data: function () {
    return {
    }
  },
  components: {
    choicesOption,
    contentTypesOption,
    groupModeOption,
    hintOption,
    imageSizeOption,
    requiredOption,
    selectModeOption
  },
  props: {
    path: String
  },
  computed: {
    ...mapState('editors/contentType', {
      contentType: state => state.contentType
    }),
    ...mapFields('editors/contentType', {
      selectedFieldId: 'selectedFieldId'
    }),
    optionsList: function () {
      if (this.fieldType) {
        return this.fieldType.optionList
      }

      return []
    },
    fieldPath: function () {
      const id = this.selectedFieldId
      const contentType = this.contentType

      let path = []

      const searchFields = function (subPath = null) {
        const path = subPath || 'fields'
        const fields = _.get(contentType, `${path}`) || []

        for (let idx = 0; idx < fields.length; idx += 1) {
          const field = fields[idx]

          if (field.id === id) {
            return [true, path + `[${idx}]`]
          }

          if (field.type === 'GroupLayout') {
            const check = searchFields(path + `[${idx}].options.fields`)
            if (check[0]) {
              return check
            }
          } else if (field.type === 'ColumnLayout') {
            const columns = _.get(field, 'options.columns') || []

            for (let colIdx = 0; colIdx < columns.length; colIdx += 1) {
              const check = searchFields(path + `[${idx}].options.columns[${colIdx}]`)
              if (check[0]) {
                return check
              }
            }
          }
        }

        return [false, path]
      }

      path = searchFields()[1]

      return path
    },
    fieldListPath: function () {
      const id = this.selectedFieldId
      const contentType = this.contentType

      let path = []

      const searchFields = function (subPath = null) {
        const path = subPath || 'fields'
        const fields = _.get(contentType, `${path}`) || []

        for (let idx = 0; idx < fields.length; idx += 1) {
          const field = fields[idx]

          if (field.id === id) {
            return [true, path]
          }

          if (field.type === 'GroupLayout') {
            const check = searchFields(path + `[${idx}].options.fields`)
            if (check[0]) {
              return check
            }
          } else if (field.type === 'ColumnLayout') {
            const columns = _.get(field, 'options.columns') || []

            for (let colIdx = 0; colIdx < columns.length; colIdx += 1) {
              const check = searchFields(path + `[${idx}].options.columns[${colIdx}]`)
              if (check[0]) {
                return check
              }
            }
          }
        }

        return [false, path]
      }

      path = searchFields()[1]

      return path
    },
    fieldType: function () {
      return this.field ? fieldTypes[this.field.type] : null
    },
    field: function () {
      return _.get(this.contentType, this.fieldPath)
    },
    label: {
      get: function () {
        return _.get(this, 'field.label')
      },
      set: function (value) {
        let slug = _.camelCase(value)

        if (_.isEmpty(slug)) {
          slug = _.uniqueId(`${_.camelCase(this.field.type)}_`)
        }

        this.set({
          label: value,
          slug: slug
        })
      }
    }
  },
  methods: {
    ...mapActions(['showConfirm']),
    ...mapMutations('editors/contentType', {
      storeSet: 'set'
    }),
    isEmpty: _.isEmpty,
    set: function (data) {
      for (const [key, val] of Object.entries(data)) {
        this.storeSet({ [`contentType.${this.fieldPath}.${key}`]: val })
      }
    },
    removeSelectedField: async function () {
      const answer = await this.showConfirm({
        body: 'This field and any fields it contains will be deleted'
      })

      const path = this.fieldListPath

      if (answer === 'yes') {
        const fields = _.cloneDeep(_.get(this.contentType, path))

        const idx = fields.findIndex(i => i.id === this.selectedFieldId)
        fields.splice(idx, 1)

        this.storeSet({ selectedFieldId: null })
        this.storeSet({ [`contentType.${path}`]: fields })
      }
    }
  }
}
</script>

<template>
  <v-card v-if="fieldType">
    <v-card-title>
      Edit {{fieldType.title}}
      <v-spacer></v-spacer>
      <v-btn fab small text @click.stop="selectedFieldId = null"><v-icon>$close</v-icon></v-btn>
    </v-card-title>
    <v-divider />
    <v-card-text>
      <div class="px-10 pt-10">
        <div v-if="field">
          <v-text-field v-model="label" label="Label" outlined clearable />
          <component :is="`${option}Option`" :path="fieldPath" v-for="(option, idx) of optionsList" :key="idx" />
        </div>
      </div>
    </v-card-text>
    <v-divider />
    <v-card-actions>
      <v-btn color="error" @click="removeSelectedField">Remove Field</v-btn>
    </v-card-actions>
  </v-card>
</template>

<style lang="scss" scoped>

</style>
