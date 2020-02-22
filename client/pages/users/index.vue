
<script>
import { mapState } from 'vuex'
import { mapFields } from 'vuex-map-fields'
import format from '../../../lib/format.js'
import gql from 'graphql-tag'
import _ from 'lodash'

export default {
  apollo: {
    allUsers: {
      query: gql`
        query allUsers (
          $page: Int,
          $pageSize: Int,
          $search: String
        ) {
          allUsers: allUsers (
            page: $page,
            pageSize: $pageSize,
            search: $search
          ) {
            count
            pageCount
            items {
              _key
              email
            }
          }
        }
      `,
      variables: function () {
        return {
          page: this.page,
          pageSize: this.pageSize,
          search: this.currentSearch
        }
      },
      fetchPolicy: 'network-only'
    }
  },
  data: function () {
    return {
      currentSearch: '',
      headers: [
        { text: 'Email', value: 'email', sortable: false },
        { text: 'Actions', value: 'actions', sortable: false, align: 'right' }
      ]
    }
  },
  components: {
  },
  computed: {
    ...mapFields('settings', {
      page: 'users.page',
      pageSize: 'users.pageSize',
      search: 'publications.search'
    }),
    ...mapState('settings', {
      pageSizeOptions: 'pageSizeOptions'
    })
  },
  methods: {
    ...format('bytes'),
    onClickRow: function (item) {
      this.$router.push({ path: `/users/${item._key}/view` })
    }
  },
  mounted: function () {
    this.currentSearch = this.search
  },
  watch: {
    search: _.debounce(function (val) {
      this.currentSearch = val
      this.page = 1
    }, 333, { maxWait: 1000 })
  }
}
</script>

<template>
  <v-container>
    <v-layout justify-space-between align-center class="mb-3">
      <h1 class="primary--text">Users</h1>
      <v-btn nuxt to="/users/create" color="primary" rounded>
        <v-icon left>$plus</v-icon> Add New
      </v-btn>
    </v-layout>
    <v-toolbar>
      <v-text-field
        v-model="search"
        hide-details
        prepend-icon="$search"
        placeholder="Search"
        solo
        flat
      ></v-text-field>
    </v-toolbar>

    <v-data-table
      v-if="allUsers"
      :headers="headers"
      :items="allUsers && allUsers.items"
      class="striped clickable"
      item-key="_key"
      no-data-text="No users match your search."
      :items-per-page.sync="pageSize"
      :server-items-length="allUsers && allUsers.count"
      :page.sync="page"
      :footer-props="{
        'items-per-page-options': pageSizeOptions
      }"
      :loading="$apollo.queries.allUsers.loading"
      @click:row="onClickRow"
    >
      <template v-slot:item.role="{item}">
        <userRoleWidget :value="item.role" />
      </template>
      <template v-slot:item.active="{item}">
        <yesNoWidget :value="item.active" />
      </template>
      <template v-slot:item.actions="{item}">
        <v-tooltip top>
          <template v-slot:activator="{on}">
            <span v-on="on">
              <v-btn @click.stop text fab small class="ma-0 mr-2" :to="{ path: `/users/${item._key}/edit` }">
                <v-icon>$edit</v-icon>
              </v-btn>
            </span>
          </template>
          <span>Edit</span>
        </v-tooltip>
      </template>
    </v-data-table>
  </v-container>
</template>

<style lang="scss" scoped>
  .filename {
    color: #999;
    font-family: monospace;
    font-size: 90%;
  }
</style>
