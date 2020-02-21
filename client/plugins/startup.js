
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import _ from 'lodash'
import Vue from 'vue'
import * as tagNames from 'mobiledoc-dom-renderer/dist/commonjs/mobiledoc-dom-renderer/utils/tag-names'
import { VALID_ATTRIBUTES, VALID_MARKUP_TAGNAMES } from 'mobiledoc-kit/dist/commonjs/mobiledoc-kit/models/markup'

Vue.component('font-awesome-icon', FontAwesomeIcon)
Vue.prototype.get = _.get

_.mixin({ isPresent: _.negate(_.isEmpty) })

export default ({ app, env, store }, inject) => {

  app.router.beforeEach((to, from, next) => {
    store.commit('set', {
      route: to
    })
    next()
  })
}

tagNames.isValidMarkerType = function () {
  return true
}

VALID_ATTRIBUTES.push('style')
VALID_ATTRIBUTES.push('target')
VALID_ATTRIBUTES.push('class')
VALID_ATTRIBUTES.push('alt')

VALID_MARKUP_TAGNAMES.push('small')
VALID_MARKUP_TAGNAMES.push('div')

// Supports healthy sinus activity and relief from muscle soreness.
