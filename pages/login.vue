<template>
  <v-app>
    <v-toolbar app fixed dark class="primary">
      <v-toolbar-title>LE34 - Kort</v-toolbar-title>
    </v-toolbar>
    <main class="main">
      <v-content>
        <v-container>
          <v-form v-model="valid" ref="form" @submit.prevent>
            <v-card>
              <v-card-title class="title" primary-title>Login
              </v-card-title>
              <v-card-text>
                <v-text-field label="Email" type="email" v-model="email" required></v-text-field>
                <v-text-field label="Password" type="password" v-model="password" required></v-text-field>
              </v-card-text>
              <v-card-actions>
                <v-spacer/>
                <v-btn type="submit" color="primary" @click="submit">Login</v-btn>
                <v-btn flat color="primary" @click="sendResetPwd">Glemt password</v-btn>
              </v-card-actions>
            </v-card>
          </v-form>
        </v-container>
      </v-content>
    </main>
    <v-snackbar color="warning" v-model="snackbar">
      {{ message }}
      <v-btn dark flat @click.native="snackbar = false">Luk</v-btn>
    </v-snackbar>
  </v-app>
</template>
<script>
// import client from '~/plugins/feathers'
// import cookie from 'js-cookie'
import { mapActions } from 'vuex'
export default {
  head () {
    return {
      title: 'Login'
    }
  },
  data () {
    return {
      snackbar: false,
      email: null,
      password: null,
      error: null,
      valid: false,
      message: null
    }
  },
  methods: {
    ...mapActions({
      authenticate: 'auth/authenticate'
    }),
    async submit () {
      const { email, password } = this

      try {
        await this.authenticate({ strategy: 'local', email, password })
        this.$router.back()
      } catch (e) {
        this.error = e.message
        throw e
      }
    },
    sendResetPwd () {
      const { email } = this
      this.$store.dispatch('authManagement/create', {
        action: 'sendResetPwd',
        value: { email }
      }).then(message => {
        console.log(message)
      }).catch(err => {
        console.log('error', err)
        if (err.type && err.type === 'FeathersError') {
          this.message = err.message
        } else {
          this.message = 'Der er sendt en email til dig!'
        }
        this.snackbar = true
      })
    }
  },
  computed: {
  },
  watch: {
  },
  mounted () {
  },
  fetch ({ store }) {
  }
}
</script>
<style scoped lang="stylus">
</style>
