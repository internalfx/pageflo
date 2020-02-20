
<script>
import _ from 'lodash'
import gql from 'graphql-tag'
import { mapState, mapMutations } from 'vuex'

export default {
  apollo: {
    allContentTypes: {
      query: gql`
        query allContentTypes (
          $publication_key: ID,
          $page: Int,
          $pageSize: Int
        ) {
          allContentTypes: allContentTypes (
            publication_key: $publication_key,
            page: $page,
            pageSize: $pageSize
          ) {
            count
            pageCount
            items {
              _key
              title
            }
          }
        }
      `,
      variables: function () {
        return {
          publication_key: this.$route.params.publication_key,
          page: 1,
          pageSize: 999999
        }
      },
      fetchPolicy: 'network-only'
    }
  },
  data: function () {
    return {
    }
  },
  props: {
    path: String
  },
  components: {
  },
  computed: {
    ...mapState('editors/contentType', {
      contentType: state => state.contentType
    }),
    options: function () {
      return _.get(this.contentType, `${this.path}.options`) || {}
    },
    allowedContentTypes: {
      get: function () {
        return _.get(this, 'options.allowedContentTypes')
      },
      set: function (val) {
        this.set({ allowedContentTypes: val })
      }
    },
    contentTypeList: function () {
      if (this.allContentTypes) {
        return this.allContentTypes.items
      }

      return []
    }
  },
  methods: {
    ...mapMutations('editors/contentType', {
      storeSet: 'set'
    }),
    set: function (data) {
      const options = _.cloneDeep(_.get(this.contentType, `${this.path}.options`))

      for (const [key, val] of Object.entries(data)) {
        _.set(options, key, val)
      }

      this.storeSet({ [`contentType.${this.path}.options`]: options })
    }
  }
}
</script>

<template>
  <v-autocomplete
    v-model="allowedContentTypes"
    label="Allowed Content Types"
    :items="contentTypeList"
    item-text="title"
    item-value="_key"
    clearable
    multiple
    outlined
  />
</template>

<style lang="scss" scoped>
</style>
