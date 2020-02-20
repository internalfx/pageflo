<script>
import _ from 'lodash'

import { mapState, mapMutations } from 'vuex'

import format from '../../../../lib/format.js'
export default {
  data: function () {
    return {
      menu: false
    }
  },
  props: {
    field: Object,
    path: String
  },
  components: {
  },
  computed: {
    ...mapState('editors/entry', {
      contentType: state => state.contentType,
      entry: state => state.entry,
      errorTree: state => state.errorTree
    }),
    error: function () {
      return _.get(this, `errorTree.${this.path}`)
    },
    valueModel: {
      get: function () {
        return _.get(this, `entry.content.${this.path}`)
      },
      set: function (val) {
        this.storeSet({ [`entry.content.${this.path}`]: val })
      }
    },
    displayDate: function () {
      return this.date(this.valueModel)
    }
  },
  methods: {
    ...format('date'),
    ...mapMutations('editors/entry', {
      storeSet: 'set'
    })
  }
}
</script>

<template>
  <div class="py-2 ma-0">
    <v-menu
      v-model="menu"
      :close-on-content-click="false"
      :nudge-right="40"
      transition="scale-transition"
      offset-y
      min-width="290px"
    >
      <template v-slot:activator="{ on }">
        <v-text-field
          :value="displayDate"
          :label="field.label"
          :prepend-icon="`$${field.type}`"
          readonly
          v-on="on"
          clearable
          @click:clear="valueModel = null"
          :error-messages="error"
          outlined
        ></v-text-field>
      </template>
      <v-date-picker v-model="valueModel" @input="menu = false"></v-date-picker>
    </v-menu>
  </div>
</template>

<style lang="scss" scoped>
</style>

