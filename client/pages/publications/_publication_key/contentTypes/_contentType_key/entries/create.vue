
<script>
import gql from 'graphql-tag'
import { to, cleanMutation } from '../../../../../../../lib/utils.js'
import _ from 'lodash'

import entryForm from '../../../../../../ui/forms/entryForm.vue'

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
      contentType: state => state.contentType,
      entry: state => state.entry
    })
  },
  methods: {
    ...mapActions('editors/entry', [
      'newEntry',
      'saveEntry'
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
        this.$router.push({ path: `/publications/${this.$route.params.publication_key}/contentTypes/${this.$route.params.contentType_key}/entries/${this.entry._key}/edit` })
      }
      this.inFlight = false
    },
    publish: async function () {
      this.inFlight = true
      this.storeSet({ 'entry.publishDate': new Date() })
      const res = await to(this.saveEntry())

      if (res.isError) {
        console.log(res)
      } else {
        this.showSnackbar({ message: 'Entry saved and published.', color: 'success' })
        this.$router.push({ path: `/publications/${this.$route.params.publication_key}/contentTypes/${this.$route.params.contentType_key}/entries/${this.entry._key}/edit` })
      }
      this.inFlight = false
    }

  },
  beforeMount: function () {
    this.newEntry(this.$route.params.contentType_key)
  }
}
</script>

<template>
  <v-container v-if="contentType">
    <h1 v-if="contentType.contentMode === 'single'" class="primary--text mb-3">Edit {{contentType.title}}</h1>
    <h1 v-if="contentType.contentMode === 'multiple'" class="primary--text mb-3">Create {{contentType.title}} Entry</h1>

    <entryForm />

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
