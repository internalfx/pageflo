
const path = require('path')

module.exports = {
  baseURL: 'http://localhost:8000',
  port: 8000,
  arango: {
    url: 'http://localhost:8529',
    database: 'pageflo'
  },
  arangoFS: {
    path: path.join(__dirname, 'fileStore')
  }
}
