<template>
  <v-app>
    <v-navigation-drawer persistent app enable-resize-watcher disable-route-watcher v-model="drawer" :mini-variant.sync="mini">
      <v-toolbar flat class="transparent" v-show="!mini">
        <v-list class="pa-0">
          <v-list-tile avatar tag="div">
            <v-list-tile-content>
              <v-list-tile-title>Menu</v-list-tile-title>
            </v-list-tile-content>
            <v-list-tile-action>
              <v-btn dark icon @click.native.stop="mini =! mini">
                <v-icon>chevron_left</v-icon>
              </v-btn>
            </v-list-tile-action>
          </v-list-tile>
        </v-list>
      </v-toolbar>
      <v-list dense class="pt-0">
        <v-divider></v-divider>
        <v-list-group group="admin">
          <v-list-tile slot="item">
            <v-list-tile-action>
              <v-icon>settings</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>Administration</v-list-tile-title>
            </v-list-tile-content>
            <v-list-tile-action>
              <v-icon>keyboard_arrow_down</v-icon>
            </v-list-tile-action>
          </v-list-tile>
          <v-list-tile nuxt to="/admin/users">
            <v-list-tile-action>
              <v-icon dark>people</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>Login brugere</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
          <v-list-tile nuxt to="/admin/slutbruger">
            <v-list-tile-action>
              <v-icon dark>person</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>Slutkunde</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
          <v-list-tile nuxt to="/admin/opdragsgiver">
            <v-list-tile-action>
              <v-icon dark>account_box</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>Opdragsgiver</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
          <v-list-tile nuxt to="/admin/data">
            <v-list-tile-action>
              <v-icon dark>cloud</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>Data</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list-group>
        <v-list-tile nuxt to="tiles">
          <v-list-tile-action>
            <v-icon dark>border_all</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Tiles</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile nuxt to="styles">
          <v-list-tile-action>
            <v-icon dark>brush</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Styles</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    <!--v-toolbar app fixed dark class="primary">
            <v-toolbar-side-icon @click.stop="drawer = !drawer" />
            <v-btn dark icon @click.stop="$router.go(-1)">
              <v-icon>arrow_back</v-icon>
            </v-btn>
            <v-toolbar-title>LE34 - Kort</v-toolbar-title>      
          </v-toolbar-->
    <main>
      <nuxt-child/>
    </main>
  </v-app>
</template>
<script>
export default {
  data () {
    return {
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
    /*
    this.$store.dispatch('auth/authenticate').catch(error => {
      if (!error.message.includes('Could not find stored JWT')) {
        console.error(error)
      }
    })
    */
  },
  fetch ({ store }) {
    // return store.dispatch('files/list')
  },
  middleware: 'authenticated'
}
</script>
<style scoped lang="stylus">
</style>
