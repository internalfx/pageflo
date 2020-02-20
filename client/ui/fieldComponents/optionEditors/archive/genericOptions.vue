
<script>
import _ from 'lodash'
import draggable from 'vuedraggable'

import { mapState, mapMutations } from 'vuex'
import { mapFields } from 'vuex-map-fields'

export default {
  data: function () {
    return {
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
    field: function () {
      return _.get(this.contentType, `${this.path}`) || {}
    },
    slug: {
      get: function () {
        return _.get(this.field, 'slug')
      },
      set: function (val) {
        this.set({ 'slug': val })
      }
    }
  },
  methods: {
    ...mapMutations('editors/contentType', {
      storeSet: 'set'
    }),
    set: function (data) {
      let field = _.cloneDeep(_.get(this.contentType, `${this.path}`))

      for (let [key, val] of Object.entries(data)) {
        _.set(field, key, val)
      }

      this.storeSet({ [`contentType.${this.path}`]: field })
    },
    checkSlug: function () {
      if (_.isEmpty(this.slug)) {
        this.set({ slug: _.camelCase(this.label) })
      }
    }
  }
}
</script>

<template>
  <div>
    <!-- <v-text-field v-model="label" @blur="checkSlug" label="Label" outlined /> -->
    <v-text-field v-model="slug" label="Slug" hint="The name used in the API" outlined />
    <!-- <v-text-field v-model="helpText" label="Help Text" hint="Instructions shown to the user." outlined /> -->
  </div>
</template>

<style lang="scss" scoped>

.field-item {
  background-color: var(--v-secondary-lighten5);
  cursor: grab;
}

</style>

