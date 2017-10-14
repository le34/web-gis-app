// import feathersVuex, { initAuth } from 'feathers-vuex'
import feathersVuex from 'feathers-vuex'
import feathersClient from '~/plugins/feathers-client'

const { service, auth } = feathersVuex(feathersClient, { idField: 'id' })

export const plugins = [
  service('/users'),
  service('/roles'),
  service('/clients'),
  service('/cvr'),
  service('/authManagement'),
  auth({
    userService: 'users'
  })
]

export const state = () => ({
  drawer: true,
  mini: false
})

export const mutations = {
  drawer (state, value) {
    state.drawer = value
  },
  mini (state, value) {
    state.mini = value
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
