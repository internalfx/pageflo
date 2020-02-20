import _ from 'lodash'

const types = [
  'BooleanField',
  'CodeField',
  'DateField',
  'FileField',
  'LinkField',
  'MultiLineTextbox',
  'ReferenceField',
  'RichTextEditor',
  'SelectField',
  'SingleLineTextbox',

  'ColumnLayout',
  'GroupLayout'

]

const data = {}

const icons = {
  SingleLineTextbox: ['fas', 'minus'],
  MultiLineTextbox: ['fas', 'bars'],
  RichTextEditor: ['fas', 'paragraph'],
  SelectField: ['fas', 'tasks'],
  BooleanField: ['fas', 'toggle-on'],
  DateField: ['fas', 'calendar-alt'],
  CodeField: ['fas', 'code'],
  FileField: ['fas', 'photo-video'],
  LinkField: ['fas', 'link'],
  ReferenceField: ['fas', 'project-diagram'],

  ColumnLayout: ['fas', 'columns'],
  GroupLayout: ['fas', 'object-group']
}

const defaults = function (type) {
  const data = {
    id: null,
    type,
    label: `New ${_.startCase(type)}`,
    slug: _.camelCase(`New ${_.startCase(type)}`),
    options: {}
  }

  if (type === 'GroupLayout') {
    data.options.groupMode = 'single'
    data.slug = _.camelCase(data.label)
  } else if (type === 'SelectField') {
    data.options.selectMode = 'single'
  } else if (type === 'ReferenceField') {
    data.options.selectMode = 'single'
  } else if (type === 'ColumnLayout') {
    data.label = null
  }

  return data
}

const group = function (type) {
  const layouts = [
    'ColumnLayout',
    'GroupLayout'
  ]

  return layouts.includes(type) ? 'layout' : 'field'
}

const optionList = function (type) {
  const list = []

  if ([
    'DateField',
    'InspectionField',
    'MultiLineTextbox',
    'NumberField',
    'SelectField',
    'SingleLineTextbox'
  ].includes(type)) {
    list.push('required')
  }

  if ([
    'SingleLineTextbox',
    'MultiLineTextbox'
  ].includes(type)) {
    list.push('hint')
  }

  if ([
    'ReferenceField',
    'SelectField'
  ].includes(type)) {
    list.push('selectMode')
  }

  if ([
    'ReferenceField'
  ].includes(type)) {
    list.push('contentTypes')
  }

  if ([
    'SelectField'
  ].includes(type)) {
    list.push('choices')
  }

  if ([
    'GroupLayout'
  ].includes(type)) {
    list.push('groupMode')
  }

  if ([
    'RichTextEditor'
  ].includes(type)) {
    list.push('imageSize')
  }

  return list
}

for (const type of types) {
  data[type] = {
    title: _.startCase(type),
    slug: type,
    icon: icons[type],
    group: group(type),
    defaults: defaults(type),
    optionList: optionList(type)
  }
}

export default data
