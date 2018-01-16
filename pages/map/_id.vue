<template>
  <v-app :dark="dark">
    <v-navigation-drawer fixed app v-model="drawer">
      <v-toolbar dense flat class="transparent">
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
      <v-expansion-panel expand focusable>
        <v-expansion-panel-content>
           <div slot="header"><v-icon>build</v-icon><span class="ml-3">Tools</span></div>
           <v-expansion-panel>
            <v-expansion-panel-content v-for="(tool, index) in tools" :key="index" v-model="tool.active">
              <div slot="header">{{tool.name}}</div>
              <component :is="tool.component" :map="map" :active="tool.active"></component>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panel-content>
        <v-expansion-panel-content :value="true">
           <div slot="header" class="pa-0"><v-icon>map</v-icon><span class="ml-3">Basemaps</span></div>
           <v-expansion-panel>
            <v-expansion-panel-content v-for="(basemap, index) in basemaps" :key="index">
              <div slot="header">
                  <v-switch hide-details :inputValue="basemap.active" @click.stop="toggleBasemap(basemap)" :label="basemap.name"></v-switch>
              </div>
              <v-card color="accent" dark >
                <v-card-text class="pa-2">
                  <v-layout align-center>
                    <v-flex>                  
                      <v-list-tile-title>{{basemap.name}}</v-list-tile-title>
                      <v-list-tile-title>{{basemap.updatedAt | date}}</v-list-tile-title>
                      <v-list-tile-title>{{basemap['user.email']}}</v-list-tile-title>
                    </v-flex>
                    <v-btn icon flat @click.stop="zoom(basemap)">
                    <v-icon>zoom_out_map</v-icon>
                    </v-btn>
                  </v-layout>
                </v-card-text>
              </v-card>
              <v-list dense>
                <v-list-tile v-for="item in basemap.style && basemap.style[basemap.isDark ? 'dark' : 'light'] ? basemap.style[basemap.isDark ? 'dark' : 'light'].layers:[]" v-bind:key="item.id">              
                  <v-list-tile-content>
                      <v-switch :inputValue="item.layout && item.layout.visibility ? item.layout.visibility === 'visible' : true" @change="toggleItem(basemap, item)" :label="item.metadata && item.metadata.name ? item.metadata.name : item.id"></v-switch>
                  </v-list-tile-content>
                  <v-list-tile-action class="action">
                    <svg width="24" height="24" v-if="item.type!=='raster'">
                      <line v-if="item.type === 'line'" x1="0" y1="12" x2="24" y2="12" :style="'stroke:' + item.paint['line-color'] + ';stroke-width:' + item.paint['line-width']"></line>
                      <circle v-if="item.type === 'circle'" cx="12" cy="12" r="8" :stroke="item.paint['circle-stroke-color']" :stroke-width="item.paint['circle-stroke-width']" :fill="item.paint['circle-color']" :fill-opacity="item.paint['circle-opacity']" />
                      <rect v-if="item.type === 'fill'" width="24" height="24" :stroke="item.paint['fill-outline-color']" stroke-width="2" :fill="item.paint['fill-color']" :fill-opacity="item.paint['fill-opacity']" />                      
                    </svg>
                    <v-btn icon v-if="item.type==='raster'" @click="showRasterDialog(item)"><v-icon>adjust</v-icon></v-btn>
                  </v-list-tile-action>
                </v-list-tile>
              </v-list>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panel-content>
        <v-expansion-panel-content :value="true">
           <div slot="header" class="pa-0"><v-icon>layers</v-icon><span class="ml-3">Layers</span></div>
           <v-expansion-panel>
            <v-expansion-panel-content v-for="(layer, index) in layers" :key="index">
              <div slot="header">
                  <v-switch hide-details :inputValue="layer.active" @click.stop="toggleLayer(layer)" :label="layer.name"></v-switch>
              </div>
              <v-list dense>
                <v-list-tile v-for="item in layer.style ? layer.style[dark ? 'dark' : 'light'].layers:[]" v-bind:key="item.id">              
                  <v-list-tile-content>
                      <v-switch :inputValue="item.layout && item.layout.visibility ? item.layout.visibility === 'visible' : true" @change="toggleItem(layer, item)" :label="item.metadata && item.metadata.name ? item.metadata.name : item.id"></v-switch>
                  </v-list-tile-content>
                  <v-list-tile-action class="action">
                    <svg width="24" height="24" v-if="item.type!=='raster'">
                      <line v-if="item.type === 'line'" x1="0" y1="12" x2="24" y2="12" :style="'stroke:' + item.paint['line-color'] + ';stroke-width:' + item.paint['line-width']"></line>
                      <circle v-if="item.type === 'circle'" cx="12" cy="12" r="8" :stroke="item.paint['circle-stroke-color']" :stroke-width="item.paint['circle-stroke-width']" :fill="item.paint['circle-color']" :fill-opacity="item.paint['circle-opacity']" />
                      <rect v-if="item.type === 'fill'" width="24" height="24" :stroke="item.paint['fill-outline-color']" stroke-width="2" :fill="item.paint['fill-color']" :fill-opacity="item.paint['fill-opacity']" />                      
                    </svg>
                    <v-btn icon v-if="item.type==='raster'" @click="showRasterDialog(item)"><v-icon>adjust</v-icon></v-btn>
                  </v-list-tile-action>
                </v-list-tile>
              </v-list>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-navigation-drawer>
    <v-toolbar app fixed prominent dark color="secondary">
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <img :src="logo" height="63" @click.stop="$router.push('/')" style="cursor: pointer" />
      <v-toolbar-title>{{title}}</v-toolbar-title>
    </v-toolbar>
    <v-content>
      <v-container fluid fill-height class="pa-0">
        <v-layout>
          <v-flex d-flex>
            <div id="map"></div>
          </v-flex>
        </v-layout>
      </v-container>
      <v-snackbar color="error" v-model="snackbar">
        {{ message }}
        <v-btn dark flat @click.native="snackbar = false">Luk</v-btn>
      </v-snackbar>
      
    </v-content>
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
  </v-app>
</template>
<script>
import { mapGetters, mapMutations, mapActions } from 'vuex'
require('mapbox-gl/dist/mapbox-gl.css')
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
      tools: [],
      map: null,
      projects: true,
      dialogRaster: false,
      currentLayer: null,
      snackbar: false,
      message: null,
      logo: null
    }
  },
  filters: {
    date (value) {
      return (new Date(value)).toLocaleString()
    }
  },
  methods: {
    ...mapMutations('legend', [ 'addLayer', 'clearLayers', 'editLayer' ]),
    ...mapActions('projects', {
      getProjects: 'get'
    }),
    ...mapActions('styles', {
      getStyle: 'get'
    }),
    toggleBasemap (item) {
      if (item.active) {
        const style = item.style[item.isDark ? 'dark' : 'light']
        style.layers.forEach(layer => {
          if (layer.type !== 'background') {
            this.map.setLayoutProperty(layer.id, 'visibility', item.active ? 'none' : 'visible')
          }
        })
        this.editLayer({ ...item, ...{ active: !item.active } })
      } else {
        this.basemaps.forEach(basemap => {
          const active = item.id === basemap.id
          this.editLayer({ ...basemap, ...{ active } })
          if (active) {
            Promise.resolve().then(() => {
              if (basemap.style) {
                return basemap.style
              }
              return this.getStyle(basemap.styleId)
            }).then(style => {
              let _style = JSON.parse(JSON.stringify(style))
              let mapstyle = _style[basemap.isDark ? 'dark' : 'light']
              if (!basemap.style) {
                Object.keys(mapstyle.sources).forEach(key => {
                  let source = mapstyle.sources[key]
                  if (source.type === 'raster') {
                  // Hent højopløsning raster tiles hvis skærm har høj opløsning
                    if (window.devicePixelRatio > 1.5) {
                      source.tileSize = source.tileSize / 2
                    }
                  }
                })
                this.editLayer({ ...basemap, ...{ style: JSON.parse(JSON.stringify(_style)), active } })
              }
              this.layers.forEach(layer => {
                if (layer.style) {
                  let s = layer.style[this.dark ? 'dark' : 'light']
                  mapstyle.sources = {...mapstyle.sources, ...s.sources}
                  s.layers.forEach(layer => {
                    mapstyle.layers.push(layer)
                  })
                }
              })
              this.map.setStyle(mapstyle)
            })
          }
        })
      }
    },
    toggleLayer (layer) {
      let _layer = JSON.parse(JSON.stringify(layer))
      _layer.active = !_layer.active
      let visibility = _layer.active ? 'visible' : 'none'
      Promise.resolve().then(() => {
        if (_layer.style) {
          return _layer.style
        }
        return this.getStyle(_layer.styleId)
      }).then(style => {
        let _style = JSON.parse(JSON.stringify(style))
        if (!layer.style) {
          _layer.style = _style
          _layer.style.light.layers = _layer.style.light.layers.filter(layer => {
            return layer.type !== 'background'
          })
          _layer.style.dark.layers = _layer.style.dark.layers.filter(layer => {
            return layer.type !== 'background'
          })
          Object.keys(_layer.style.light.sources).forEach(key => {
            let source = _layer.style.light.sources[key]
            if (source.type === 'raster') {
              // Hent højopløsning raster tiles hvis skærm har høj opløsning
              if (window.devicePixelRatio > 1.5) {
                source.tileSize = source.tileSize / 2
              }
            }
            if (!this.dark) {
              this.map.addSource(key, source)
            }
          })
          Object.keys(_layer.style.dark.sources).forEach(key => {
            let source = _layer.style.dark.sources[key]
            if (source.type === 'raster') {
              // Hent højopløsning raster tiles hvis skærm har høj opløsning
              if (window.devicePixelRatio > 1.5) {
                source.tileSize = source.tileSize / 2
              }
            }
            if (this.dark) {
              this.map.addSource(key, source)
            }
          })
          _layer.style[this.dark ? 'dark' : 'light'].layers.forEach(l => {
            this.map.addLayer(l)
          })
        } else {
          _layer.style.dark.layers.forEach(l => {
            l.layout = { ...l.layout, ...{ visibility } }
          })
          _layer.style.light.layers.forEach(l => {
            l.layout = { ...l.layout, ...{ visibility } }
          })
          _layer.style[this.dark ? 'dark' : 'light'].layers.forEach(l => {
            this.map.setLayoutProperty(l.id, 'visibility', visibility)
          })
        }
        this.editLayer(_layer)
      })
    },
    toggleItem (layer, item) {
      let visibility = item.layout && item.layout.visibility ? item.layout.visibility === 'visible' ? 'none' : 'visible' : 'none'
      this.map.setLayoutProperty(item.id, 'visibility', visibility)
      let _layer = JSON.parse(JSON.stringify(layer))
      if (!_layer.isBasemap || (_layer.isBasemap && _layer.isDark)) {
        _layer.style.dark.layers.forEach(l => {
          if (l.id === item.id) {
            l.layout = { ...l.layout, ...{ visibility } }
          }
        })
      }
      if (!_layer.isBasemap || (_layer.isBasemap && !_layer.isDark)) {
        _layer.style.light.layers.forEach(l => {
          if (l.id === item.id) {
            l.layout = { ...l.layout, ...{ visibility } }
          }
        })
      }
      this.editLayer(_layer)
    },
    zoom (layer) {
      let style = layer.style.isBasemap ? layer.style[layer.isDark ? 'dark' : 'light'] : layer.style[this.dark ? 'dark' : 'light']
      Object.keys(style.sources).forEach(key => {
        const source = style.sources[key]
        console.log(source)
        let { center, zoom } = source
        console.log(center, zoom)
        this.map.easeTo({center, zoom})
      })
    },
    collapse (value, item) {
      let layer = { ...item }
      layer.collapse = value
      this.editLayer(layer)
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
    },
    transformRequest (url, resourceType) {
      if (url.substr(0, 7) === 'le34://') {
        url = process.env.FEATHERS + url.substring(6, url.length)
        return { url: url, headers: { Authorization: this.$store.state.auth.accessToken } }
      } else if (url.substr(0, 8) === 'local://') {
        url = window.location.origin + url.substring(7, url.length)
        return {url}
      }
    }
  },
  computed: {
    ...mapGetters('legend', {
      basemaps: 'basemaps',
      layers: 'layers',
      activeBasemap: 'activeBasemap'
    }),
    ...mapGetters('projects-tools', {
      findProjectsTools: 'find'
    }),
    ...mapGetters('projects', {
      getProject: 'get'
    }),
    project () {
      return this.getProject(this.$route.params.id)
    },
    title () {
      return this.project ? this.project.name : ''
    },
    dark () {
      return this.activeBasemap ? this.activeBasemap.isDark : true
    },
    drawer: {
      get () {
        return this.$store.state.drawer
      },
      set (value) {
        this.$store.commit('drawer', value)
      }
    },
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
    }
  },
  mounted () {
    this.clearLayers()
    const mapboxgl = require('mapbox-gl/dist/mapbox-gl')
    mapboxgl.accessToken = 'pk.eyJ1IjoicnVuZXR2aWx1bSIsImEiOiJkeUg2WVkwIn0.yoMmv3etOc40RXkPsebXSg'

    this.getProjects(this.$route.params.id).then(project => {
      this.$store.dispatch('logos/get', project.companyId).then(logo => {
        this.logo = logo.data
      })
      return this.$store.dispatch('projects-tools/find', {
        query: {
          projectId: this.$route.params.id,
          $sort: {
            priority: 1
          }
        }
      })
    }).then(tools => {
      tools.forEach(tool => {
        const component = require(`~/components/${tool['tool.name']}`)
        this.tools.push({ name: tool.name, active: tool.active, component: component.default })
      })
      return this.$store.dispatch('layers/find', {
        query: {
          projectId: this.$route.params.id,
          $sort: {
            priority: 1
          }
        }
      })
    }).then(layers => {
      layers.forEach(layer => {
        let _layer = JSON.parse(JSON.stringify(layer))
        this.addLayer(_layer)
      })
      let mapOptions = {
        hash: true,
        container: 'map',
        transformRequest: this.transformRequest.bind(this)
      }
      this.map = new mapboxgl.Map(mapOptions)
      this.map.controls = {
        nav: new mapboxgl.NavigationControl(),
        geolocate: new mapboxgl.GeolocateControl()
      }
      this.map.on('load', e => {
        console.log('load', e)

        /*
        this.layers.forEach(layer => {
          if (!layer.isBasemap && layer.active) {
            let style = JSON.parse(JSON.stringify(layer.style[this.activeBasemap && this.activeBasemap.isDark ? 'dark' : 'light']))
            mapOptions.style.sources = {...mapOptions.style.sources, ...style.sources}
            style.layers.forEach(layer => {
              if (layer.type !== 'background') {
                mapOptions.style.layers.push(layer)
              }
            })
          }
        })
        */
      })
      this.map.addControl(this.map.controls.nav, 'top-left')
      this.map.addControl(this.map.controls.geolocate, 'top-left')
      if (this.activeBasemap) {
        this.getStyle(this.activeBasemap.styleId).then(style => {
          let layer = JSON.parse(JSON.stringify(this.activeBasemap))
          layer.style = JSON.parse(JSON.stringify(style))
          this.editLayer(layer)
          this.map.setStyle(layer.style[layer.isDark ? 'dark' : 'light'])
          this.layers.forEach(layer => {
            if (layer.active) {
              let _layer = JSON.parse(JSON.stringify(layer))
              this.getStyle(layer.styleId).then(style => {
                _layer.style = JSON.parse(JSON.stringify(style))
                _layer.style.dark.layers = _layer.style.dark.layers.filter(layer => {
                  return layer.type !== 'background'
                })
                _layer.style.light.layers = _layer.style.light.layers.filter(layer => {
                  return layer.type !== 'background'
                })
                this.editLayer(_layer)
                let _style = _layer.style[this.dark ? 'dark' : 'light']
                Object.keys(_style.sources).forEach(key => {
                  this.map.addSource(key, _style.sources[key])
                })
                _style.layers.forEach(layer => {
                  this.map.addLayer(layer)
                })
              })
            }
          })
        })
      }
    }).catch(err => {
      console.log(err)
    })
  }
}
</script>
<style lang="stylus">
.group {
  .list__tile:after, .list--group:after {
    content: none !important;
  }
}
.action
  min-width: 24px
.select
  cursor: pointer
</style>
