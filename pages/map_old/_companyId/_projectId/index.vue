<template>
  <v-content>
    <div id="map"></div>
    <v-snackbar color="error" v-model="snackbar">
      {{ message }}
      <v-btn dark flat @click.native="snackbar = false">Luk</v-btn>
    </v-snackbar>
    <v-dialog max-width="500px" scrollable v-model="dialog" :fullscreen="$vuetify.breakpoint.xsOnly" lazy>
      <v-card>
        <v-toolbar card>
          <v-toolbar-title>{{feature ? feature.name : ''}}</v-toolbar-title>
          <v-spacer/>
          <v-btn flat icon @click.native="dialog = false"><v-icon>close</v-icon></v-btn>
        </v-toolbar>
        <v-card-text class="pa-0" style="height: 300px;">
          <v-data-table  v-bind:headers="headers" :items="items" hide-actions class="elevation-1">
            <template slot="items" scope="props">
              <td>{{ props.item.name }}</td>
              <td>{{ props.item.name==='feature' && feature.name? feature.name : props.item.value }}</td>
            </template>
          </v-data-table>
        </v-card-text>
        <v-card-actions>
          <v-layout>
            <v-flex>
              <div class="text-xs-center pt-2">
                <v-pagination v-model="pagination" :length="features.length"></v-pagination>
              </div>
            </v-flex>
          </v-layout>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-content>
</template>
<script>
import {v4} from 'uuid'
import { mapGetters } from 'vuex'
require('mapbox-gl/dist/mapbox-gl.css')
let map
let keys = []
let codeTables = {}

export default {
  data () {
    let layersOpt = []

    return {
      queue: [],
      bounds: null,
      message: null,
      snackbar: false,
      features: [],
      pagination: 0,
      dialog: false,
      headers: [
        {
          text: 'Name',
          align: 'left',
          sortable: true,
          value: 'name'
        },
        {
          text: 'Value',
          align: 'left',
          sortable: false,
          value: 'value'
        }
      ],
      layersOpt
    }
  },
  fetch ({ store }) {
    return store.commit('title', 'Map')
  },
  methods: {
    createDataLayers () {
      if (this.queue.length > 0) {
        const data = this.queue.pop()
        let group = { ...data, visible: true }
        if (data.style) {
          Promise.resolve().then(() => {
            const id = Object.keys(data.style.sources)[0]
            const source = data.style.sources[id]
            map.addSource(id, source)
            if (source.bounds) {
              return source.bounds
            } else if (source.type === 'geojson') {
              return this.$store.dispatch('extent/get', data.id).then(extent => {
                return [extent.geometry.coordinates[0][0][0], extent.geometry.coordinates[0][0][1], extent.geometry.coordinates[0][2][0], extent.geometry.coordinates[0][2][1]]
              })
            }
          }).then(bounds => {
            group.bounds = bounds
            if (this.bounds === null) {
              this.bounds = bounds
            }
            this.bounds[0] = this.bounds[0] < group.bounds[0] ? this.bounds[0] : group.bounds[0]
            this.bounds[1] = this.bounds[1] < group.bounds[1] ? this.bounds[1] : group.bounds[1]
            this.bounds[2] = this.bounds[2] > group.bounds[2] ? this.bounds[2] : group.bounds[2]
            this.bounds[3] = this.bounds[3] > group.bounds[3] ? this.bounds[3] : group.bounds[3]
            data.style.layers.forEach(item => {
              let layer = JSON.parse(JSON.stringify(item))
              const visible = layer.layout && layer.layout.visibility ? layer.layout.visibility === 'visible' : true
              group.visible = group.visible && visible
              if (layer.type === 'raster') {
                const before = map.getLayer('matrikel_skel')
                if (before) {
                  map.addLayer(layer, before.id)
                } else {
                  map.addLayer(layer)
                }
              } else {
                if (this.dark) {
                  if (layer.paint && layer.paint.hasOwnProperty('line-color') && layer.paint['line-color'] === '#000000') {
                    layer.paint['line-color'] = '#ffffff'
                  } else if (layer.paint && layer.paint.hasOwnProperty('circle-color') && layer.paint['circle-color'] === '#000000') {
                    layer.paint['circle-color'] = '#ffffff'
                  }
                } else {
                  if (layer.paint && layer.paint.hasOwnProperty('line-color') && layer.paint['line-color'] === '#ffffff') {
                    layer.paint['line-color'] = '#000000'
                  } else if (layer.paint && layer.paint.hasOwnProperty('circle-color') && layer.paint['circle-color'] === '#ffffff') {
                    layer.paint['circle-color'] = '#000000'
                  }
                }
                map.addLayer(layer)
                keys.push(layer.id)
              }
              this.$store.dispatch('layers/add', {
                group,
                layer: {
                  id: layer.id,
                  name: layer.metadata && layer.metadata.name ? layer.metadata.name : data.name,
                  visible: visible,
                  type: layer.type,
                  paint: layer.paint
                }
              })
            })
            this.createDataLayers()
          })
        } else {
          this.$axios.$get('/tiles/' + group.id).then(tileJson => {
            const options = {
              type: tileJson.format === 'pbf' ? 'vector' : 'raster',
              tiles: tileJson.tiles,
              maxzoom: tileJson.maxzoom,
              minzoom: tileJson.minzoom,
              bounds: tileJson.bounds
            }
            group.bounds = [...tileJson.bounds]
            if (this.bounds === null) {
              this.bounds = tileJson.bounds
            }
            this.bounds[0] = this.bounds[0] < tileJson.bounds[0] ? this.bounds[0] : tileJson.bounds[0]
            this.bounds[1] = this.bounds[1] < tileJson.bounds[1] ? this.bounds[1] : tileJson.bounds[1]
            this.bounds[2] = this.bounds[2] > tileJson.bounds[2] ? this.bounds[2] : tileJson.bounds[2]
            this.bounds[3] = this.bounds[3] > tileJson.bounds[3] ? this.bounds[3] : tileJson.bounds[3]
            map.addSource(group.id, options)
            if (tileJson.format === 'pbf') {
              const promises = []
              tileJson.vector_layers.forEach(data => {
                const layerid = data.id.split('#')
                if (layerid.length > 1) {
                  const kode = layerid[0]
                  // const name = data.id.substr(kode.length + 1)
                  if (!codeTables.hasOwnProperty(kode)) {
                    promises.push(this.$axios.$get('/style/' + kode))
                    codeTables[kode] = {}
                  }
                }
              })
              Promise.all(promises).then(items => {
                items.forEach(item => {
                  codeTables[item.id] = item.layers
                })
                tileJson.vector_layers.forEach(data => {
                  const layerid = data.id.split('#')
                  if (layerid.length > 1) {
                    const kode = layerid[0]
                    const name = data.id.substr(kode.length + 1)
                    const kodetabel = codeTables[kode]
                    if (kodetabel.hasOwnProperty(name)) {
                      let layer = kodetabel[name]
                      if (this.dark) {
                        if (
                          layer.paint.hasOwnProperty('line-color') &&
                  layer.paint['line-color'] === '#000000'
                        ) {
                          layer.paint['line-color'] = '#ffffff'
                        } else if (
                          layer.paint.hasOwnProperty('circle-color') &&
                  layer.paint['circle-color'] === '#000000'
                        ) {
                          layer.paint['circle-color'] = '#ffffff'
                        }
                      } else {
                        if (
                          layer.paint.hasOwnProperty('line-color') &&
                  layer.paint['line-color'] === '#ffffff'
                        ) {
                          layer.paint['line-color'] = '#000000'
                        } else if (
                          layer.paint.hasOwnProperty('circle-color') &&
                  layer.paint['circle-color'] === '#ffffff'
                        ) {
                          layer.paint['circle-color'] = '#000000'
                        }
                      }
                      layer.id = v4()
                      layer.source = group.id
                      layer['source-layer'] = data.id
                      map.addLayer(layer)
                      this.$store.dispatch('layers/add', {
                        group,
                        layer: {
                          id: layer.id,
                          name: layer.name || name,
                          visible: true,
                          type: layer.type,
                          paint: layer.paint
                        }
                      })
                      keys.push(layer.id)
                    }
                  }
                })
                this.createDataLayers()
              }).catch(err => console.log(err))
            } else {
              map.addLayer({
                id: group.id,
                type: 'raster',
                source: group.id
              }, 'matrikel_skel')
              this.$store.dispatch('layers/add', {
                group,
                layer: {
                  id: group.id,
                  name: data.name,
                  visible: true,
                  type: 'raster'
                }
              })
              this.createDataLayers()
            }
          })
        }
      } else {
        map.fitBounds(this.bounds)
      }
    },
    setStyle (name, dark) {
      const oldStyle = map.getStyle()
      this.$axios.$get(name).then(style => {
        let indexOfMatrikel = style.layers.findIndex(item => {
          return item.id === 'matrikel_skel'
        })
        oldStyle.layers.forEach(layer => {
          if (layer.id !== 'background' && layer.id !== 'wmts' && layer.id !== 'wms' && layer.id !== 'building' && layer.source !== 'composite' && !style.sources.hasOwnProperty(layer.source)) {
            if (layer.hasOwnProperty('paint')) {
              if (dark) {
                if (
                  layer.paint.hasOwnProperty('line-color') &&
                    layer.paint['line-color'] === '#000000'
                ) {
                  layer.paint['line-color'] = '#ffffff'
                } else if (
                  layer.paint.hasOwnProperty('circle-color') &&
                    layer.paint['circle-color'] === '#000000'
                ) {
                  layer.paint['circle-color'] = '#ffffff'
                }
              } else {
                if (
                  layer.paint.hasOwnProperty('line-color') &&
                    layer.paint['line-color'] === '#ffffff'
                ) {
                  layer.paint['line-color'] = '#000000'
                } else if (
                  layer.paint.hasOwnProperty('circle-color') &&
                    layer.paint['circle-color'] === '#ffffff'
                ) {
                  layer.paint['circle-color'] = '#000000'
                }
              }
            }
            if (indexOfMatrikel !== -1 && layer.type === 'raster') {
              style.layers.splice(indexOfMatrikel, 0, layer)
              indexOfMatrikel++
            } else {
              style.layers.push(layer)
            }
          }
        })
        Object.keys(oldStyle.sources).forEach(key => {
          if (key !== 'wmts' && key !== 'wms' && key !== 'bygning' && key !== 'composite' && !style.sources.hasOwnProperty(key)) {
            style.sources[key] = oldStyle.sources[key]
          }
        })
        style.layers.forEach(item => {
          if (item.id.indexOf('matrikel_') !== -1) {
            item.layout.visibility = this.matrikel ? 'visible' : 'none'
          }
        })
        map.setStyle(style)
      })
    },
    home: function () {
      console.log(map.getBearing())
      console.log(map.getCenter())
      console.log(map.getPitch())
      console.log(map.getZoom())
      this.$router.push('/')
    },
    print: function (event) {
      console.log('print')
      const lnglat = map.getCenter()
      const canvas = map.getCanvas()
      this.$axios
        .$post(
          '/pdf',
          {
            style: map.getStyle(),
            options: {
              zoom: map.getZoom(),
              center: [lnglat.lng, lnglat.lat],
              bearing: map.getBearing(),
              pitch: map.getPitch(),
              width: canvas.clientWidth,
              height: canvas.clientHeight
            },
            ratio: event
          },
          {
            responseType: 'blob'
          }
        )
        .then(function (response) {
          console.log(response)
          window.open(URL.createObjectURL(response.data))
        })
        .catch(err => {
          console.log(err)
        })
    },
    showBuildings (data) {
      map.setLayoutProperty(
        '3d-buildings',
        'visibility',
        data ? 'visible' : 'none'
      )
    },
    showMatrikel (data) {
      map.setLayoutProperty(
        'matrikel_skel',
        'visibility',
        data ? 'visible' : 'none'
      )
      map.setLayoutProperty(
        'matrikel_skelpunkt',
        'visibility',
        data ? 'visible' : 'none'
      )
      map.setLayoutProperty(
        'matrikel_centroide',
        'visibility',
        data ? 'visible' : 'none'
      )
      map.setLayoutProperty(
        'matrikel_optagetvej',
        'visibility',
        data ? 'visible' : 'none'
      )
      map.setLayoutProperty(
        'matrikel_optagetvejbredde',
        'visibility',
        data ? 'visible' : 'none'
      )
    }
  },
  computed: {
    ...mapGetters('layers', {
      layers: 'list'
    }),
    feature () {
      if (this.pagination !== undefined && this.features.length > 0) {
        let item = this.features[this.pagination - 1]
        const group = this.layers.find(group => {
          return group.id === item.layer.source
        })
        if (group !== undefined) {
          const layer = group.layers.find(layer => {
            return layer.id === item.layer.id
          })
          if (layer !== undefined) {
            item.name = layer.name
          }
        }
        return item
      }
    },
    items: function () {
      let items = []
      if (this.feature) {
        Object.keys(this.feature.properties).forEach(key => {
          items.push({ name: key, value: this.feature.properties[key] })
        })
      }
      return items
    },
    drawer () {
      return this.$store.state.drawer
    },
    dark () {
      return this.$store.state.dark
    },
    buildings () {
      return this.$store.state.layers.buildings
    },
    matrikel () {
      return this.$store.state.layers.matrikel
    },
    toggleLight () {
      return this.$store.state.layers.light
    },
    toggleDark () {
      return this.$store.state.layers.dark
    },
    toggleSatellite () {
      return this.$store.state.layers.satellite
    }
  },
  watch: {
    dark (data) {

    },
    toggleLight (data) {
      if (data) {
        this.setStyle('/styles/light-v9', false)
      }
    },
    toggleDark (data) {
      if (data) {
        this.setStyle('/styles/dark-v9', true)
      }
    },
    toggleSatellite (data) {
      if (data) {
        this.setStyle('/styles/satellite', true)
      }
    },
    buildings (data) {
      this.showBuildings(data)
    },
    matrikel (data) {
      this.showMatrikel(data)
    },
    drawer (data) {
      if (map) {
        setTimeout(function () {
          map.resize()
        }, 500)
      }
    },
    layers (data) {
      data.forEach(group => {
        group.groups.forEach(subgroup => {
          subgroup.layers.forEach(item => {
            map.setLayoutProperty(
              item.id,
              'visibility',
              subgroup.visible ? 'visible' : 'none'
            )
          })
        })
      })
    }
  },
  mounted () {
    this.$parent.$parent.$on('zoom', bounds => {
      map.fitBounds(bounds)
    })
    this.$store.commit('layers/list', [])
    this.$store.dispatch('data/find', {
      query: {
        projectId: this.$route.params.projectId,
        $sort: {
          priority: 1
        }
      }
    }).then(data => {
      this.queue = data
      const mapboxgl = require('mapbox-gl/dist/mapbox-gl')
      mapboxgl.accessToken = 'pk.eyJ1IjoicnVuZXR2aWx1bSIsImEiOiJkeUg2WVkwIn0.yoMmv3etOc40RXkPsebXSg'
      let stylename = '/styles/dark-v9'
      if (this.toggleLight) {
        stylename = '/styles/light-v9'
      } else if (this.toggleSatellite) {
        stylename = '/styles/satellite'
      }
      this.$axios.$get(stylename).then(style => {
        keys = []
        map = new mapboxgl.Map({
          container: 'map',
          style: style,
          center: new mapboxgl.LngLat(12, 56),
          zoom: 7
        })
        map.controls = {}
        this.$parent.$parent.map = map
        map.controls.navigation = new mapboxgl.NavigationControl()
        map.addControl(map.controls.navigation, 'top-left')
        map.controls.geolocate = new mapboxgl.GeolocateControl()
        map.addControl(map.controls.geolocate, 'top-left')
        map.on('load', () => {
          console.log('map load')
          this.showMatrikel(this.matrikel)
          this.showBuildings(this.buildings)
          this.createDataLayers()
        })
      })
    }).catch(err => {
      console.log(err)
    })
  }
}
</script>
<style scoped lang="stylus">
#map {
  height: calc(100vh - 64px);
  width: 100%;
}

.map-card {
  display: flex;
  flex-direction: column;
  flex: 1 0 100%;

  .card__text {
    flex: 1 1 100%;
  }
}
</style>
