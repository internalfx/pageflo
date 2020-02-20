
<script>
import _ from 'lodash'

import { mapState, mapMutations } from 'vuex'

// cover: Crop to cover both provided dimensions (the default).
// contain: Embed within both provided dimensions.
// fill: Ignore the aspect ratio of the input and stretch to both provided dimensions.
// inside: Preserving aspect ratio, resize the image to be as large as possible while ensuring its dimensions are less than or equal to both those specified.
// outside: Preserving aspect ratio, resize the image to be as small as possible while ensuring its dimensions are greater than or equal to both those specified. Some of these values are based on the object-fit
// CSS property.

const defaults = {
  width: null,
  height: null
}

export default {
  data: function () {
    return {
      scalingOptions: [
        {
          text: 'Crop to cover dimensions',
          value: 'cover'
        },
        {
          text: 'Embed within dimensions',
          value: 'contain'
        },
        {
          text: 'Stretch to dimensions',
          value: 'fill'
        },
        {
          text: 'Resize to within smallest dimension',
          value: 'inside'
        },
        {
          text: 'Resize to within largest dimension',
          value: 'outside'
        }
      ]
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
    width: {
      get: function () {
        return _.get(this, 'options.imageSize.width')
      },
      set: function (value) {
        this.set({ 'imageSize.width': value })
      }
    },
    height: {
      get: function () {
        return _.get(this, 'options.imageSize.height')
      },
      set: function (value) {
        this.set({ 'imageSize.height': value })
      }
    },
    sizing: {
      get: function () {
        return _.get(this, 'options.imageSize.sizing') || 'cover'
      },
      set: function (value) {
        this.set({ 'imageSize.sizing': value })
      }
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
  <v-card class="pt-5 px-6 mt-6">
    <h3>Image Size</h3>
    <v-row>
      <v-col>
        <v-text-field
          v-model.number="width"
          label="Width"
          hint="Limit max image width"
          outlined
        />
      </v-col>
      <v-col>
        <v-text-field
          v-model.number="height"
          label="Height"
          hint="Limits max image height"
          outlined
        />
      </v-col>
    </v-row>
    <v-select :items="scalingOptions" v-model="sizing" label="Resize Strategy" outlined />
  </v-card>
</template>

<style lang="scss" scoped>
</style>

