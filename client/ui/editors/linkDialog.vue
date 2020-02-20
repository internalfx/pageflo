
<script>
import _ from 'lodash'

export default {
  data: function () {
    return {
      id: _.uniqueId('widget_'),
      range: null,
      href: null,
      className: null,
      newWindow: false
    }
  },
  components: {
  },
  props: {
    editor: Object
  },
  methods: {
    toggleEdit: function () {
      this.$emit('close')
    },
    save: function () {
      this.editor._ensureFocus()
      this.editor.selectRange(this.range)
      const attributes = {
        href: this.href,
        class: this.className
      }
      if (this.newWindow) {
        attributes.target = '_blank'
      }
      if (this.editor.hasActiveMarkup('a')) {
        this.editor.run((postEditor) => {
          postEditor.toggleMarkup('a')
          const markup = postEditor.builder.createMarkup('a', attributes)
          postEditor.toggleMarkup(markup)
        })
      } else {
        this.editor.run((postEditor) => {
          const markup = postEditor.builder.createMarkup('a', attributes)
          postEditor.toggleMarkup(markup)
        })
      }
      this.editor.selectRange(this.range.head.toRange())
      this.$emit('close')
    },
    cancel: function () {
      this.$emit('close')
    },
    remove: function () {
      this.editor._ensureFocus()
      this.editor.selectRange(this.range)
      if (this.editor.hasActiveMarkup('a')) {
        this.editor.run((postEditor) => {
          postEditor.toggleMarkup('a')
        })
      }
      this.editor.selectRange(this.range.head.toRange())
      this.$emit('close')
    }
  },
  computed: {
  },
  mounted: function () {
    this.range = this.editor.range
    if (this.editor.hasActiveMarkup('a')) {
      const oldMarkup = this.editor.detectMarkupInRange(this.editor.range, 'a')
      this.className = oldMarkup.attributes.class
      this.href = oldMarkup.attributes.href
      this.newWindow = oldMarkup.attributes.target === '_blank'

      if (this.editor.range.isCollapsed) {
        const marker = this.editor.range.head.marker
        const parent = marker.parent
        const offset = parent.offsetOfMarker(marker)
        const head = parent.toPosition(offset)
        const tail = parent.toPosition(offset + marker.length)
        this.range = head.toRange(tail)
      }
    }
  }
}
</script>

<template>
  <div>
    <div class="modal-mask" @click.stop="toggleEdit()">
      <div class="modal-wrapper">
        <div class="modal-container" @click.stop>
          <div class="modal-header">
            <h3>Edit Link</h3>
          </div>
          <div class="modal-body">
            <v-text-field v-model="href" label="URL" />
            <v-text-field v-model="className" label="class" />
            <v-switch v-model="newWindow" label="Open in new window" />
          </div>
          <div class="modal-footer">
            <div class="left">
              <v-btn @click="save">Save</v-btn>
              <v-btn @click="cancel" class="button-secondary">Cancel</v-btn>
            </div>
            <div class="right">
              <v-btn @click="remove" color="error" class="button-danger"><v-icon>$delete</v-icon></v-btn>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>

.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0px;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, .5);
  display: table;
  transition: opacity .3s ease;
}

.modal-wrapper {
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.modal-container {
  min-width: 280px;
  width: 85vw;
  max-width: 1000px;
  margin: 0px auto;
  padding: 20px 30px;
  background-color: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .33);
  transition: all .3s ease;
  font-family: Helvetica, Arial, sans-serif;
}

.modal-header h3 {
  margin-top: 0;
}

.modal-body {
  margin: 20px 0;
  padding: 0;
  max-height: calc(95vh - 110px);
  overflow-x: auto;
  font-size: 14px;
}

.option {
  cursor: pointer;
  padding: 0.1em 0.3em;

  &:hover {
    background-color: #eee;
  }
}

.modal-footer {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

</style>
