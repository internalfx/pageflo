
module.exports = {
  '*': 'isLoggedIn',

  loginController: {
    '*': true
  },

  api: {
    '*': 'isLoggedIn',

    fileController: {
      download: 'isLoggedInOrLocal'
    }
  },

  client: {
    '*': true
  },

  preview: {
    '*': 'isLoggedInOrLocal'
  }
}
