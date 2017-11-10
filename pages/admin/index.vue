<template>
  <v-content>
    <v-toolbar app fixed prominent dark color="secondary">
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <img src="/icon.png" height="63" @click="$router.push('/')" style="cursor: pointer"/>
      <v-toolbar-title>{{title}}</v-toolbar-title>
    </v-toolbar>
    <v-container>
      <v-card>
        <v-card-title class="display-1">Publish your data in 2 steps</v-card-title>
        <v-card-text>
          <ol>
            <li>Select your company from the list and goto data.</li>
            <li>Upload a GeoJSON file.</li>
          </ol>
        </v-card-text>
        <v-card-actions>
          <v-spacer/>
          <v-btn nuxt to="/admin/company" flat color="primary">Go To Companies</v-btn>
        </v-card-actions>
      </v-card>       
    </v-container>
  </v-content>
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
      title: 'Administration'
    }
  },
  methods: {
  },
  computed: {
    drawer: {
      get () {
        return this.$store.state.drawer
      },
      set (value) {
        this.$store.commit('drawer', value)
      }
    },
    mini: {
      get () {
        return this.$store.state.mini
      },
      set (value) {
        this.$store.commit('mini', value)
      }
    }
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