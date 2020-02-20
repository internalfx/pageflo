
<script>
// import gql from 'graphql-tag'
import { to } from '../../../../../../lib/utils.js'
// import _ from 'lodash'

import contentTypeForm from '../../../../../ui/forms/contentTypeForm.vue'

import { mapFields } from 'vuex-map-fields'
import { mapActions } from 'vuex'

export default {
  data: function () {
    return {
      inFlight: false
    }
  },
  components: {
    contentTypeForm
  },
  computed: {
    ...mapFields('editors/contentType', [
      'contentType',
      'selectedFieldId'
    ])
  },
  methods: {
    ...mapActions('editors/contentType', [
      'loadContentType',
      'saveContentType'
    ]),
    ...mapActions([
      'showSnackbar'
    ]),
    save: async function () {
      this.inFlight = true
      const res = await to(this.saveContentType())

      if (res.isError) {
        console.log(res)
      } else {
        this.showSnackbar({ message: 'Content Type Saved', color: 'success' })
        this.$router.push({ path: `/publications/${this.$route.params.publication_key}/contentTypes` })
      }
      this.inFlight = false
    }
  },
  mounted: function () {
    this.loadContentType(this.$route.params.contentType_key
    )
  }
}
</script>

<template>
  <v-container>
    <h1 class="primary--text mb-3">Edit Content Type</h1>

    <contentTypeForm />

    <v-btn color="primary" :loading="inFlight" :disabled="inFlight" @click="save">
      <v-icon left>$save</v-icon> Save
    </v-btn>
  </v-container>
</template>

<style lang="scss" scoped>
</style>
