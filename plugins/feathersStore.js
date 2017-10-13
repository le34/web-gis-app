import feathers from 'feathers/client'
import feathersVuex from 'feathers-vuex'
import socketio from 'feathers-socketio/client'
import hooks from 'feathers-hooks'
import auth from 'feathers-authentication-client'
import io from 'socket.io-client'

const feathersStore = store => {
  const socket = io('http://localhost:3030', {
    transports: ['websocket']
  })

  const feathersClient = feathers()
    .configure(socketio(socket))
    .configure(hooks())
    .configure(auth({
      storage: window.localStorage
    }))
  const { service } = feathersVuex(feathersClient, { idField: 'id' })
  service('/users')
  service('/roles')
  service('/clients')
  service('/authManagement')
}
export default feathersStore
