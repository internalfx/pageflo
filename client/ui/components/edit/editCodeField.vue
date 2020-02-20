<script>
import _ from 'lodash'

import { mapState, mapMutations } from 'vuex'

export default {
  props: {
    field: Object,
    path: String
  },
  components: {
  },
  computed: {
    ...mapState('editors/entry', {
      contentType: state => state.contentType,
      entry: state => state.entry
    }),
    valueModel: {
      get: function () {
        return _.get(this, `entry.content.${this.path}`)
      },
      set: function (val) {
        this.storeSet({ [`entry.content.${this.path}`]: val })
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
  <div class="py-2 ma-0">
    <v-textarea
      class="code-field"
      v-model="valueModel"
      :label="field.label"
      rows="9"
      :hint="field.options.hint"
      outlined
    />
  </div>
</template>

<style lang="scss">
.code-field textarea {
  font-family: 'monospace';
  color: #19755a !important;
}
</style>

