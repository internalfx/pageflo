
<script>
import _ from 'lodash'
import draggable from 'vuedraggable'

import { mapActions, mapState, mapMutations } from 'vuex'
import { mapFields } from 'vuex-map-fields'

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
    draggable
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
    },
    groupMode: {
      get: function () {
        return _.get(this, 'options.groupMode')
      },
      set: function (val) {
        this.set({ groupMode: val })
      }
    }
  },
  methods: {
    ...mapMutations('editors/contentType', {
      storeSet: 'set'
    }),
    set: function (data) {
      let options = _.cloneDeep(_.get(this.contentType, `${this.path}.options`))

      for (let [key, val] of Object.entries(data)) {
        _.set(options, key, val)
      }

      this.storeSet({ [`contentType.${this.path}.options`]: options })
    }
  }
}
</script>

<template>
  <div>
    <v-radio-group v-model="groupMode" column>
      <v-radio value="single" label="Single (allows only one set of fields)"></v-radio>
      <v-radio value="multiple" label="Multiple (allows multiple sets of group fields)"></v-radio>
    </v-radio-group>
  </div>
</template>

<style lang="scss" scoped>

.field-item {
  background-color: var(--v-secondary-lighten5);
  cursor: grab;
}

</style>

