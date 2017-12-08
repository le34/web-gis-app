<template>
  <v-app :dark="dark">
    <v-navigation-drawer fixed app v-model="drawer">
      <v-toolbar flat class="transparent">
        <v-list class="pa-0">
          <v-list-tile avatar @click.stop="drawer=false">
            <v-list-tile-action>
              <v-icon>close</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>Settings</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
      </v-toolbar>
      <v-list dense class="pt-0">
        <v-list-group value="true" class="group">
          <v-list-tile slot="item">
            <v-list-tile-action>
              <v-icon>build</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>Tools</v-list-tile-title>
            </v-list-tile-content>
            <v-list-tile-action>
              <v-icon>keyboard_arrow_down</v-icon>
            </v-list-tile-action>
          </v-list-tile>
          <v-expansion-panel>
            <v-expansion-panel-content v-for="(tool, index) in tools" :key="index" v-model="tool.active">
              <div slot="header">{{tool.name}}</div>
              <component :is="tool.component" :map="map" :active="tool.active"></component>
            </v-expansion-panel-content>
          </v-expansion-panel>
          <!--template v-for="(tool, index) in tools">
            <component :is="tool.component" :key="index" :map="map" :active="tool.active" @click.native="activate(index)"></component>
          </template-->
        </v-list-group>
      </v-list>
      <v-list dense class="pt-0">
        <v-list-group value="true" class="group">
          <v-list-tile slot="item">
            <v-list-tile-action>
              <v-icon>map</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>Basemaps</v-list-tile-title>
            </v-list-tile-content>
            <v-list-tile-action>
              <v-icon>keyboard_arrow_down</v-icon>
            </v-list-tile-action>
          </v-list-tile>
          <v-list-tile class="legend">
            <v-list-tile-action>
              <v-switch v-model="toggleLight"></v-switch>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>Light</v-list-tile-title>
            </v-list-tile-content>
            <v-list-tile-action>
            </v-list-tile-action>
          </v-list-tile>
          <v-list-tile class="legend">
            <v-list-tile-action>
              <v-switch v-model="toggleDark"></v-switch>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>Dark</v-list-tile-title>
            </v-list-tile-content>
            <v-list-tile-action>
            </v-list-tile-action>
          </v-list-tile>
          <v-list-tile class="legend">
            <v-list-tile-action>
              <v-switch v-model="toggleSatellite"></v-switch>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>Satellite</v-list-tile-title>
            </v-list-tile-content>
            <v-list-tile-action>
            </v-list-tile-action>
          </v-list-tile>
        </v-list-group>
      </v-list>
      <v-list dense class="pt-0">
        <v-list-group value="true" class="group">
          <v-list-tile slot="item">
            <v-list-tile-action>
              <v-icon>layers</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>Layers</v-list-tile-title>
            </v-list-tile-content>
            <v-list-tile-action>
              <v-icon>keyboard_arrow_down</v-icon>
            </v-list-tile-action>
          </v-list-tile>
          <v-list-tile class="legend">
            <v-list-tile-action>
              <v-switch v-model="buildings"></v-switch>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>3D Bygninger</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
          <v-list-tile class="legend">
            <v-list-tile-action>
              <v-switch v-model="matrikel"></v-switch>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>Matrikelkort</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
          <v-list-tile class="legend">
            <v-list-tile-action>
              <v-switch v-model="toggleProjects"></v-switch>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>Projects</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list-group>
      </v-list>
      <v-list dense class="pt-0">
        <v-list-group class="group" v-for="group in groups" v-bind:key="group.id" :value="group.collapse" @input="(value) => collapse(value, group)">
          <v-list-tile slot="item">
            <v-list-tile-action>
              <v-switch v-model="group.visible" @click.stop="hide(group)"></v-switch>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>{{ group.name }}</v-list-tile-title>
            </v-list-tile-content>
            <v-list-tile-action>
              <v-icon>keyboard_arrow_down</v-icon>
            </v-list-tile-action>
          </v-list-tile>
          <v-list-tile class="legend" @click.stop="zoom(group)">
            <v-list-tile-content>
              <v-list-tile-title>{{group.name}}</v-list-tile-title>
              <v-list-tile-title>{{group.createdAt}}</v-list-tile-title>
            </v-list-tile-content>
            <v-list-tile-action>
              <v-icon>zoom_out_map</v-icon>
            </v-list-tile-action>
          </v-list-tile>
          <v-list-tile class="legend" v-for="layer in group.layers" v-bind:key="layer.id">
            <v-list-tile-action>
              <v-switch v-model="layer.visible" @click.stop="hideLayer(group, layer)"></v-switch>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>{{layer.name}}</v-list-tile-title>
            </v-list-tile-content>
            <v-list-tile-action>
              <svg width="24" height="24" v-if="layer.type!=='raster'">
                <line v-if="layer.type === 'line'" x1="0" y1="12" x2="24" y2="12" :style="'stroke:' + layer.paint['line-color'] + ';stroke-width:' + layer.paint['line-width']"></line>
                <circle v-if="layer.type === 'circle'" cx="12" cy="12" r="8" :stroke="layer.paint['circle-stroke-color']" :stroke-width="layer.paint['circle-stroke-width']" :fill="layer.paint['circle-color']" :fill-opacity="layer.paint['circle-opacity']" />
                <rect v-if="layer.type === 'fill'" width="24" height="24" :stroke="layer.paint['fill-outline-color']" stroke-width="2" :fill="layer.paint['fill-color']" :fill-opacity="layer.paint['fill-opacity']" />
              </svg>
              <v-btn icon v-if="layer.type==='raster'" @click="showRasterDialog(layer)"><v-icon>adjust</v-icon></v-btn>
            </v-list-tile-action>
          </v-list-tile>
        </v-list-group>
      </v-list>
    </v-navigation-drawer>
    <v-toolbar app fixed prominent dark color="secondary">
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <img src="/icon.png" height="63" @click.stop="$router.push('/')" style="cursor: pointer" />
      <v-toolbar-title>{{title}}</v-toolbar-title>
    </v-toolbar>
    <v-dialog max-width="500px" v-model="dialogRaster" :fullscreen="$vuetify.breakpoint.xsOnly" lazy hide-overlay>
      <v-card color="blue-grey lighten-4">
        <v-toolbar card dark color="accent">
          <v-toolbar-title>Adjust Raster</v-toolbar-title>
          <v-spacer/>
          <v-btn dark flat icon @click.native="dialogRaster = false">
            <v-icon>close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text light>
          <v-slider light label="Opacity" color="accent" max="100" min="0" step="5" v-model="opacity" ticks thumb-label></v-slider>
          <v-slider light label="Contrast" color="accent" max="100" min="-100" step="10" v-model="contrast" ticks thumb-label></v-slider>
          <v-slider light label="Saturation" color="accent" max="100" min="-100" step="10" v-model="saturation" ticks thumb-label></v-slider>
        </v-card-text>
      </v-card>
    </v-dialog>
    <nuxt-child/>
  </v-app>
</template>
<script>
import { mapGetters } from 'vuex'
import Measure from '~/components/Measure'
import Totals from '~/components/Totals'
import Information from '~/components/Information'
export default {
  // middleware: 'authenticated',
  head () {
    return {
      title: this.title
    }
  },
  data () {
    return {
      opacityLocal: 0,
      contrastLocal: 0,
      saturationLocal: 0,
      tools: [
        { name: 'Information', active: true, component: Information },
        { name: 'Mål afstand', active: false, component: Measure },
        { name: 'Objektberegning', active: false, component: Totals }
      ],
      map: null,
      projects: true,
      dialogRaster: false,
      currentLayer: null
    }
  },
  methods: {
    hide (item) {
      let group = { ...item }
      group.visible = !group.visible
      group.collapse = group.visible ? group.collapse : false
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
    },
    zoom (group) {
      this.$emit('zoom', group.bounds)
    },
    collapse (value, item) {
      let group = { ...item }
      group.collapse = value
      this.$store.commit('layers/editGroup', group)
    },
    showRasterDialog (layer) {
      this.currentLayer = layer
      const value = this.map.getPaintProperty(this.currentLayer.id, 'raster-opacity')
      this.opacityLocal = value ? value * 100 : 100
      const valueContrast = this.map.getPaintProperty(this.currentLayer.id, 'raster-contrast')
      this.contrastLocal = valueContrast ? valueContrast * 100 : 0
      const valueSaturation = this.map.getPaintProperty(this.currentLayer.id, 'raster-saturation')
      this.saturationLocal = valueSaturation ? valueSaturation * 100 : 0
      this.dialogRaster = true
    }
  },
  computed: {
    opacity: {
      get () {
        return this.opacityLocal
      },
      set (value) {
        this.opacityLocal = value
        this.map.setPaintProperty(this.currentLayer.id, 'raster-opacity', value / 100)
      }
    },
    contrast: {
      get () {
        return this.contrastLocal
      },
      set (value) {
        this.contrastLocal = value
        this.map.setPaintProperty(this.currentLayer.id, 'raster-contrast', value / 100)
      }
    },
    saturation: {
      get () {
        return this.saturationLocal
      },
      set (value) {
        this.saturationLocal = value
        this.map.setPaintProperty(this.currentLayer.id, 'raster-saturation', value / 100)
      }
    },
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
    toggleProjects: {
      get () {
        return this.projects
      },
      set (value) {
        this.projects = value
        this.groups.forEach(group => {
          this.hide(group)
        })
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
<style lang="stylus">
.group {
  .list__tile:after, .list--group:after {
    content: none !important;
  }
}
</style>
