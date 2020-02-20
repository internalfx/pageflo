<script>
import _ from 'lodash'

import { mapState, mapMutations } from 'vuex'

import richtext from '../../editors/richtext.vue'

export default {
  props: {
    field: Object,
    path: String
  },
  components: {
    richtext
  },
  computed: {
    ...mapState('editors/entry', {
      contentType: state => state.contentType,
      entry: state => state.entry
    }),
    valueModel: {
      get: function () {
        const value = _.get(this, `entry.content.${this.path}`)
        return _.isPlainObject(value) ? value : null
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
  <div>
    <label>{{field.label}}</label>
    <richtext v-model="valueModel" :options="field.options" class="elevation-2" />
  </div>
</template>

<style lang="scss" scoped>

// .wrapper {
//   border: 2px solid var(--v-secondary-base);
//   border-radius: 3px;
// }

</style>
