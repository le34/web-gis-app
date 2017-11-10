/* no-process-env: 0 */
import feathers from 'feathers/client'
import hooks from 'feathers-hooks'
import socketio from 'feathers-socketio/client'
import auth from 'feathers-authentication-client'
import io from 'socket.io-client'
// import { CookieStorage } from 'cookie-storage'

const socket = io(process.env.FEATHERS, {transports: ['websocket']})

const feathersClient = feathers()
  .configure(hooks())
  .configure(socketio(socket))
  .configure(auth({ storage: window.localStorage }))
  // .configure(auth({ storage: new CookieStorage() }))

export default feathersClient
