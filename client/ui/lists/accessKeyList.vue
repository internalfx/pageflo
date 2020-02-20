
<script>
import { mapActions } from 'vuex'
import format from '../../../lib/format.js'
import { to } from '../../../lib/utils.js'
import gql from 'graphql-tag'

export default {
  apollo: {
  },
  data: function () {
    return {
      inFlight: false,
      headers: [
        { text: 'Title', value: 'title', sortable: false },
        { text: 'API Key', value: 'apikey', sortable: false },
        { text: 'Actions', value: 'actions', sortable: false, align: 'right' }
      ]
    }
  },
  props: {
    items: Array
  },
  components: {
  },
  computed: {
  },
  methods: {
    ...mapActions([
      'showConfirm'
    ]),
    ...format(),
    destroy: async function (item) {
      this.inFlight = true

      const choice = await this.showConfirm({
        title: 'Are you sure?',
        body: 'This access key will be deleted!'
      })

      if (choice === 'yes') {
        const res = await to(this.$apollo.mutate({
          mutation: gql`
            mutation ($_key: ID!) {
              destroyAccessKey (_key: $_key) {
                _key
              }
            }
          `,
          variables: {
            _key: item._key
          },
          refetchQueries: ['allAccessKeys']
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
    no-data-text="No access keys match your search."
  >
    <template v-slot:item.title="{item}">
      <nuxt-link :to="`/publications/${$route.params.publication_key}/accessKeys/${item._key}/edit`">{{item.title}}</nuxt-link>
    </template>
    <template v-slot:item.actions="{item}">
      <v-tooltip top>
        <template v-slot:activator="{on}">
          <span v-on="on">
            <v-btn text fab small class="ma-0 mr-2" :to="`/publications/${$route.params.publication_key}/accessKeys/${item._key}/edit`">
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
