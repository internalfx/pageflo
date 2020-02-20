
<script>
// import { mapActions } from 'vuex'
// import { mapFields, mapMultiRowFields } from 'vuex-map-fields'
// import format from '../../lib/format.js'

import fileForm from '../../../../../ui/forms/fileForm.vue'

export default {
  apollo: {
  },
  data: function () {
    return {
    }
  },
  components: {
    fileForm
  },
  computed: {
  },
  methods: {
  }
}
</script>

<template>
  <v-container>
    {{$route.params._file_key}}
    <h1 class="primary--text mb-3">Edit File</h1>
    <v-card class="pa-4">
      <fileForm :file_key="$route.params.file_key" showReplace />
    </v-card>
  </v-container>
</template>

<style lang="scss" scoped>
</style>

