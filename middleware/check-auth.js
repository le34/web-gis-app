/*
import client from '~/plugins/feathers'
const getUserFromCookie = (req) => {
  if (!req.headers.cookie) return
  const jwtCookie = req.headers.cookie.split(';').find(c => c.trim().startsWith('jwt='))
  if (!jwtCookie) return
  return jwtCookie.split('=')[1]
}

const getUserFromLocalStorage = () => {
  return window.localStorage.getItem('jwt')
}
*/
export default function ({ store }) {
  return store.dispatch('auth/authenticate').catch(error => {
    console.log(error)
  })
}
