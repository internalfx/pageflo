
<script>
import { to } from '../../../../../../lib/utils.js'

import accessKeyForm from '../../../../../ui/forms/accessKeyForm.vue'

import { mapFields } from 'vuex-map-fields'
import { mapActions } from 'vuex'

export default {
  data: function () {
    return {
      inFlight: false
    }
  },
  components: {
    accessKeyForm
  },
  computed: {
    ...mapFields('editors/accessKey', [
      'accessKey'
    ])
  },
  methods: {
    ...mapActions('editors/accessKey', [
      'loadAccessKey',
      'saveAccessKey'
    ]),
    ...mapActions([
      'showSnackbar'
    ]),
    save: async function () {
      this.inFlight = true
      let res = await to(this.saveAccessKey())

      if (res.isError) {
        console.log(res)
      } else {
        this.showSnackbar({ message: 'Content Type Saved', color: 'success' })
        this.$router.push({ path: `/publications/${this.$route.params.publication_key}/accessKeys` })
      }
      this.inFlight = false
    }
  },
  mounted: function () {
    this.loadAccessKey(this.$route.params.accessKey_key)
  }
}
</script>

<template>
  <v-container>
    <h1 class="primary--text mb-3">Edit Content Type</h1>

    <accessKeyForm />

    <v-btn color="primary" :loading="inFlight" :disabled="inFlight" @click="save">
      <v-icon left>$save</v-icon> Save
    </v-btn>
  </v-container>
</template>

<style lang="scss" scoped>
</style>

