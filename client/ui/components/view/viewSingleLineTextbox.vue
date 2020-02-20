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
    ...mapState('viewers/form', {
      template: state => state.template,
      form: state => state.form
    }),
    valueModel: {
      get: function () {
        return _.get(this, `form.content.${this.path}`)
      },
      set: function (val) {
      }
    }
  },
  methods: {
    ...mapMutations('viewers/form', {
      storeSet: 'set'
    })
  }
}
</script>

<template>
  <div class="">
    <v-text-field
      v-model="valueModel"
      :label="field.label"
      outlined
      readonly
      dense
    />
  </div>
</template>

<style lang="scss" scoped>
</style>

