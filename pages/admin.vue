<template>
  <v-app>
    <v-navigation-drawer fixed app v-model="drawer">
      <v-toolbar dense flat class="transparent" @click.stop="drawer=false">
        <v-btn icon><v-icon>close</v-icon></v-btn>
        <v-toolbar-title>Settings</v-toolbar-title>
      </v-toolbar>
      <v-list dense>
        <v-list-group group="admin" prepend-icon="settings">
          <v-list-tile slot="activator">
            <v-list-tile-content>
              <v-list-tile-title>Administration</v-list-tile-title>
            </v-list-tile-content>            
          </v-list-tile>
          <v-list-tile nuxt to="/admin/users">
            <v-list-tile-action>
              <v-icon>person</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>Users</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
          <v-list-tile nuxt to="/admin/companies">
            <v-list-tile-action>
              <v-icon>business</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>Companies</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
          <v-list-tile nuxt to="/admin/projects">
            <v-list-tile-action>
              <v-icon>assignment</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>Projects</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
          <v-list-tile nuxt to="/admin/datasources">
            <v-list-tile-action>
              <v-icon>folder</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>Datasources</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
          <v-list-tile nuxt to="/admin/styles">
            <v-list-tile-action>
              <v-icon>color_lens</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>Styles</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
          <v-list-tile nuxt to="/admin/layers">
            <v-list-tile-action>
              <v-icon>layers</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>Layers</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
          <v-list-tile nuxt to="/admin/projectstools">
            <v-list-tile-action>
              <v-icon>build</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>Projects - Tools</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
          <v-list-tile nuxt to="/admin/tools">
            <v-list-tile-action>
              <v-icon>build</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>Tools</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
          <v-list-tile @click.stop="signout">
            <v-list-tile-action>
              <v-icon>power_settings_new</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>Log Out</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list-group>
      </v-list>
    </v-navigation-drawer>
    <nuxt-child/>
  </v-app>
</template>
<script>
import { mapActions } from 'vuex'
export default {
  middleware: 'authenticated',
  methods: {
    ...mapActions({
      logout: 'auth/logout'
    }),
    signout () {
      this.logout().then(() => {
        this.$router.replace('/')
      }).catch(err => {
        console.log(err)
      })
    }
  },
  computed: {
    drawer: {
      get () {
        return this.$store.state.drawer
      },
      set (value) {
        this.$store.commit('drawer', value)
      }
    }
  }
}
</script>
<style>
</style>
