
export default function ({ app, redirect, store }) {
  if (store.state.publication_key == null) {
    redirect('/publications')
  }
}
