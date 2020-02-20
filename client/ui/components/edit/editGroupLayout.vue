<script>
import _ from 'lodash'

import { mapActions, mapState, mapMutations } from 'vuex'

import draggable from 'vuedraggable'

import editBooleanField from './editBooleanField.vue'
import editCodeField from './editCodeField.vue'
import editDateField from './editDateField.vue'
import editFileField from './editFileField.vue'
import editLinkField from './editLinkField.vue'
import editMultiLineTextbox from './editMultiLineTextbox.vue'
import editReferenceField from './editReferenceField.vue'
import editRichTextEditor from './editRichTextEditor.vue'
import editSelectField from './editSelectField.vue'
import editSingleLineTextbox from './editSingleLineTextbox.vue'

export default {
  name: 'editGroupLayout',
  data: function () {
    return {
      expanded: []
    }
  },
  props: {
    field: Object,
    path: String
  },
  components: {
    draggable,

    editBooleanField,
    editCodeField,
    editDateField,
    editFileField,
    editLinkField,
    editMultiLineTextbox,
    editReferenceField,
    editRichTextEditor,
    editSelectField,
    editSingleLineTextbox,

    editColumnLayout: function () { return import('./editColumnLayout.vue') },
    editGroupLayout: function () { return import('./editGroupLayout.vue') }
  },
  computed: {
    ...mapState('editors/entry', {
      contentType: state => state.contentType,
      entry: state => state.entry
    }),
    valueModel: {
      get: function () {
        let value = _.get(this, `entry.content.${this.path}`)
        const groupMode = _.get(this, 'field.options.groupMode')

        if (groupMode === 'multiple' && !_.isArray(value)) {
          value = []
          this.storeSet({ [`entry.content.${this.path}`]: value })
        } else if (groupMode === 'single' && !_.isPlainObject(value)) {
          value = {}
          this.storeSet({ [`entry.content.${this.path}`]: value })
        }

        return value
      },
      set: function (val) {
        this.storeSet({ [`entry.content.${this.path}`]: val })
      }
    }
  },
  methods: {
    expandedInput: function (idx) {
      if (this.expanded.includes(idx)) {
        this.expanded = _.without(this.expanded, idx)
      } else {
        this.expanded = [...this.expanded, idx]
      }
    },
    panelStyle: function (idx) {
      if (this.expanded.includes(idx)) {
        return 'primary white--text'
      } else {
        return ''
      }
    },
    getPreview: function (idx) {
      const fields = _.get(this, 'field.options.fields') || []
      const data = this.valueModel
      const list = []

      for (const field of fields) {
        if (_.isString(data[idx][field.slug])) {
          list.push({ text: field.label, value: data[idx][field.slug] })
        }

        if (list.length >= 2) {
          return list
        }
      }

      return list
    },
    ...mapMutations('editors/entry', {
      storeSet: 'set'
    }),
    ...mapActions(['showConfirm']),
    dragItem: function (change) {
      setImmediate(() => {
        const value = _.cloneDeep(_.get(this, `entry.content.${this.path}`)) || []

        if (change.moved) {
          value.splice(change.moved.newIndex, 0, value.splice(change.moved.oldIndex, 1)[0])
        } else if (change.added) {
          value.splice(change.added.newIndex, 0, change.added.element)
        } else if (change.removed) {
          value.splice(change.removed.oldIndex, 1)
        }

        this.storeSet({ [`entry.content.${this.path}`]: value })
      })
    },
    addItem: function (idx) {
      const value = _.cloneDeep(_.get(this, `entry.content.${this.path}`)) || []

      value.splice(idx, 0, {})

      this.storeSet({ [`entry.content.${this.path}`]: value })
    },
    removeItem: async function (idx) {
      const answer = await this.showConfirm({
        body: 'This item will be deleted'
      })

      if (answer === 'yes') {
        const value = _.cloneDeep(_.get(this, `entry.content.${this.path}`)) || []

        value.splice(idx, 1)

        this.storeSet({ [`entry.content.${this.path}`]: value })
      }
    }
  }
}
</script>

<template>
  <div class="py-2 mb-5">
    <v-card>
      <v-card-title class="pt-2" primary-title>
        {{field.label}}
      </v-card-title>
      <v-card-text class="pt-0 px-0 pb-0">
        <div v-if="field.options.groupMode === 'single'" class="px-5 pb-5">
          <div v-for="field in field.options.fields" :key="field.id">
            <component :is="`edit${field.type}`" :path="`${path}.${field.slug}`" :field="field" />
          </div>
        </div>
        <div v-if="field.options.groupMode === 'multiple'">
          <draggable
            :value="valueModel"
            handle=".handle"
            @change="dragItem"
            @start="drag = true"
            @end="drag = false"
            animation="200"
            class="draggable"
            group="fields"
            tag="v-expansion-panels"
            :component-data="{ props: { flat: true, multiple: true, dark: false, 'value': this.expanded } }"
          >
            <v-expansion-panel v-for="(item, idx) of valueModel" :key="idx">
              <v-expansion-panel-header :expand-icon="null" ripple class="panel-header pa-0 ma-0" @click.stop="expandedInput(idx)" style="border-radius: 0;">

                <div :class="panelStyle(idx)" @click.stop="expandedInput(idx)" style="position: absolute; top: 0; bottom: 0; left: 0; right: 0; z-index: 1;">
                  <div class="d-flex align-center px-4" style="height: 100%; max-width: 100%;">
                    <div class="flex-shrink-0" @click.stop>
                      <div>
                        <v-icon :dark="!!panelStyle(idx)" class="handle pr-2" fixed-width>$gripVertical</v-icon>
                        <v-btn :dark="!!panelStyle(idx)" :disabled="idx === 0" fab small text @click="dragItem({ moved: { oldIndex: idx, newIndex: idx - 1 } })"><v-icon fixed-width>$up</v-icon></v-btn>
                        <v-btn :dark="!!panelStyle(idx)" :disabled="idx + 1 >= valueModel.length" fab small text @click="dragItem({ moved: { oldIndex: idx, newIndex: idx + 1 } })"><v-icon fixed-width>$down</v-icon></v-btn>
                        <v-btn :dark="!!panelStyle(idx)" fab small text @click="removeItem(idx)" color="error"><v-icon fixed-width>$delete</v-icon></v-btn>
                      </div>
                    </div>
                    <div class="text-truncate pl-3" style="width: 100%;">
                      <v-row no-gutters style="flex-wrap: nowrap;">
                        <v-col cols="6" class="px-1 text-truncate" v-for="(item, idx) of getPreview(idx)" :key="idx">
                          <span class="font-italic font-weight-bold">{{item.text}}:</span> {{item.value}}
                        </v-col>
                      </v-row>
                    </div>
                  </div>
                </div>
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <div class="pt-8">
                  <div v-for="field in field.options.fields" :key="field.id">
                    <component :is="`edit${field.type}`" :path="`${path}[${idx}].${field.slug}`" :field="field" />
                  </div>
                </div>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </draggable>
          <div class="d-flex justify-center">
            <v-btn fab small absolute bottom center color="accent" @click="addItem(valueModel.length)"><v-icon>$plus</v-icon></v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<style lang="scss" scoped>

.panel-header {
  border-top: 1px solid var(--v-primary-lighten5);
}

.handle {
  cursor: grab;
}

.addbar-wrapper {
  padding: 5px 0 25px;
  position: relative;

  .addbar {
    height: 2px;
    background-color: #ddd;

    .addbar-inner {
      display: none;
    }
  }

  &:hover {
    .addbar {
      .addbar-inner {
        display: flex;
      }
    }
  }
}

</style>
