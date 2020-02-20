
<script>
import _ from 'lodash'

import { mapState, mapMutations } from 'vuex'

export default {
  data: function () {
    return {
    }
  },
  props: {
    path: String
  },
  components: {
  },
  computed: {
    ...mapState('editors/contentType', {
      contentType: state => state.contentType
    }),
    options: function () {
      return _.get(this.contentType, `${this.path}.options`) || {}
    },
    hint: {
      get: function () {
        return _.get(this, 'options.hint')
      },
      set: function (value) {
        this.set({ hint: value })
      }
    }
  },
  methods: {
    ...mapMutations('editors/contentType', {
      storeSet: 'set'
    }),
    set: function (data) {
      const options = _.cloneDeep(_.get(this.contentType, `${this.path}.options`))

      for (const [key, val] of Object.entries(data)) {
        _.set(options, key, val)
      }

      this.storeSet({ [`contentType.${this.path}.options`]: options })
    }
  }
}
</script>

<template>
  <v-text-field
    v-model="hint"
    label="Hint"
    hint="Message show to user when filling out this field"
    outlined
  />
</template>

<style lang="scss" scoped>
</style>
