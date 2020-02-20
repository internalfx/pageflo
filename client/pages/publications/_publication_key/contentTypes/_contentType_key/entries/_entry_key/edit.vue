
<script>
// import gql from 'graphql-tag'
import { to } from '../../../../../../../../lib/utils.js'
// import _ from 'lodash'

import entryForm from '../../../../../../../ui/forms/entryForm.vue'

import { mapActions, mapState, mapMutations } from 'vuex'

export default {
  data: function () {
    return {
      inFlight: false
    }
  },
  components: {
    entryForm
  },
  computed: {
    ...mapState('editors/entry', {
      entry: state => state.entry,
      contentType: state => state.contentType
    })
  },
  methods: {
    ...mapActions('editors/entry', [
      'loadEntry',
      'saveEntry',
      'publishEntry'
    ]),
    ...mapActions([
      'showSnackbar'
    ]),
    ...mapMutations('editors/entry', {
      storeSet: 'set'
    }),
    save: async function () {
      this.inFlight = true
      this.storeSet({ 'entry.publishDate': null })
      const res = await to(this.saveEntry())

      if (res.isError) {
        console.log(res)
      } else {
        this.showSnackbar({ message: 'Entry saved.', color: 'success' })
        this.$router.push({ path: `/publications/${this.$route.params.publication_key}/contentTypes/${this.$route.params.contentType_key}/entries/${res._key}/edit` })
      }
      this.inFlight = false
    },
    publish: async function () {
      this.inFlight = true

      const res = await to(this.publishEntry())

      if (res.isError) {
        console.log(res)
      } else {
        this.showSnackbar({ message: 'Entry saved and published.', color: 'success' })
        this.$router.push({ path: `/publications/${this.$route.params.publication_key}/contentTypes/${this.$route.params.contentType_key}/entries/${res._key}/edit` })
      }
      this.inFlight = false
    }
  },
  beforeMount: function () {
    this.loadEntry(this.$route.params.entry_key)
  }
}
</script>

<template>
  <v-container v-if="contentType">
    <h1 v-if="contentType.contentMode === 'single'" class="primary--text mb-3">Edit {{contentType.title}}</h1>
    <h1 v-if="contentType.contentMode === 'multiple'" class="primary--text mb-3">Edit {{contentType.title}} Entry</h1>

    <entryForm v-if="entry" />

    <v-btn color="secondary" :loading="inFlight" :disabled="inFlight" @click="save">
      <v-icon left>$save</v-icon> Save
    </v-btn>
    <v-btn color="primary" :loading="inFlight" :disabled="inFlight" @click="publish">
      <v-icon left>$send</v-icon> Publish
    </v-btn>
  </v-container>
</template>

<style lang="scss" scoped>
</style>
