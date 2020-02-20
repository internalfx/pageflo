
module.exports = {
  // Admin API
  'post /api/auth/getLink': 'loginController.getLink',
  'post /api/auth/login': 'loginController.login',
  'post /api/auth/logout': 'loginController.logout',
  'get /api/auth/user': 'loginController.user',

  'get /api/file/download/:filename*': 'api.fileController.download',
  'post /api/file/upload': 'api.fileController.upload',

  // Client API
  'get /api/client/file/download/:filename': 'client.fileController.download',
  'get /api/client/entry/list': 'client.entryController.list',
  'options /api/client/entry/list': 'client.entryController.list',
  'get /api/client/entry/show': 'client.entryController.show',
  'options /api/client/entry/show': 'client.entryController.show'
}
