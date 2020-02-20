
<script>
import gql from 'graphql-tag'
import { to, cleanMutation } from '../../../../../lib/utils.js'
import _ from 'lodash'

import accessKeyForm from '../../../../ui/forms/accessKeyForm.vue'

import { mapActions, mapState } from 'vuex'

export default {
  apollo: {
  },
  data: function () {
    return {
      inFlight: false
    }
  },
  components: {
    accessKeyForm
  },
  computed: {
    ...mapState('editors/accessKey', {
      accessKey: state => state.accessKey
    })
  },
  methods: {
    ...mapActions('editors/accessKey', [
      'newAccessKey',
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
    this.newAccessKey()
  }
}
</script>

<template>
  <v-container>
    <h1 class="primary--text mb-3">Create Access Key</h1>

    <accessKeyForm />

    <v-btn color="primary" :loading="inFlight" :disabled="inFlight" @click="save">
      <v-icon left>$save</v-icon> Save
    </v-btn>
  </v-container>
</template>

<style lang="scss" scoped>
</style>

