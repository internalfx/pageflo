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
        const value = _.get(this, `entry.content.${this.path}`)

        if (this.field.options.selectMode === 'multiple' && _.isString(value)) {
          return [value]
        } else if (this.field.options.selectMode === 'single' && _.isArray(value)) {
          return _.first(value)
        }

        return value
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
  <div class="">
    <v-select
      :items="field.options.choices"
      v-model="valueModel"
      :label="field.label"
      outlined
      :multiple="field.options.selectMode === 'multiple'"
    />
  </div>
</template>

<style lang="scss" scoped>
</style>
