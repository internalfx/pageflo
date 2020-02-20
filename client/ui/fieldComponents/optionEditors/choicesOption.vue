
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
    }
  },
  methods: {
    ...mapActions(['showConfirm']),
    ...mapMutations('editors/contentType', {
      storeSet: 'set'
    }),
    set: function (data) {
      const options = _.cloneDeep(_.get(this.contentType, `${this.path}.options`))

      for (const [key, val] of Object.entries(data)) {
        _.set(options, key, val)
      }

      this.storeSet({ [`contentType.${this.path}.options`]: options })
    },
    addOptions: function () {
      let choices = _.cloneDeep(_.get(this, 'options.choices')) || []

      if (this.newOptionsInput == null) {
        return
      }

      let newOptions = this.newOptionsInput.split('\n')
      newOptions = _.compact(newOptions)

      choices = _.uniq(choices.concat(newOptions))

      this.set({ choices: choices })

      this.newOptionsInput = null
      this.newOptionsDialog = false
    },
    removeOption: async function (option) {
      const answer = await this.showConfirm({
        body: 'This option will be removed.'
      })

      if (answer === 'yes') {
        const choices = _.cloneDeep(_.get(this, 'options.choices')) || []

        const idx = choices.findIndex(i => i === option)
        choices.splice(idx, 1)

        this.set({ choices: choices })
      }
    },
    dragOption: function (change) {
      const choices = _.cloneDeep(_.get(this, 'options.choices')) || []

      if (change.moved) {
        choices.splice(change.moved.newIndex, 0, choices.splice(change.moved.oldIndex, 1)[0])
      }

      this.set({ choices: choices })
    }
  }
}
</script>

<template>
  <div class="mb-2">
    <h3>Choices</h3>
    <draggable
      :value="options.choices"
      @change="dragOption"
      @start="optionsDrag = true"
      @end="optionsDrag = false"
      animation="200"
    >
      <v-card
        v-for="option in options.choices"
        :key="option"
        class="field-item my-1 mx-0"
        justify-space-between
        align-center
      >
        <div class="d-flex align-center justify-space-between">
          <div class="subheading pa-2">{{option}}</div>
          <v-btn class="pa-0 ma-0" text fab small color="grey" @click.stop="removeOption(option)"><v-icon>$delete</v-icon></v-btn>
        </div>
      </v-card>
    </draggable>
    <v-dialog v-model="newOptionsDialog" scrollable max-width="300px">
      <template v-slot:activator="{ on }">
        <v-btn color="primary" dark v-on="on">Add Choices</v-btn>
      </template>
      <v-card>
        <v-card-title>Add Choices</v-card-title>
        <v-divider></v-divider>
        <v-card-text style="min-height: 200px;">
          Enter one item per line.
          <v-textarea solo v-model="newOptionsInput" label="Choices" />
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
  cursor: grab;
}

</style>
