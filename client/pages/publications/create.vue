
<script>
import { to } from '../../../lib/utils.js'
import { mapActions, mapState } from 'vuex'

import publicationForm from '../../ui/forms/publicationForm.vue'

export default {
  apollo: {
  },
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
      'newPublication',
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
    this.newPublication()
  }
}
</script>

<template>
  <v-container>
    <h1 class="primary--text mb-3">Create Publication</h1>

    <publicationForm v-if="publication" />

    <v-btn color="primary" :loading="inFlight" :disabled="inFlight" @click="save">
      <v-icon left>$save</v-icon> Save
    </v-btn>
  </v-container>
</template>

<style lang="scss" scoped>
</style>

