
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

    selectMode: {
      get: function () {
        return _.get(this, 'options.selectMode')
      },
      set: function (val) {
        this.set({ selectMode: val })
      }
    }
  },
  methods: {
    ...mapActions(['showConfirm']),
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

    isEmpty: _.isEmpty,
    addOptions: function () {
      let selectOptions = _.cloneDeep(_.get(this, 'options.selectOptions')) || []

      let newOptions = this.newOptionsInput.split('\n')
      newOptions = _.compact(newOptions)

      selectOptions = selectOptions.concat(newOptions)

      this.set({ selectOptions: selectOptions })

      this.newOptionsInput = null
      this.newOptionsDialog = false
    },
    removeOption: async function (option) {
      let answer = await this.showConfirm({
        body: 'This option will be removed.'
      })

      if (answer === 'yes') {
        let selectOptions = _.cloneDeep(_.get(this, 'options.selectOptions')) || []

        let idx = selectOptions.findIndex(i => i === option)
        selectOptions.splice(idx, 1)

        this.set({ selectOptions: selectOptions })
      }
    },
    dragOption: function (change) {
      let selectOptions = _.cloneDeep(_.get(this, 'options.selectOptions')) || []

      if (change.moved) {
        selectOptions.splice(change.moved.newIndex, 0, selectOptions.splice(change.moved.oldIndex, 1)[0])
      }

      this.set({ selectOptions: selectOptions })
    }
  }
}
</script>

<template>
  <div class="mb-5">
    <v-radio-group v-model="selectMode" column>
      <v-radio value="single" label="Single (users may only choose one option)"></v-radio>
      <v-radio value="multiple" label="Multiple (users may choose one or more options)"></v-radio>
    </v-radio-group>
    <h3>Select Field Options</h3>
    <draggable
      :value="options.selectOptions"
      @change="dragOption"
      @start="optionsDrag = true"
      @end="optionsDrag = false"
      animation="200"
    >
      <v-layout
        v-for="option in options.selectOptions"
        :key="option"
        class="field-item my-1 mx-0"
        justify-space-between
        align-center
      >
        <v-flex class="pa-2">
          <div class="subheading">{{option}}</div>
        </v-flex>
        <v-flex shrink class="text-xs-right pa-0">
          <v-btn class="pa-0 ma-0" text fab small color="grey" @click.stop="removeOption(option)"><v-icon>$delete</v-icon></v-btn>
        </v-flex>
      </v-layout>
    </draggable>
    <v-dialog v-model="newOptionsDialog" scrollable max-width="300px">
      <template v-slot:activator="{ on }">
        <v-btn color="primary" dark v-on="on">Add Options</v-btn>
      </template>
      <v-card>
        <v-card-title>Add Select Field Options</v-card-title>
        <v-divider></v-divider>
        <v-card-text style="min-height: 200px;">
          Enter one option per line.
          <v-textarea solo v-model="newOptionsInput" label="Options" />
          <v-layout>
            <v-btn color="secondary" dark @click="newOptionsDialog = false">cancel</v-btn>
            <v-spacer/>
            <v-btn color="primary" dark @click="addOptions">OK</v-btn>
          </v-layout>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<style lang="scss" scoped>

.field-item {
  background-color: var(--v-secondary-lighten5);
  cursor: grab;
}

</style>

