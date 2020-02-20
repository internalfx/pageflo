
<script>
import _ from 'lodash'
// import { to } from '../../lib/utils.js'
import gql from 'graphql-tag'
import { mapActions, mapState, mapMutations } from 'vuex'

export default {
  apollo: {
  },
  data: function () {
    return {
    }
  },
  props: {
  },
  components: {
  },
  computed: {
    ...mapState('editors/publication', {
      publication: state => state.publication
    }),
    title: {
      get: function () {
        return _.get(this, `publication.title`)
      },
      set: function (val) {
        this.storeSet({ [`publication.title`]: val })
      }
    }
  },
  methods: {
    ...mapMutations('editors/publication', {
      storeSet: 'set'
    })
  }
}
</script>

<template>
  <div style="position: relative;">
    <v-card class="my-3 pa-4">
      <v-text-field v-model="title" label="Title" />
    </v-card>
  </div>
</template>

<style lang="scss" scoped>
</style>
