<template>
  <v-app>
    <v-navigation-drawer :dark="dark" persistent app enable-resize-watcher v-model="drawer">
      <v-toolbar flat class="transparent">
        <v-list class="pa-0">
          <v-list-tile avatar @click.stop="drawer=false">
            <v-list-tile-action >
              <v-icon>close</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>Settings</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
      </v-toolbar>
      <v-list dense class="pt-0">
        <v-divider></v-divider>
        <v-list-tile>
          <v-list-tile-action>
            <v-switch v-model="toggleLight"></v-switch>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Light</v-list-tile-title>
          </v-list-tile-content>
          <v-list-tile-action>
          </v-list-tile-action>
        </v-list-tile>
        <v-list-tile>
          <v-list-tile-action>
            <v-switch v-model="toggleDark"></v-switch>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Dark</v-list-tile-title>
          </v-list-tile-content>
          <v-list-tile-action>
          </v-list-tile-action>
        </v-list-tile>
        <v-list-tile>
          <v-list-tile-action>
            <v-switch v-model="toggleSatellite"></v-switch>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Satellite</v-list-tile-title>
          </v-list-tile-content>
          <v-list-tile-action>
          </v-list-tile-action>
        </v-list-tile>
        <v-divider></v-divider>
        <v-list-tile>
          <v-list-tile-action>
            <v-switch v-model="buildings"></v-switch>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>3D Bygninger</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile>
          <v-list-tile-action>
            <v-switch v-model="matrikel"></v-switch>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Matrikelkort</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-group v-for="group in groups" v-bind:key="group.id" value="true">
          <v-list-tile slot="item">
            <v-list-tile-action>
              <v-switch v-model="group.visible" @click.stop="hide(group)"></v-switch>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>{{ group.name }}</v-list-tile-title>
            </v-list-tile-content>
            <v-list-tile-action>
              <v-icon dark>keyboard_arrow_down</v-icon>
            </v-list-tile-action>
          </v-list-tile>
          <div class="teal darken-1 white--text group-info">
            {{group.name}}<br/> {{group.createdAt}}
          </div>
          <v-list-tile class="legend" v-for="layer in group.layers" v-bind:key="layer.id">
            <v-list-tile-action>
              <v-switch v-model="layer.visible" @click.stop="hideLayer(group, layer)"></v-switch>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>{{layer.name}}</v-list-tile-title>
            </v-list-tile-content>
            <v-list-tile-action>
              <svg width="24" height="24">
                <line v-if="layer.type === 'line'" x1="0" y1="12" x2="24" y2="12" :style="'stroke:' + layer.paint['line-color'] + ';stroke-width:' + layer.paint['line-width']"></line>
                <circle v-if="layer.type === 'circle'" cx="12" cy="12" r="8" :stroke="layer.paint['circle-stroke-color']" :stroke-width="layer.paint['circle-stroke-width']" :fill="layer.paint['circle-color']" :fill-opacity="layer.paint['circle-opacity']" />
                <rect v-if="layer.type === 'fill'" width="24" height="24" :stroke="layer.paint['fill-outline-color']" stroke-width="2" :fill="layer.paint['fill-color']" :fill-opacity="layer.paint['fill-opacity']" />
              </svg>
            </v-list-tile-action>
          </v-list-tile>
        </v-list-group>
      </v-list>
    </v-navigation-drawer>
    <v-toolbar app fixed prominent dark color="secondary">
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <img src="/icon.png" height="63" @click.stop="$router.push('/')" style="cursor: pointer"/>
      <v-toolbar-title>{{title}}</v-toolbar-title>
    </v-toolbar>
    <main>
      <nuxt-child/>
    </main>
  </v-app>
</template>
<script>
import { mapGetters } from 'vuex'
export default {
  // middleware: 'authenticated',
  head () {
    return {
      title: this.title
    }
  },
  data () {
    return {
    }
  },
  methods: {
    hide (item) {
      let group = { ...item }
      group.visible = !group.visible
      let layers = [...group.layers]
      layers.forEach((item, index) => {
        let layer = { ...item }
        layer.visible = group.visible
        layers[index] = layer
      })
      group.layers = layers
      this.$store.commit('layers/editGroup', group)
    },
    hideLayer (group, item) {
      let layer = { ...item }
      layer.visible = !layer.visible
      this.$store.commit('layers/editLayer', { id: group.id, layer })
    }
  },
  computed: {
    ...mapGetters('layers', {
      groups: 'sortedList'
    }),
    title () {
      return this.$store.state.title
    },
    drawer: {
      get () {
        return this.$store.state.drawer
      },
      set (value) {
        this.$store.commit('drawer', value)
      }
    },
    buildings: {
      get () {
        return this.$store.state.layers.buildings
      },
      set (value) {
        this.$store.commit('layers/buildings', value)
      }
    },
    matrikel: {
      get () {
        return this.$store.state.layers.matrikel
      },
      set (value) {
        this.$store.commit('layers/matrikel', value)
      }
    },
    toggleLight: {
      get () {
        return this.$store.state.layers.light
      },
      set (value) {
        if (value) {
          this.$store.commit('layers/light', true)
          this.$store.commit('layers/dark', false)
          this.$store.commit('layers/satellite', false)
          this.dark = false
        }
      }
    },
    toggleDark: {
      get () {
        return this.$store.state.layers.dark
      },
      set (value) {
        if (value) {
          this.$store.commit('layers/light', false)
          this.$store.commit('layers/dark', true)
          this.$store.commit('layers/satellite', false)
          this.dark = true
        }
      }
    },
    toggleSatellite: {
      get () {
        return this.$store.state.layers.satellite
      },
      set (value) {
        if (value) {
          this.$store.commit('layers/light', false)
          this.$store.commit('layers/dark', false)
          this.$store.commit('layers/satellite', true)
          this.dark = true
        }
      }
    },
    dark: {
      get () {
        return this.$store.state.dark
      },
      set (value) {
        let _groups = [...this.groups]
        _groups.forEach((group, i) => {
          let _group = { ...group }
          let _layers = [..._group.layers]
          _layers.forEach((item, index) => {
            let layer = { ...item }
            if (layer.hasOwnProperty('paint')) {
              let _paint = { ...layer.paint }
              if (value) {
                if (
                  _paint.hasOwnProperty('line-color') &&
                  _paint['line-color'] === '#000000'
                ) {
                  _paint['line-color'] = '#ffffff'
                } else if (
                  _paint.hasOwnProperty('circle-color') &&
                  _paint['circle-color'] === '#000000'
                ) {
                  _paint['circle-color'] = '#ffffff'
                }
              } else {
                if (
                  _paint.hasOwnProperty('line-color') &&
                  _paint['line-color'] === '#ffffff'
                ) {
                  _paint['line-color'] = '#000000'
                } else if (
                  _paint.hasOwnProperty('circle-color') &&
                  _paint['circle-color'] === '#ffffff'
                ) {
                  _paint['circle-color'] = '#000000'
                }
              }
              layer.paint = _paint
            }
            _layers[index] = layer
          })
          _group.layers = _layers
          _groups[i] = _group
        })
        this.$store.commit('dark', value)
        this.$store.commit('layers/items', _groups)
      }
    }
  },
  mounted () {}
}
</script>
<style scoped lang="stylus">
.group-info {
  padding: 10px;
}
</style>
