
<script>
import _ from 'lodash'

import { mapActions, mapState, mapMutations } from 'vuex'
import { mapFields } from 'vuex-map-fields'

export default {
  data: function () {
    return {
    }
  },
  props: {
    path: String
  },
  computed: {
    ...mapState('editors/contentType', {
      contentType: state => state.contentType
    }),
    ...mapFields('editors/contentType', {
      selectedFieldId: 'selectedFieldId'
    }),
    options: function () {
      return _.get(this.contentType, `${this.path}.options`) || {}
    }
  },
  methods: {
    isEmpty: _.isEmpty,
    ...mapMutations('editors/contentType', {
      storeSet: 'set'
    }),
    set: function (data) {
      let options = _.cloneDeep(_.get(this.contentType, `${this.path}.options`))

      for (let [key, val] of Object.entries(data)) {
        _.set(options, key, val)
      }

      this.storeSet({ [`contentType.${this.path}.options`]: options })
    },
  }
}
</script>

<template>
  <div>
    <v-row>
      <v-col sm="6">
        <v-text-field :value="options.minLength" @input="set({ minLength: $event })" label="Minimum Length" outlined />
      </v-col>
      <v-col sm="6">
        <v-text-field :value="options.maxLength" @input="set({ maxLength: $event })" label="Maximum Length" outlined />
      </v-col>
    </v-row>
  </div>
</template>

<style lang="scss" scoped>


</style>

