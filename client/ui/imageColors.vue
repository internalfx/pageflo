
<script>
import _ from 'lodash'
import chroma from 'chroma-js'

// let colorSort = function (a, b) {
//   console.log('sort')
//   a = chroma(a)
//   b = chroma(b)

//   let ah = a.hsv()[0] || null
//   let bh = b.hsv()[0] || null

//   let al = a.luminance()
//   let bl = b.luminance()

//   if (ah < bh) {
//     return 1
//   } else if (ah > bh) {
//     return -1
//   } else if (al < bl) {
//     return 1
//   } else if (al > bl) {
//     return -1
//   }

//   return 0
// }

export default {
  data: function () {
    return {
    }
  },
  props: {
    colors: {
      type: Array,
      default: () => { return [] }
    }
  },
  methods: {
  },
  computed: {
    parsedList: function () {
      return this.colors.map(function (color) {
        let stats = chroma(color)
        return {
          value: color,
          hue: stats.hsv()[0] || null,
          luminance: stats.luminance()
        }
      })
    },
    list: function () {
      return _.sortBy(this.parsedList, ['hue', 'luminance'])
    }
  }
}
</script>

<template>
  <div class="colors">
    <div class="color" v-for="color of list" :style="{'background-color': `${color.value}`}" :key="color.value"></div>
  </div>
</template>

<style lang="scss" scoped>

.colors {
  display: flex;

  .color {
    width: 20px;
    height: 20px;
  }
}

</style>
