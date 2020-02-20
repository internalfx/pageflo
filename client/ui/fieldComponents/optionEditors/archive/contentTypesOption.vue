
<script>
import gql from 'graphql-tag'
import _ from 'lodash'
import draggable from 'vuedraggable'

import { mapActions, mapState, mapMutations } from 'vuex'
import { mapFields } from 'vuex-map-fields'

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
          publication_key: this.publication_key,
          page: 1,
          pageSize: 999999
        }
      },
      fetchPolicy: 'network-only'
    }
  },
  data: function () {
    return {
      newOptionsDialog: false,
      newOptionsInput: null,
      optionsDrag: false
    }
  },
  props: {
    path: String
  },
  components: {
    draggable
  },
  computed: {
    ...mapState('editors/contentType', {
      contentType: state => state.contentType
    }),
    ...mapFields('editors/contentType', {
      selectedFieldId: 'selectedFieldId'
    }),
    ...mapFields({
      publication_key: 'publication_key'
    }),
    options: function () {
      return _.get(this.contentType, `${this.path}.options`) || {}
    },
    selectMode: {
      get: function () {
        return _.get(this, 'options.selectMode')
      },
      set: function (val) {
        this.set({ selectMode: val })
      }
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
      let options = _.cloneDeep(_.get(this.contentType, `${this.path}.options`))

      for (let [key, val] of Object.entries(data)) {
        _.set(options, key, val)
      }

      this.storeSet({ [`contentType.${this.path}.options`]: options })
    }
  }
}
</script>

<template>
  <div>
    <v-radio-group v-model="selectMode" column>
      <v-radio value="single" label="Single (allows only one object reference)"></v-radio>
      <v-radio value="multiple" label="Multiple (allows multiple object references)"></v-radio>
    </v-radio-group>

    <v-autocomplete
      v-model="allowedContentTypes"
      label="Allowed Content Types"
      :items="contentTypeList"
      item-text="title"
      item-value="_key"
      clearable
      multiple
    />
  </div>
</template>

<style lang="scss" scoped>

.field-item {
  background-color: var(--v-secondary-lighten5);
  cursor: grab;
}

</style>

