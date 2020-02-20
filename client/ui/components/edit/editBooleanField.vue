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
  <div class="">
    <v-switch outlined v-model="valueModel" :label="field.label" />
  </div>
</template>

<style lang="scss" scoped>
</style>

