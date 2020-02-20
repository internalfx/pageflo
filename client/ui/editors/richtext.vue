<script>
import { mapState } from 'vuex'
import _ from 'lodash'

import linkDialog from './linkDialog.vue'
import filesDialog from '../dialogs/filesDialog.vue'

import Mobiledoc from 'mobiledoc-kit'
import getCards from '../../../lib/mobileDocCards.js'
import atoms from '../../../lib/mobileDocAtoms.js'

// let MobiledocDOMRenderer = require('mobiledoc-dom-renderer').default
// let SimpleDOM = require('simple-dom')

const serializeVersion = '0.3.1'
const simpleMobiledoc = {
  version: '0.3.1',
  markups: [],
  atoms: [],
  cards: [],
  sections: []
}
const defaultOptions = {
  autofocus: false,
  spellcheck: true,
  placeholder: '',
  serializeVersion,
  mobiledoc: simpleMobiledoc,
  atoms,
  cards: [],
  cardOptions: {}
}

export default {
  data: function () {
    return {
      id: _.uniqueId('widget_'),
      editor: {},
      activeMarkupTags: [],
      activeSectionTags: [],
      showLinkDialog: false,
      showImageDialog: false,
      showVideoDialog: false,
      section: null,
      markup: null,
      align: null,

      lastRange: null,

      mediaButtonsList: null,

      imageData: {
        width: null,
        height: null,
        altText: null,
        className: null
      }
    }
  },
  props: {
    value: {},
    options: Object,
    displayValue: String,
    label: String
  },
  components: {
    linkDialog,
    filesDialog
  },
  computed: {
    ...mapState({
      scrollTop: state => state.scrollTop
    }),
    content: function () {
      let source = this.value

      if (_.isString(source)) {
        try {
          source = JSON.parse(source)
        } catch (err) {

        }
      }

      return source
    },
    // htmlOut: function () {
    //   var renderer = new MobiledocDOMRenderer({
    //     cards: [],
    //     dom: new SimpleDOM.Document()
    //   })
    //   var rendered = renderer.render(this.value.content)
    //   var serializer = new SimpleDOM.HTMLSerializer([])
    //   var html = serializer.serializeChildren(rendered.result)
    //   return html
    // },
    activeSectionButtons: {
      get: function () {
        return this.activeSectionTags
      },
      set: function () {}
    },
    activeMarkupButtons: {
      get: function () {
        return this.activeMarkupTags
      },
      set: function () {}
    },
    imageSize: function () {
      return _.get(this, 'options.imageSize') || {}
    }
  },
  methods: {
    toggleMarkup: function (tag) {
      this.editor.run((editor) => {
        editor.toggleMarkup(tag)
      })
    },
    toggleSection: function (tag) {
      this.editor.run((editor) => {
        editor.toggleSection(tag)
      })
    },
    toggleLink: function () {
      if (!this.editor.hasCursor()) {
        return
      }
      this.showLinkDialog = true
    },
    toggleImage: function () {
      if (!this.editor.hasCursor()) {
        return
      }
      this.lastRange = this.editor.range
      this.showImageDialog = true
    },
    toggleVideo: function () {
      if (!this.editor.hasCursor()) {
        return
      }
      this.lastRange = this.editor.range
      this.showVideoDialog = true
    },
    toggleAlign: function (type) {
      if (!this.editor.hasCursor()) {
        return
      }

      let activeType = null
      const marker = this.editor.range.head.marker
      const parent = marker.parent
      const head = parent.headPosition()
      const tail = parent.tailPosition()
      const range = head.toRange(tail)
      this.editor.selectRange(range)

      const alignments = ['div-left', 'div-center', 'div-right', 'div-justify']
      for (const alignment of alignments) {
        if (this.activeMarkupTags.includes(alignment)) {
          activeType = alignment.split('-')[1]
        }
      }

      if (activeType != null) {
        this.editor.run((editor) => {
          editor.toggleMarkup('div')
        })
      }

      if (activeType !== type) {
        this.editor.run((editor) => {
          const markup = editor.builder.createMarkup('div', { style: `text-align: ${type};` })
          editor.toggleMarkup(markup)
        })
      }

      this.editor.selectRange(tail.toRange())
    },
    addImage: function (file) {
      this.showImageDialog = false
      requestAnimationFrame(() => {
        this.editor._ensureFocus()
        this.editor.selectRange(this.lastRange)
        this.editor.insertCard('image', {
          filename: file.filename
        })
      })
    },
    addVideo: function (file) {
      this.showVideoDialog = false
      requestAnimationFrame(() => {
        this.editor._ensureFocus()
        this.editor.selectRange(this.lastRange)
        this.editor.insertCard('video', {
          filename: file.filename
        })
      })
    }
  },
  beforeMount: function () {
    const editorOptions = Object.assign({}, defaultOptions, {
      mobiledoc: this.content || simpleMobiledoc,
      cards: getCards({
        ...this.imageSize
      })
    })
    this.editor = new Mobiledoc.Editor(editorOptions)
    this.editor.inputModeDidChange(() => {
      this.activeMarkupTags = this.editor.activeMarkups.map(function (m) {
        if (m.tagName === 'div') {
          const regex = /text-align:\s?(left|right|center|justify);/
          const style = m.attributes.style
          const match = regex.exec(style)
          if (match) {
            return `${m.tagName}-${match[1]}`
          } else {
            return m.tagName
          }
        } else {
          return m.tagName
        }
      })
      this.activeSectionTags = this.editor.activeSections.map(s => {
        return s.isNested ? s.parent.tagName : s.tagName
      })
    })
    this.editor.postDidChange(() => {
      this.$emit('input', this.editor.serialize(serializeVersion))
    })
  },
  mounted: function () {
    this.editor.render(this.$refs.editor)
  },
  beforeDestroy: function () {
    this.editor.destroy()
  }
}
</script>

<template>
  <div class="wrapper mb-4">
    <div>
      <div
        class="d-flex flex-wrap"
        style="top: 64px; z-index: 1;"
        :style="{position: displayValue ? 'static' : 'sticky'}"
      >
        <v-btn-toggle v-model="activeSectionButtons" multiple class="mr-3">
          <v-btn fab small value="p" @click="toggleSection('p')"><v-icon>$paragraph</v-icon></v-btn>
          <v-btn fab small value="h1" @click="toggleSection('h1')"><v-icon>$heading</v-icon><sup>1</sup></v-btn>
          <v-btn fab small value="h2" @click="toggleSection('h2')"><v-icon>$heading</v-icon><sup>2</sup></v-btn>
          <v-btn fab small value="h3" @click="toggleSection('h3')"><v-icon>$heading</v-icon><sup>3</sup></v-btn>
          <v-btn fab small value="h4" @click="toggleSection('h4')"><v-icon>$heading</v-icon><sup>4</sup></v-btn>
          <v-btn fab small value="h5" @click="toggleSection('h5')"><v-icon>$heading</v-icon><sup>5</sup></v-btn>
          <v-btn fab small value="h6" @click="toggleSection('h6')"><v-icon>$heading</v-icon><sup>6</sup></v-btn>
          <v-btn fab small value="blockquote" @click="toggleSection('blockquote')"><v-icon>$quoteRight</v-icon></v-btn>
          <v-btn fab small value="ul" @click="toggleSection('ul')"><v-icon>$listUl</v-icon></v-btn>
          <v-btn fab small value="ol" @click="toggleSection('ol')"><v-icon>$listOl</v-icon></v-btn>
        </v-btn-toggle>
        <v-btn-toggle v-model="activeMarkupButtons" multiple class="mr-3">
          <v-btn fab small value="a" @click="toggleLink()"><v-icon>$link</v-icon></v-btn>
          <v-btn fab small value="strong" @click="toggleMarkup('strong')"><v-icon>$bold</v-icon></v-btn>
          <v-btn fab small value="em" @click="toggleMarkup('em')"><v-icon>$italic</v-icon></v-btn>
          <v-btn fab small value="s" @click="toggleMarkup('s')"><v-icon>$strikethrough</v-icon></v-btn>
          <v-btn fab small value="u" @click="toggleMarkup('u')"><v-icon>$underline</v-icon></v-btn>
          <v-btn fab small value="code" @click="toggleMarkup('code')"><v-icon>$code</v-icon></v-btn>
          <v-btn fab small value="kbd" @click="toggleMarkup('kbd')"><v-icon>$keyboard</v-icon></v-btn>
        </v-btn-toggle>
        <v-btn-toggle v-model="activeMarkupButtons" multiple class="mr-3">
          <v-btn fab small value="div-left" @click="toggleAlign('left')"><v-icon>$alignLeft</v-icon></v-btn>
          <v-btn fab small value="div-center" @click="toggleAlign('center')"><v-icon>$alignCenter</v-icon></v-btn>
          <v-btn fab small value="div-right" @click="toggleAlign('right')"><v-icon>$alignRight</v-icon></v-btn>
          <v-btn fab small value="div-justify" @click="toggleAlign('justify')"><v-icon>$alignJustify</v-icon></v-btn>
        </v-btn-toggle>
        <div class="v-item-group theme--light v-btn-toggle">
          <v-btn fab small value="image" @click="toggleImage"><v-icon>$image</v-icon></v-btn>
          <v-btn fab small value="video" @click="toggleVideo"><v-icon>$video</v-icon></v-btn>
        </div>
      </div>
      <v-card flat class="editor-wrapper pa-5">
        <div v-if="displayValue" class="editor title">{{displayValue}}</div>
        <div v-show="!displayValue" class="editor" ref="editor"></div>
      </v-card>
      <!-- <small class="text-italic" v-if="helpText">{{ helpText }}</small> -->
    </div>

    <linkDialog v-if="showLinkDialog" @close="showLinkDialog = false" :editor="editor" />
    <div v-if="showImageDialog">
      <filesDialog v-model="showImageDialog" :allowedTypes="['image']" @select="addImage" />
    </div>
    <div v-if="showVideoDialog">
      <filesDialog v-model="showVideoDialog" :allowedTypes="['video']" @select="addVideo" />
    </div>
  </div>
</template>

<style lang="scss">

.wrapper {
  .editor-wrapper {
    // border-left: 1px solid #999;
    // border-right: 1px solid #999;
    // border-bottom: 1px solid #999;

    .editor {
      // border: 1px solid rgb(14, 206, 206);
      // width: 100%;
      min-height: 80px;
      // padding: 50px;
      outline: none;

      ul {
        margin-bottom: 16px;
      }

      img, video {
        max-width: 100%;
      }
    }
  }
}

</style>
