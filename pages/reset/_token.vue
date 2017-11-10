<template>
  <v-app>
    <v-toolbar app fixed prominent dark color="secondary">
      <img src="/icon.png" height="63" @click="$router.push('/')" style="cursor: pointer"/>
      <v-toolbar-title>{{title}}</v-toolbar-title>
    </v-toolbar>
    <main>
      <v-content>
        <v-container>
          <v-form v-model="valid" ref="form" @submit.prevent>
            <v-card>
              <v-card-title class="title" primary-title>Reset Password
              </v-card-title>
              <v-card-text>
                <v-text-field label="Nyt Password" type="password" v-model="password" required></v-text-field>
              </v-card-text>
              <v-card-actions>
                <v-spacer/>
                <v-btn type="submit" color="primary" @click="submit">Reset Password</v-btn>
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
export default {
  head () {
    return {
      title: this.title
    }
  },
  data () {
    return {
      snackbar: false,
      password: null,
      message: null,
      valid: false,
      title: 'Reset Password'
    }
  },
  methods: {
    submit () {
      const { password } = this
      this.$store.dispatch('authManagement/create', {
        action: 'resetPwdLong',
        value: { token: this.$route.params.token, password }
      }).then(message => {
        console.log(message)
        this.$router.replace('/')
      }).catch(err => {
        console.log(err)
        if (err.type && err.type === 'FeathersError') {
          this.message = err.message
          this.snackbar = true
        } else {
          this.$router.replace('/')
        }
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
