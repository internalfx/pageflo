<script>
import { mapState, mapMutations } from 'vuex'

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
    <v-text-field v-model="title" label="Title" />
  </div>
</template>

<style lang="scss" scoped>
</style>

