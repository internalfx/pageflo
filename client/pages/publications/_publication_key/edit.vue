
<script>
import gql from 'graphql-tag'
import { to, cleanMutation } from '../../../../lib/utils.js'
import _ from 'lodash'

import publicationForm from '../../../ui/forms/publicationForm.vue'

import { mapActions, mapState } from 'vuex'

export default {
  data: function () {
    return {
      inFlight: false
    }
  },
  components: {
    publicationForm
  },
  computed: {
    ...mapState('editors/publication', {
      publication: state => state.publication
    })
  },
  methods: {
    ...mapActions('editors/publication', [
      'loadPublication',
      'savePublication'
    ]),
    ...mapActions([
      'showSnackbar'
    ]),
    save: async function () {
      this.inFlight = true
      let res = await to(this.savePublication())

      if (res.isError) {
        console.log(res)
      } else {
        this.showSnackbar({ message: 'Publication Saved', color: 'success' })
        this.$router.push({ path: '/publications' })
      }
      this.inFlight = false
    }
  },
  beforeMount: function () {
    this.loadPublication(this.$route.params.publication_key)
  }
}
</script>

<template>
  <v-container>
    <h1 class="primary--text mb-3">Edit Publication</h1>

    <publicationForm v-if="publication" />

    <v-btn color="primary" :loading="inFlight" :disabled="inFlight" @click="save">
      <v-icon left>$save</v-icon> Save
    </v-btn>
  </v-container>
</template>

<style lang="scss" scoped>
</style>

