<template>
  <v-app>    
    <v-toolbar app fixed prominent dark color="secondary">
      <img src="/icon.png" height="63" @click.stop="$router.push('/')" style="cursor: pointer"/>
      <v-toolbar-title @click.stop="$router.push('/demo')" style="cursor: pointer">{{title}}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items class="hidden-sm-and-down">
        <v-btn flat nuxt to="/demo/drone">Drone</v-btn>
        <v-btn flat nuxt to="/demo/heatmap">Heatmap</v-btn>
        <v-btn flat nuxt to="/demo/hexbins">Hexbins</v-btn>
      </v-toolbar-items>
    </v-toolbar>
    <nuxt-child/>
  </v-app>
</template>
<script>
export default {
  // middleware: 'authenticated',
  head () {
    return {
      title: this.title
    }
  },
  data () {
    return {
      title: 'Demo'
    }
  },
  methods: {
  },
  computed: {
  },
  mounted () {}
}
</script>
<style scoped lang="stylus">

</style>
