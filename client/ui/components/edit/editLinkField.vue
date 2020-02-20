<script>
import _ from 'lodash'

import { mapState, mapMutations } from 'vuex'

export default {
  props: {
    field: Object,
    path: String
  },
  components: {
  },
  computed: {
    ...mapState('editors/entry', {
      contentType: state => state.contentType,
      entry: state => state.entry
    }),
    caption: {
      get: function () {
        return _.get(this, `entry.content.${this.path}.caption`)
      },
      set: function (val) {
        this.storeSet({ [`entry.content.${this.path}.caption`]: val })
      }
    },
    url: {
      get: function () {
        return _.get(this, `entry.content.${this.path}.url`)
      },
      set: function (val) {
        this.storeSet({ [`entry.content.${this.path}.url`]: val })
      }
    },
    className: {
      get: function () {
        return _.get(this, `entry.content.${this.path}.className`)
      },
      set: function (val) {
        this.storeSet({ [`entry.content.${this.path}.className`]: val })
      }
    },
    newWindow: {
      get: function () {
        return _.get(this, `entry.content.${this.path}.newWindow`)
      },
      set: function (val) {
        this.storeSet({ [`entry.content.${this.path}.newWindow`]: val })
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
  <v-card class="mb-4" outlined>
    <h3 class="pt-4 px-4">{{field.label}}</h3>
    <div class="px-4">
      <v-row>
        <v-col cols="12" sm="6" lg="3">
          <v-text-field v-model="caption" label="Caption" hide-details outlined/>
        </v-col>
        <v-col cols="12" sm="6" lg="3">
          <v-text-field v-model="url" label="URL" hide-details outlined/>
        </v-col>
        <v-col cols="12" sm="6" lg="3">
          <v-text-field v-model="className" label="class" hide-details outlined/>
        </v-col>
        <v-col cols="12" sm="6" lg="3">
          <v-switch v-model="newWindow" label="Open in new window" hide-details/>
        </v-col>
      </v-row>
    </div>
  </v-card>
</template>

<style lang="scss" scoped>

.wrapper {
  border: 1px solid #999;
}

</style>
