<script>
import { mapState } from 'vuex'
import { mapFields } from 'vuex-map-fields'
import _ from 'lodash'
// import { to } from '../lib/utils.js'
import gql from 'graphql-tag'

export default {
  apollo: {
    publication: {
      query: gql`
        query getPublication (
          $_key: ID
        ) {
          publication: getPublication (
            _key: $_key
          ) {
            _key
            title
          }
        }
      `,
      variables: function () {
        return {
          _key: this.$route.params.publication_key
        }
      }
    }
  },

  data: function () {
    return {
      drawer: true
    }
  },
  computed: {
    ...mapState({
      user: state => state.auth.user,
      alert: state => state.alert,
      confirm: state => state.confirm
    }),
    ...mapFields({
      snackbarShow: 'snackbar.show',
      snackbarColor: 'snackbar.color',
      snackbarMessage: 'snackbar.message'
    }),
    showAlert: {
      get: function () {
        return this.alert.resolve != null
      },
      set: function (val) {
        this.alert.resolve('close')
      }
    },
    showConfirm: {
      get: function () {
        return this.confirm.resolve != null
      },
      set: function (val) {
      }
    },
    showSnackbar: {
      get: function () {
        return this.snackbar != null
      },
      set: function (value) {

      }
    }
  },
  methods: {
    logout: async function () {
      await this.$auth.logout()
      this.$router.push('/login')
    },
    get: _.get,
    // unimpersonate: async function (obj) {
    //   this.error = null
    //   await this.$axios.post('/api/auth/unimpersonate')
    //   window.location = '/'
    // },
  }
}
</script>

<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" app clipped>
      <div>
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title class="title">
              PageFlo
            </v-list-item-title>
            <v-list-item-subtitle v-if="publication">
              {{publication.title}}
            </v-list-item-subtitle>
          </v-list-item-content>

          <v-list-item-action v-if="publication">
            <v-btn icon ripple :to="{ path: '/publications' }">
              <v-icon>$exchange</v-icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>
      </div>
      <div v-if="!publication">
      </div>
      <div v-if="publication">
        <v-divider></v-divider>

        <v-list dense nav >

          <v-list-item link :to="`/publications/${this.publication._key}/contentTypes`">
            <v-list-item-icon>
              <v-icon fixed-width>$file</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Content</v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item link :to="`/publications/${this.publication._key}/files`">
            <v-list-item-icon>
              <v-icon fixed-width>$media</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Files</v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item link :to="`/publications/${this.publication._key}/accessKeys`">
            <v-list-item-icon>
              <v-icon fixed-width>$key</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Access Keys</v-list-item-title>
            </v-list-item-content>
          </v-list-item>

        </v-list>

        <v-divider></v-divider>
      </div>

      <template v-slot:append>
        <v-list dense nav>
          <v-list-item link @click="logout">
            <v-list-item-icon>
              <v-icon fixed-width :icon="['fas', 'sign-out-alt']">$generic</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Logout</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </template>

    </v-navigation-drawer>

    <v-app-bar app clipped-left dark color="primary">
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-toolbar-title></v-toolbar-title>
      <!-- <span v-if="get($auth, 'user.isImpersonating')">
        You are impersonating {{get($auth, 'user.firstName')}} {{get($auth, 'user.lastName')}}
        <v-btn @click="unimpersonate">End Session</v-btn>
      </span> -->
    </v-app-bar>

    <v-content class="pb-12">
      <nuxt :key="$route.fullPath"/>
    </v-content>

    <v-dialog v-model="showAlert" max-width="290" persistent>
      <v-card>
        <v-card-title class="headline error lighten-2 white--text" primary-title>
          {{alert.title}}
        </v-card-title>

        <v-card-text>
          {{alert.body}}
        </v-card-text>

        <v-card-actions>
          <v-btn text @click="alert.resolve('ok')">OK</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showConfirm" max-width="350" persistent>
      <v-card>
        <v-card-title class="headline" primary-title>
          {{confirm.title}}
        </v-card-title>

        <v-card-text>
          {{confirm.body}}
        </v-card-text>

        <v-card-actions>
          <v-btn text @click="confirm.resolve('no')">No</v-btn>
          <v-spacer />
          <v-btn color="primary" @click="confirm.resolve('yes')">Yes</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar
      v-model="snackbarShow"
      :color="snackbarColor"
      bottom
      multi-line
      :timeout="4000"
    >
      {{ snackbarMessage }}
      <v-btn text @click="snackbarShow = false">
        Close
      </v-btn>
    </v-snackbar>
  </v-app>
</template>

<style lang="scss">

  .v-data-table.clickable tbody {
    tr {
      &.v-data-table__selected, &.v-data-table__selected:hover {
        background-color: var(--v-primary-lighten5);
      }

      td {
        cursor: pointer;
      }
    }
  }

  .v-input__icon.v-input__icon--clear {
    svg {
      -webkit-appearance: inherit;
    }
  }

</style>
