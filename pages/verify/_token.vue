<template>
  <v-app>
    <v-toolbar app fixed dark class="primary">
      <v-toolbar-title>LE34 - Kort</v-toolbar-title>
    </v-toolbar>
    <main>
      <v-content>
        <v-container>
            <v-card>
              <v-card-title class="title" primary-title>Verificer Email
              </v-card-title>
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
      title: 'Verificer email'
    }
  },
  data () {
    return {
      message: null
    }
  },
  methods: {
  },
  computed: {
  },
  watch: {
  },
  mounted () {
    this.$store.dispatch('authManagement/create', {
      action: 'verifySignupLong',
      value: this.$route.params.token
    }).then((res) => {
      console.log('verified', res)
      this.message = res
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
