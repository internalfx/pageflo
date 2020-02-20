
export default ({ app, env }, inject) => {
  inject('gqlClient', app.apolloProvider.defaultClient)
}
