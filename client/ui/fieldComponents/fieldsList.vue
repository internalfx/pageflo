
<script>
import _ from 'lodash'

import draggable from 'vuedraggable'

import designBooleanField from '../components/design/designBooleanField.vue'
import designCodeField from '../components/design/designCodeField.vue'
import designDateField from '../components/design/designDateField.vue'
import designFileField from '../components/design/designFileField.vue'
import designLinkField from '../components/design/designLinkField.vue'
import designMultiLineTextbox from '../components/design/designMultiLineTextbox.vue'
// import designNumberField from '../components/design/designNumberField.vue'
import designReferenceField from '../components/design/designReferenceField.vue'
import designRichTextEditor from '../components/design/designRichTextEditor.vue'
import designSelectField from '../components/design/designSelectField.vue'
import designSingleLineTextbox from '../components/design/designSingleLineTextbox.vue'

import designGroupLayout from '../components/design/designGroupLayout.vue'
import designColumnLayout from '../components/design/designColumnLayout.vue'

import { mapState, mapActions, mapMutations } from 'vuex'
import { mapFields } from 'vuex-map-fields'

import fieldTypes from '../../../lib/fieldTypes.js'

export default {
  data: function () {
    return {
    }
  },
  props: {
    path: String
  },
  components: {
    draggable,

    designBooleanField,
    designCodeField,
    designDateField,
    designFileField,
    designLinkField,
    designMultiLineTextbox,
    // designNumberField,
    designReferenceField,
    designRichTextEditor,
    designSelectField,
    designSingleLineTextbox,

    designGroupLayout,
    designColumnLayout
  },
  computed: {
    ...mapState('editors/contentType', {
      contentType: state => state.contentType
    }),
    ...mapFields('editors/contentType', {
      selectedFieldId: 'selectedFieldId'
    }),
    fieldList: function () {
      return _.get(this.contentType, this.path) || []
    }
  },
  methods: {
    ...mapActions(['showConfirm']),
    ...mapMutations('editors/contentType', {
      storeSet: 'set'
    }),
    dragField: function (change) {
      setImmediate(() => {
        const fields = _.cloneDeep(_.get(this.contentType, this.path)) || []

        if (change.moved) {
          fields.splice(change.moved.newIndex, 0, fields.splice(change.moved.oldIndex, 1)[0])
        } else if (change.added) {
          fields.splice(change.added.newIndex, 0, change.added.element)
        } else if (change.removed) {
          fields.splice(change.removed.oldIndex, 1)
        }

        this.storeSet({ [`contentType.${this.path}`]: fields })
      })
    },
    fieldType: function (type) {
      return fieldTypes[type]
    },
    getPath: function (idx) {
      return `${this.path}[${idx}]`
    },
    removeField: async function (fieldId) {
      const answer = await this.showConfirm({
        body: 'This field and any fields it contains will be deleted'
      })

      if (answer === 'yes') {
        const fields = _.cloneDeep(_.get(this.contentType, this.path))

        const idx = fields.findIndex(i => i.id === fieldId)
        fields.splice(idx, 1)

        this.storeSet({ [`contentType.${this.path}`]: fields })
      }
    }
  }
}
</script>

<template>
  <div>
    <draggable
      :value="fieldList"
      @change="dragField"
      animation="150"
      class="draggable"
      group="fields"
    >
      <template v-for="(field, idx) of fieldList">
        <component :path="getPath(idx)" :is="`design${field.type}`" :key="field.id" @remove="removeField"/>
      </template>
    </draggable>
  </div>
</template>

<style lang="scss" scoped>

.draggable {
  min-height: 100px;
}

</style>
