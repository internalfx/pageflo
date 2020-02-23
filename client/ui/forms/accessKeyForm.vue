<script>
import { mapState, mapMutations } from 'vuex'

export default {
  apollo: {
  },
  data: function () {
    return {
      environments: [
        { text: 'Production', value: 'prod' },
        { text: 'Development', value: 'dev' }
      ]
    }
  },
  props: {
  },
  components: {
  },
  computed: {
    ...mapState('editors/accessKey', {
      accessKey: state => state.accessKey
    }),
    title: {
      get: function () {
        return this.accessKey.title
      },
      set: function (val) {
        this.storeSet({ 'accessKey.title': val })
      }
    },
    environment: {
      get: function () {
        return this.accessKey.environment
      },
      set: function (val) {
        this.storeSet({ 'accessKey.environment': val })
      }
    }
  },
  methods: {
    ...mapMutations('editors/accessKey', {
      storeSet: 'set'
    })
  }
}
</script>

<template>
  <div v-if="accessKey" style="position: relative;">
    <v-text-field v-model="title" label="Title" outlined />
    <v-select :items="environments" v-model="environment" label="Environment" outlined />
  </div>
</template>

<style lang="scss" scoped>
</style>

