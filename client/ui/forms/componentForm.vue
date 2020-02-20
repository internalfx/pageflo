
<script>
import _ from 'lodash'
// import { to } from '../../lib/utils.js'
import gql from 'graphql-tag'

// import componentRichtextEditor from '../editors/componentRichtextEditor.vue'

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
    // componentRichtextEditor
  },
  computed: {
  },
  methods: {
    set: function (data) {
      let component = _.cloneDeep(this.value)
      for (let [key, val] of Object.entries(data)) {
        _.set(component, key, val)
      }
      this.$emit('input', component)
    }
  }
}
</script>

<template>
  <div v-if="value" style="position: relative;">
    <!-- <componentRichtextEditor v-if="value.type === 'richText'" :value="value.content" @input="set({content: $event})" /> -->

    <v-card class="my-3 pa-4">
      <v-combobox v-model="value.tags" :items="tags" label="Tags" multiple chips deletable-chips item-text="title" item-value="title" :return-object="false" />
    </v-card>

    <v-dialog :value="value.type == null" max-width="500" persistent>
      <v-card>
        <v-card-title class="headline">Choose Component Type</v-card-title>

        <div class="px-4 pb-4">
          <v-card @click="set({type: 'richText'})" flat v-ripple class="ripple clickable pa-3 mb-2">
            <div class="headline">Rich Text</div>
            A user friendly editor for text content.
          </v-card>
          <v-card @click="set({type: 'html'})" flat v-ripple class="clickable pa-3 mb-2">
            <div class="headline">HTML</div>
            Create raw html for maximum flexibility.
          </v-card>
          <v-card @click="set({type: 'media'})" flat v-ripple class="clickable pa-3">
            <div class="headline">Media</div>
            Add images or video.
          </v-card>
        </div>
      </v-card>
    </v-dialog>
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
