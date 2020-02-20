<script>
import _ from 'lodash'

// import { mapActions, mapState, mapMutations } from 'vuex'

import draggable from 'vuedraggable'

import editBooleanField from './editBooleanField.vue'
import editCodeField from './editCodeField.vue'
import editDateField from './editDateField.vue'
import editFileField from './editFileField.vue'
import editLinkField from './editLinkField.vue'
import editMultiLineTextbox from './editMultiLineTextbox.vue'
import editReferenceField from './editReferenceField.vue'
import editRichTextEditor from './editRichTextEditor.vue'
import editSelectField from './editSelectField.vue'
import editSingleLineTextbox from './editSingleLineTextbox.vue'

export default {
  name: 'editColumnLayout',
  data: function () {
    return {
      expanded: []
    }
  },
  props: {
    field: Object,
    path: String
  },
  components: {
    draggable,

    editBooleanField,
    editCodeField,
    editDateField,
    editFileField,
    editLinkField,
    editMultiLineTextbox,
    editReferenceField,
    editRichTextEditor,
    editSelectField,
    editSingleLineTextbox,

    editColumnLayout: function () { return import('./editColumnLayout.vue') },
    editGroupLayout: function () { return import('./editGroupLayout.vue') }
  },
  computed: {
  },
  methods: {
    getFieldPath: function (slug) {
      const path = this.path || ''
      return _.compact([path.split('.').slice(0, -1).join('.'), slug]).join('.')
    }
  }
}
</script>

<template>
  <div>
    <h3 v-if="field.label">{{field.label}}</h3>
    <v-row>
      <v-col cols="12" md="6" v-for="(column, idx) of field.options.columns" :key="idx" class="py-0">
        <div v-for="(field, fieldIdx) of column" :key="fieldIdx">
          <component :is="`edit${field.type}`" :path="`${getFieldPath(field.slug)}`" :field="field" />
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<style lang="scss" scoped>

.handle {
  cursor: grab;
}

.addbar-wrapper {
  padding: 5px 0 25px;
  position: relative;

  .addbar {
    height: 2px;
    background-color: #ddd;

    .addbar-inner {
      display: none;
    }
  }

  &:hover {
    .addbar {
      .addbar-inner {
        display: flex;
      }
    }
  }
}

</style>
