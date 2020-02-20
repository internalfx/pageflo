<script>
import _ from 'lodash'
// import gql from 'graphql-tag'

import editBooleanField from '../components/edit/editBooleanField.vue'
import editCodeField from '../components/edit/editCodeField.vue'
import editColumnLayout from '../components/edit/editColumnLayout.vue'
import editDateField from '../components/edit/editDateField.vue'
import editFileField from '../components/edit/editFileField.vue'
import editGroupLayout from '../components/edit/editGroupLayout.vue'
import editLinkField from '../components/edit/editLinkField.vue'
import editMultiLineTextbox from '../components/edit/editMultiLineTextbox.vue'
import editReferenceField from '../components/edit/editReferenceField.vue'
import editRichTextEditor from '../components/edit/editRichTextEditor.vue'
import editSelectField from '../components/edit/editSelectField.vue'
import editSingleLineTextbox from '../components/edit/editSingleLineTextbox.vue'

import { mapState, mapMutations } from 'vuex'
import { } from 'vuex-map-fields'

export default {
  apollo: {
    // tags: {
    //   query: gql`
    //     query findTags ($query: String!) {
    //       tags: findTags (query: $query)
    //     }
    //   `,
    //   variables: function () {
    //     return {
    //       query: ''
    //     }
    //   }
    // }
  },
  data: function () {
    return {
    }
  },
  props: {
  },
  components: {
    editBooleanField,
    editCodeField,
    editColumnLayout,
    editDateField,
    editFileField,
    editGroupLayout,
    editLinkField,
    editMultiLineTextbox,
    editReferenceField,
    editRichTextEditor,
    editSelectField,
    editSingleLineTextbox
  },
  computed: {
    ...mapState('editors/entry', {
      contentType: state => state.contentType,
      entry: state => state.entry
    }),
    title: {
      get: function () {
        return _.get(this, 'entry.title')
      },
      set: function (val) {
        this.storeSet({ 'entry.title': val })
      }
    }
  },
  methods: {
    ...mapMutations('editors/entry', {
      storeSet: 'set'
    })
  }
}
</script>

<template>
  <div style="position: relative;">
    <v-text-field outlined v-model="title" label="Title" />
    <div v-for="field in contentType.fields" :key="field.id">
      <component :is="`edit${field.type}`" :path="field.slug" :field="field" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
</style>
