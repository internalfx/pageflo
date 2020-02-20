
<script>
import { mapActions } from 'vuex'
import format from '../../../lib/format.js'
// import gql from 'graphql-tag'
// import { to } from '../../lib/utils.js'

// import tagDisplay from './../tagDisplay.vue'

import { mapFields } from 'vuex-map-fields'
import { to } from '../../../lib/utils.js'
import gql from 'graphql-tag'

export default {
  apollo: {
  },
  data: function () {
    return {
      inFlight: false,
      headers: [
        { text: 'Title', value: 'title', sortable: false, align: 'left' },
        { text: 'Actions', value: 'actions', sortable: false, align: 'right' }
      ]
    }
  },
  props: {
    items: Array
  },
  components: {
    // tagDisplay
  },
  computed: {
    ...mapFields({
      publication_key: 'publication_key'
    })
  },
  methods: {
    ...mapActions([
      'showConfirm'
    ]),
    ...format('bytes', 'wholeNumbers', 'componentTypeDisplay', 'textLengthAsBytes'),
    destroy: async function (item) {
      this.inFlight = true

      let choice = await this.showConfirm({
        title: `Are you sure?`,
        body: `This publication will be deleted!`
      })

      if (choice === 'yes') {
        let res = await to(this.$apollo.mutate({
          mutation: gql`
            mutation ($_key: ID!) {
              destroyPublication (_key: $_key) {
                _key
              }
            }
          `,
          variables: {
            _key: item._key
          },
          refetchQueries: ['allPublications']
        }))

        if (res.isError) {
          console.log(res)
        }
      }

      this.inFlight = false
    }
  }
}
</script>

<template>
  <v-data-table
    :headers="headers"
    :items="items"
    class="striped"
    item-key="_key"
    no-data-text="No publications match your search."
  >
    <template v-slot:item.title="{item}">
      <n-link :to="{ path: `/publications/${item._key}/contentTypes` }">{{item.title}}</n-link>
    </template>
    <template v-slot:item.actions="{item}">
      <v-tooltip top>
        <template v-slot:activator="{on}">
          <span v-on="on">
            <v-btn text fab small class="ma-0 mr-2" nuxt :to="{ path: `/publications/${item._key}/contentTypes` }">
              <v-icon>$externalLinkAlt</v-icon>
            </v-btn>
          </span>
        </template>
        <span>Open</span>
      </v-tooltip>
      <v-tooltip top>
        <template v-slot:activator="{on}">
          <span v-on="on">
            <v-btn text fab small class="ma-0 mr-2" :to="{ path: `/publications/${item._key}/edit` }">
              <v-icon>$edit</v-icon>
            </v-btn>
          </span>
        </template>
        <span>Edit</span>
      </v-tooltip>
      <v-tooltip top>
        <template v-slot:activator="{on}">
          <span v-on="on">
            <v-btn text fab small color="error" class="ma-0" @click="destroy(item)">
              <v-icon>$delete</v-icon>
            </v-btn>
          </span>
        </template>
        <span>Delete</span>
      </v-tooltip>
    </template>
  </v-data-table>
</template>

<style lang="scss" scoped>
</style>
