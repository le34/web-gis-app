export const state = () => ({
  items: {}
})

export const getters = {
  list: state => {
    return state.items
  },
  get: state => data => {
    return { ...state.items[data] }
  }
}

export const mutations = {
  list (state, data) {
    state.items = data
  },
  add (state, data) {
    state.items = { ...state.items, ...data }
  },
  remove (state, data) {
    state.items = { [data]: null, ...state.items }
  }
}

export const actions = {
  add (context, data) {
    return context.commit('add', data)
  },
  remove (context, data) {
    return context.commit('remove', data)
  }
}
