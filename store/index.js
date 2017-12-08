// import feathersVuex, { initAuth } from 'feathers-vuex'
import feathersVuex from 'feathers-vuex'
import feathersClient from '~/plugins/feathers-client'

const { service, auth } = feathersVuex(feathersClient, { idField: 'id' })

export const plugins = [
  service('/users'),
  service('/roles'),
  service('/company'),
  service('/cvr'),
  service('/files'),
  service('/data'),
  service('/projects'),
  service('/totals'),
  service('/authManagement'),
  auth({
    userService: 'users'
  })
]

export const state = () => ({
  drawer: false,
  mini: false,
  dark: true,
  title: null,
  last: null
})

export const mutations = {
  last (state, value) {
    state.last = value
  },
  drawer (state, value) {
    state.drawer = value
  },
  dark (state, value) {
    state.dark = value
  },
  mini (state, value) {
    state.mini = value
  },
  title (state, value) {
    state.title = value
  }
}

export const actions = {
  /*
  nuxtServerInit ({ commit, dispatch }, { req }) {
    return initAuth({
      commit,
      dispatch,
      req,
      moduleName: 'auth',
      cookieName: 'feathers-jwt'
    })
  }
  */
}
