<template>
  <v-app>
    <v-toolbar app fixed prominent dark color="secondary">
      <img src="/icon.png" height="63" @click="$router.push('/')" style="cursor: pointer"/>
      <v-toolbar-title>{{title}}</v-toolbar-title>
    </v-toolbar>
    <main>
      <v-content>
        <v-container>
            <v-card>
              <v-card-text v-if="verified">
                <h6>Hi, {{email}}</h6>
                <p>Thank you for verifying your email.</p>
                <p>Please reset your password</p>
                <v-btn color="primary" dark large @click="sendResetPwd">Reset Password</v-btn>
              </v-card-text>
              <v-card-text>
                {{message}}
              </v-card-text>
            </v-card>
        </v-container>
      </v-content>
    </main>
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
      message: null,
      title: 'Verify email',
      verified: false,
      email: null
    }
  },
  methods: {
    sendResetPwd () {
      const { email } = this
      this.$store.dispatch('authManagement/create', {
        action: 'sendResetPwd',
        value: { email }
      }).then(message => {
        this.message = 'An email has been send to you with a reset link!'
      }).catch(err => {
        console.log('error', err)
        if (err.type && err.type === 'FeathersError') {
          this.message = err.message
        } else {
          this.message = 'An email has been send to you with a reset link!'
        }
      })
    }
  },
  computed: {
  },
  watch: {
  },
  mounted () {
    this.$store.dispatch('authManagement/create', {
      action: 'verifySignupLong',
      value: this.$route.params.token
    }).then(res => {
      this.verified = true
      this.email = res.email
    }).catch(err => {
      console.log('error', err)
      this.message = err
    })
  },
  fetch ({ store }) {
  }
}
</script>
<style scoped lang="stylus">
</style>
