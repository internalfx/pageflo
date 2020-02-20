
<script>
import { mapActions } from 'vuex'
// import { mapFields, mapMultiRowFields } from 'vuex-map-fields'
import format from '../../../lib/format.js'
import gql from 'graphql-tag'
import { to } from '../../../lib/utils.js'

import filePreview from '../filePreview.vue'
import imageColors from '../imageColors.vue'

export default {
  apollo: {
  },
  data: function () {
    return {
      headers: [
        { text: 'Preview', value: 'preview', sortable: false },
        { text: 'Title', value: 'title', sortable: false },
        { text: 'Colors', value: 'colors', sortable: false },
        { text: 'Type', value: 'mimeType' },
        { text: 'Size', value: 'size', align: 'right' }
      ]
    }
  },
  props: {
    files: Array
  },
  components: {
    filePreview,
    imageColors
  },
  computed: {
  },
  methods: {
    ...mapActions([
      'showConfirm'
    ]),
    ...format('bytes'),
    destroy: async function (file) {
      this.inFlight = true

      let choice = await this.showConfirm({
        title: `Are you sure?`,
        body: `File ${file.title} (${file.filename}) will be deleted!`
      })

      if (choice === 'yes') {
        let res = await to(this.$apollo.mutate({
          mutation: gql`
            mutation ($_id: ID!) {
              destroyFileById (_id: $_id) {
                _id
                title
              }
            }
          `,
          variables: {
            _id: file._id
          },
          refetchQueries: ['allFiles']
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
  <div>
    <div class="grid">
      <v-card class="item" v-for="file in files" :key="file._id">
        <div class="content">
          <v-layout class="expand" justify-center align-center>
            <v-flex shrink>
              <filePreview :file="file" :config="{ width: 480, height: 480, background: 'fff', format: 'jpg' }" showInfo />
            </v-flex>
          </v-layout>
          <div class="actions">
            <v-btn fab small color="" class="ma-0 mr-2" @click="$router.push({path: '/files/edit', query: { _id: file._id } })">
              <v-icon>$edit</v-icon>
            </v-btn>
            <v-btn fab small color="error" class="ma-0 mr-2" @click="destroy(file)">
              <v-icon>$delete</v-icon>
            </v-btn>
          </div>
        </div>
      </v-card>
    </div>
    <p class="text-xs-center" v-if="files && files.length === 0">No files match your search.</p>
  </div>
</template>

<style lang="scss" scoped>
  .expand {
    width: 100%;
    height: 100%;
  }

  .grid {
    margin-top: 30px;
    display: grid;
    grid-gap: 30px;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));

    .item {
      position: relative;
      box-sizing: border-box;

      &::before {
        content: '';
        display: block;
        padding-top: 100%;
      }

      .content {
        position: absolute;
        top: 0; left: 0;
        height: 100%;
        width: 100%;

        .actions {
          display: none;
          position: absolute;
          bottom: -20px;
          right: 0;
          z-index: 1;
        }

        &:hover {
          .actions {
            display: block;
          }
        }
      }
    }
  }

</style>
