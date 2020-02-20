
<script>
import gql from 'graphql-tag'
import { to, cleanMutation } from '../../../../../lib/utils.js'
import _ from 'lodash'

import contentTypeForm from '../../../../ui/forms/contentTypeForm.vue'

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
    contentTypeForm
  },
  computed: {
    ...mapState('editors/contentType', {
      contentType: state => state.contentType,
      selectedFieldId: state => state.selectedFieldId
    })
  },
  methods: {
    ...mapActions('editors/contentType', [
      'newContentType',
      'saveContentType'
    ]),
    ...mapActions([
      'showSnackbar'
    ]),
    save: async function () {
      this.inFlight = true
      let res = await to(this.saveContentType())

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
    this.newContentType()
  }
}
</script>

<template>
  <v-container>
    <h1 class="primary--text mb-3">Create Content Type</h1>

    <contentTypeForm />

    <v-btn color="primary" :loading="inFlight" :disabled="inFlight" @click="save">
      <v-icon left>$save</v-icon> Save
    </v-btn>
  </v-container>
</template>

<style lang="scss" scoped>
</style>

