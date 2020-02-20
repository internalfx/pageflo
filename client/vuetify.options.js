
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const fasIcon = function (name) {
  return {
    component: FontAwesomeIcon,
    props: {
      icon: ['fas', name]
    }
  }
}

const iconsDefault = {
  save: fasIcon('check'),
  cancel: fasIcon('times'),
  close: fasIcon('times'),

  complete: fasIcon('check'),
  create: fasIcon('plus'),
  edit: fasIcon('pencil-alt'),
  delete: fasIcon('trash-alt'),
  clear: fasIcon('times-circle'),

  search: fasIcon('search'),
  help: fasIcon('question-circle'),
  email: fasIcon('envelope'),
  send: fasIcon('paper-plane'),
  print: fasIcon('print'),
  picture: fasIcon('camera'),
  exchange: fasIcon('exchange-alt'),

  file: fasIcon('file'),
  fileAlt: fasIcon('file-alt'),
  fileArchive: fasIcon('file-archive'),
  fileAudio: fasIcon('file-audio'),
  fileCode: fasIcon('file-code'),
  fileCsv: fasIcon('file-csv'),
  fileExcel: fasIcon('file-excel'),
  fileImage: fasIcon('file-image'),
  filePdf: fasIcon('file-pdf'),
  fileVideo: fasIcon('file-video'),
  fileWord: fasIcon('file-word'),

  media: fasIcon('photo-video'),
  image: fasIcon('image'),
  video: fasIcon('video'),
  key: fasIcon('key'),

  // clear: '...',
  // success: '...',
  // info: '...',
  // warning: '...',
  // error: '...',

  radioOff: fasIcon('circle'),
  radioOn: fasIcon('dot-circle'),

  up: fasIcon('chevron-up'),
  down: fasIcon('chevron-down'),

  prev: fasIcon('chevron-left'),
  next: fasIcon('chevron-right'),

  checkboxOn: fasIcon('check-square'),
  checkboxOff: fasIcon('square'),

  expand: fasIcon('chevron-down'),
  menu: fasIcon('bars'),
  dropdown: fasIcon('caret-down'),

  yes: fasIcon('check'),
  no: fasIcon('times'),

  DateField: fasIcon('calendar-alt'),

  upload: fasIcon('upload'),

  list: fasIcon('th-list'),
  grid: fasIcon('th-large'),

  gripVertical: fasIcon('grip-vertical'),

  paragraph: fasIcon('paragraph'),
  heading: fasIcon('heading'),
  quoteRight: fasIcon('quote-right'),
  listUl: fasIcon('list-ul'),
  listOl: fasIcon('list-ol'),
  link: fasIcon('link'),
  bold: fasIcon('bold'),
  italic: fasIcon('italic'),
  strikethrough: fasIcon('strikethrough'),
  underline: fasIcon('underline'),
  code: fasIcon('code'),
  keyboard: fasIcon('keyboard'),
  alignLeft: fasIcon('align-left'),
  alignCenter: fasIcon('align-center'),
  alignRight: fasIcon('align-right'),
  alignJustify: fasIcon('align-justify'),

  externalLinkAlt: fasIcon('external-link-alt')
}

export default function ({ app, env }) {
  const config = {
    icons: {
      iconfont: 'faSvg',
      values: {
        ...iconsDefault,
        generic: {
          component: FontAwesomeIcon
        }
      }
    },
    theme: {
      themes: {
        light: {
          primary: '#3F51B5',
          secondary: '#464646',
          accent: '#66B82C',
          success: '#66B82C'
        }
      },
      options: {
        customProperties: true
      }
    }
  }

  return config
}
