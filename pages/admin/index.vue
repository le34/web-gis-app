<template>
  <v-content>
    <v-toolbar app fixed prominent dark color="secondary">
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <img src="/icon.png" height="63" @click="$router.push('/')" style="cursor: pointer" />
      <v-toolbar-title>{{title}}</v-toolbar-title>
    </v-toolbar>
    <v-container>
      <v-card>
        <v-card-title class="display-1">Publish your data in 3 steps</v-card-title>
        <v-card-text>
          <ol>
            <li>Select your company from the list and go to projects.</li>
            <li>Select a project or create a new and go to data.</li>
            <li>Upload a GeoJSON file.</li>
          </ol>
        </v-card-text>
        <v-card-actions>
          <v-spacer/>
          <v-btn nuxt to="/admin/companies" flat color="primary">Go To Companies</v-btn>
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
  methods: {},
  computed: {
    drawer: {
      get () {
        return this.$store.state.drawer
      },
      set (value) {
        this.$store.commit('drawer', value)
      }
    }
  },
  watch: {},
  mounted () {},
  fetch ({ store }) {}
}
</script>
<style scoped lang="stylus">
ol
  margin 16px
</style>