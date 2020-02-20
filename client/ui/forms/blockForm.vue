
<script>
import _ from 'lodash'
// import { to } from '../../lib/utils.js'
import gql from 'graphql-tag'

import blockGridEditor from '../editors/blockGridEditor'

export default {
  apollo: {
    tags: {
      query: gql`
        query findTags ($query: String!) {
          tags: findTags (query: $query) {
            _id
            title
          }
        }
      `,
      variables: function () {
        return {
          query: ''
        }
      }
    }
  },
  data: function () {
    return {
    }
  },
  props: {
    value: {
      type: Object
    }
  },
  components: {
    blockGridEditor
  },
  computed: {
    blockTemplate: function () {
      let block = _.cloneDeep(this.value)
      let template = null

      for (let item of block.chain) {
        if (item.template != null) {
          template = item.template
        }
      }

      template.content = JSON.parse(template.content)

      return template
    }
  },
  methods: {
    set: function (data) {
      let block = _.cloneDeep(this.value)
      for (let [key, val] of Object.entries(data)) {
        _.set(block, key, val)
      }
      this.$emit('input', block)
    }
  }
}
</script>

<template>
  <div v-if="value" style="position: relative;">

    <blockGridEditor :template="blockTemplate" :block="value" />

    <v-card class="my-3 pa-4">
      <v-combobox v-model="value.tags" :items="tags" label="Tags" multiple chips deletable-chips item-text="title" item-value="title" :return-object="false" />
    </v-card>
  </div>
</template>

<style lang="scss" scoped>
.clickable {
  border: 1px solid #ccc;
  cursor: pointer;

  &:hover {
    border: 1px solid var(--v-primary-base);
    color: var(--v-primary-base);
  }
}
</style>
