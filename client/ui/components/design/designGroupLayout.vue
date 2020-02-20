
<script>
import _ from 'lodash'
import { mapFields } from 'vuex-map-fields'
import { mapState } from 'vuex'

import fieldTypes from '../../../../lib/fieldTypes.js'

export default {
  name: 'designGroupLayout',
  data: function () {
    return {
    }
  },
  props: {
    path: String
  },
  components: {
    fieldsList: function () { return import('../../fieldComponents/fieldsList.vue') }
  },
  computed: {
    ...mapState('editors/contentType', {
      contentType: state => state.contentType,
      conflicts: state => state.conflicts
    }),
    error: function () {
      if (this.conflicts && this.conflicts.fieldIds.includes(this.field.id)) {
        return 'This field has the same name as another field.'
      }

      return null
    },
    ...mapFields('editors/contentType', {
      selectedFieldId: 'selectedFieldId'
    }),
    fieldType: function () {
      return fieldTypes[this.field.type]
    },
    field: function () {
      return _.get(this.contentType, this.path)
    },
    fieldsPath: function () {
      return `${this.path}.options.fields`
    },
    fieldList: function () {
      return _.get(this.contentType, this.fieldsPath) || []
    }
  },
  methods: {
    panelStyle: function (idx) {
      if (this.expanded.includes(idx)) {
        return 'primary white--text'
      } else {
        return ''
      }
    }
  }
}
</script>

<template>
  <div @click.stop="selectedFieldId = field.id" class="field-wrapper py-2 mb-6">
    <div>
      <!-- <div class="mr-3 handle"><v-icon :icon="fieldType.icon">$generic</v-icon></div> -->
      <v-card>
        <div class="pt-2 pl-3 handle">
          <h3>{{field.label}}</h3>
          <span class="red-text">{{error}}</span>
        </div>
        <v-card-text class="pt-5 px-0 pb-0">
          <div v-if="field.options.groupMode === 'single'" class="px-5 pb-5">
            <div class="fields-container">
              <div v-if="fieldList.length === 0" class="placeholder d-flex justify-center align-center">
                Drag Fields Here
              </div>
              <fieldsList class="list" :path="fieldsPath" @select="selectedFieldId = $event" />
            </div>
          </div>
          <div v-if="field.options.groupMode === 'multiple'">
            <v-expansion-panels flat :value="0">
              <v-expansion-panel >
                <v-expansion-panel-header :expand-icon="null" ripple class="pa-0 ma-0">
                  <div class="primary white--text" style="position: absolute; top: 0; bottom: 0; left: 0; right: 0; z-index: 1;">
                    <div class="d-flex align-center px-4" style="height: 100%; max-width: 100%;">
                      <div class="flex-shrink-0" @click.stop>
                        <div>
                          <v-icon dark class="pr-2" fixed-width>$gripVertical</v-icon>
                          <v-btn dark disabled fab small text ><v-icon fixed-width>$up</v-icon></v-btn>
                          <v-btn dark disabled fab small text ><v-icon fixed-width>$down</v-icon></v-btn>
                          <v-btn dark fab small text color="error"><v-icon fixed-width>$delete</v-icon></v-btn>
                        </div>
                      </div>
                      <div class="text-truncate pl-3" style="width: 100%;">
                        <v-row no-gutters style="flex-wrap: nowrap;">
                          <v-col cols="6" class="px-1 text-truncate">
                            <span class="font-italic font-weight-bold"></span>
                          </v-col>
                        </v-row>
                      </div>
                    </div>
                  </div>
                  <div class="cover-area" @click.prevent.stop="selectedFieldId = field.id" style="z-index: 1;"></div>
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                  <div class="fields-container mt-5">
                    <div v-if="fieldList.length === 0" class="placeholder d-flex justify-center align-center">
                      Drag Fields Here
                    </div>
                    <fieldsList class="list" :path="fieldsPath" @select="selectedFieldId = $event" />
                  </div>
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-expansion-panels>

            <div class="d-flex justify-center">
              <v-btn fab small absolute bottom center color="accent"><v-icon>$plus</v-icon></v-btn>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<style lang="scss" scoped>

.red-text {
  color: var(--v-error-base);
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

.field-item {
  cursor: grab;
  background-color: #f5f5f5;

  &.selected {
    background-color: #C5CAE9;;
  }
}

.fields-container {
  border: 1px dotted #fff;
  position: relative;

  &:hover {
    border: 1px dotted #aaa;
  }

  .placeholder {
    position: absolute;
    opacity: 0.5;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
  }

  .list {
    position: relative;
    z-index: 1;
  }
}

.cover-area {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

</style>
