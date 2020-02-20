<script>
import _ from 'lodash'
import fieldsEditor from '../fieldComponents/fieldsEditor.vue'

import { mapState, mapMutations } from 'vuex'

export default {
  apollo: {
  },
  data: function () {
    return {
    }
  },
  props: {
  },
  components: {
    fieldsEditor
  },
  computed: {
    ...mapState('editors/contentType', {
      contentType: state => state.contentType
    }),
    isWebpage: {
      get: function () {
        return this.contentType.isWebpage
      },
      set: function (val) {
        this.set({ 'contentType.isWebpage': val })
      }
    },
    contentMode: {
      get: function () {
        return this.contentType.contentMode
      },
      set: function (val) {
        this.set({ 'contentType.contentMode': val })
      }
    }
  },
  methods: {
    ...mapMutations('editors/contentType', {
      set: 'set'
    }),
    checkSlug: function () {
      if (_.isEmpty(this.contentType.slug)) {
        this.set({ 'contentType.slug': _.camelCase(this.contentType.title) })
      }
    }
  }
}
</script>

<template>
  <div v-if="contentType" style="position: relative;">
    <v-card class="my-3 pa-4">
      <h2 class="mb-3">Settings</h2>
      <v-text-field :value="contentType.title" @input="set({ 'contentType.title': $event })" label="Title" @blur="checkSlug" />
      <v-text-field :value="contentType.slug" @input="set({ 'contentType.slug': $event })" label="Slug" hint="The name used in the API" />
      <!-- <v-switch v-model="isWebpage" label="Is a webpage?" />
      <div v-if="contentType.isWebpage">
        <v-text-field
          :value="contentType.urlTemplate" @input="set({ 'contentType.urlTemplate': $event })"
          label="Default URL Template"
          prefix="http://example.com"
        />
      </div> -->
      <v-radio-group v-model="contentMode" column>
        <v-radio value="single" label="Single (For creating only a single entry, like a contact or home page)"></v-radio>
        <v-radio value="multiple" label="Multiple (For creating multiple entries, like news or blog pages)"></v-radio>
      </v-radio-group>
    </v-card>
    <v-card class="my-3 pa-4">
      <fieldsEditor :path="`fields`" />
    </v-card>
  </div>
</template>

<style lang="scss" scoped>
</style>

