export default function (context) {
  context.store.commit('last', context.route.fullPath)
  if (!context.store.state.auth.payload) {
    context.redirect('/login')
  }
}
