
<script>
import _ from 'lodash'

import { mapState, mapMutations } from 'vuex'

export default {
  data: function () {
    return {
      newOptionsDialog: false,
      newOptionsInput: null,
      optionsDrag: false
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
    selectMode: {
      get: function () {
        return _.get(this, 'options.selectMode')
      },
      set: function (val) {
        console.log(val)
        this.set({ selectMode: val })
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
  <v-radio-group v-model="selectMode" column>
    <v-radio value="single" label="Single (users may only choose one option)"></v-radio>
    <v-radio value="multiple" label="Multiple (users may choose one or more options)"></v-radio>
  </v-radio-group>
</template>

<style lang="scss" scoped>

.field-item {
  background-color: var(--v-secondary-lighten5);
  cursor: grab;
}

</style>
