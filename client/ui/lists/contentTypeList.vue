
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
        { text: 'Slug', value: 'slug', sortable: false },
        { text: 'Content Mode', value: 'contentMode', sortable: false },
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
        body: 'This content type, and all associated entries will be deleted!'
      })

      if (choice === 'yes') {
        const res = await to(this.$apollo.mutate({
          mutation: gql`
            mutation ($_key: ID!) {
              destroyContentType (_key: $_key) {
                _key
              }
            }
          `,
          variables: {
            _key: item._key
          },
          refetchQueries: ['allContentTypes']
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
    no-data-text="No content types match your search."
  >
    <template v-slot:item.title="{item}">
      <n-link v-if="item.contentMode === 'multiple'" :to="`/publications/${$route.params.publication_key}/contentTypes/${item._key}/entries`">{{item.title}}</n-link>
      <span v-if="item.contentMode === 'single'">
        <n-link v-if="item.entries.items.length > 0" :to="`/publications/${$route.params.publication_key}/contentTypes/${item._key}/entries/${item.entries.items[0]._key}/edit`">{{item.title}}</n-link>
        <n-link v-if="item.entries.items.length === 0" :to="`/publications/${$route.params.publication_key}/contentTypes/${item._key}/entries/create`">{{item.title}}</n-link>
        <!-- <n-link v-if="item.entries.items.length > 0" :to="{ path: '/entries/edit', query: { _key: item.entries.items[0]._key } }">{{item.title}}</n-link>
        <n-link v-if="item.entries.items.length === 0" :to="{path: '/entries/create', query: { contentType_key: item._key }}">{{item.title}}</n-link> -->
      </span>
    </template>
    <template v-slot:item.slug="{item}">
      <code>{{item.slug}}</code>
    </template>
    <template v-slot:item.actions="{item}">
      <v-tooltip top>
        <template v-slot:activator="{on}">
          <span v-on="on">
            <v-btn text fab small class="ma-0 mr-2" v-if="item.contentMode === 'multiple'" :to="{ path: '/entries', query: { contentType_key: item._key } }"><v-icon>$externalLinkAlt</v-icon></v-btn>
            <span v-if="item.contentMode === 'single'">
              <v-btn text fab small class="ma-0 mr-2" v-if="item.entries.items.length > 0" :to="{ path: '/entries/edit', query: { _key: item.entries.items[0]._key } }"><v-icon>$externalLinkAlt</v-icon></v-btn>
              <v-btn text fab small class="ma-0 mr-2" v-if="item.entries.items.length === 0" :to="{path: '/entries/create', query: { contentType_key: item._key }}"><v-icon>$externalLinkAlt</v-icon></v-btn>
            </span>
          </span>
        </template>
        <span>Open</span>
      </v-tooltip>
      <v-tooltip top>
        <template v-slot:activator="{on}">
          <span v-on="on">
            <v-btn text fab small class="ma-0 mr-2" :to="`/publications/${$route.params.publication_key}/contentTypes/${item._key}/edit`">
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
