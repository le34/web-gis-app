<template>
  <v-app>
    <v-toolbar app fixed prominent dark color="secondary">
      <img src="/icon.png" height="63" />
      <v-toolbar-title>{{title}}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn flat to="/admin">Login</v-btn>
    </v-toolbar>
    <v-content>
      <v-container fluid fill-height>
        <v-layout column justify-center align-center>
          <h1>Visualize your geodata on the Web</h1>
          <h2>Blazing fast vector tiles</h2>
          <h2>One-click upload from Bentley Map</h2>
          <v-btn color="primary" dark large round flat nuxt to="/admin">Get Started</v-btn>
          <v-btn color="primary" dark large round flat nuxt to="/demo">Demo</v-btn>
        </v-layout>
      </v-container>
    </v-content>
    <v-footer app dark class="white--text">
      <v-layout row wrap>
        <v-flex class="pa-3">
          <strong>LE34</strong><br/> Energivej 34<br/> 2750 Ballerup<br/> Denmark
          <br/> CVR 20683880
        </v-flex>
        <v-flex class="pa-3">
          <strong>Contact</strong><br/> Rune Tvilum<br/>
          <a href="mailto:rut@le34.dk?Subject=Visualize%20data%on %20web">rut@le34.dk</a><br/> +45 21 93 27 03
        </v-flex>
      </v-layout>
    </v-footer>
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
      title: 'Map',
      drawer: false
    }
  },
  computed: {},
  methods: {},
  watch: {},
  mounted () {},
  fetch ({ store }) {}
}
</script>
<style scoped lang="stylus">
a {
  text-decoration: none;
  color: white;
}
</style>
