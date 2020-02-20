
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
    groupMode: {
      get: function () {
        return _.get(this, 'options.groupMode')
      },
      set: function (val) {
        console.log(val)
        this.set({ groupMode: val })
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
  <v-radio-group v-model="groupMode" column>
    <v-radio value="single" label="Single (allows only one set of fields)"></v-radio>
    <v-radio value="multiple" label="Multiple (allows multiple sets of group fields)"></v-radio>
  </v-radio-group>
</template>

<style lang="scss" scoped>

.field-item {
  background-color: var(--v-secondary-lighten5);
  cursor: grab;
}

</style>
