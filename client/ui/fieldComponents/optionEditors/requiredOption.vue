
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
    required: {
      get: function () {
        return _.get(this, 'options.required')
      },
      set: function (value) {
        this.set({ required: value })
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
  <v-checkbox outlined v-model="required" label="Required Field" />
</template>

<style lang="scss" scoped>
</style>
