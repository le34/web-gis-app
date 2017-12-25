<template>
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
</template>
<script>
import {v4} from 'uuid'
import { mapGetters } from 'vuex'
require('mapbox-gl/dist/mapbox-gl.css')
let map
let keys = []

const createDataLayers = function (data) {
  const group = { ...data, visible: true }
  group.collapse = true
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
      map.fitBounds(group.bounds)
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

      map.addSource(group.id, options)
      map.fitBounds(tileJson.bounds)
      if (tileJson.format === 'pbf') {
        const promises = []
        tileJson.vector_layers.forEach(data => {
          const layerid = data.id.split('#')
          if (layerid.length > 1) {
            const kode = layerid[0]
            // const name = data.id.substr(kode.length + 1)
            if (!this.codeTables.hasOwnProperty(kode)) {
              promises.push(this.$axios.$get('/style/' + kode))
              this.$store.commit('code-tables/add', { [kode]: {} })
            }
          }
        })
        Promise.all(promises).then(items => {
          items.forEach(item => {
            this.$store.commit('code-tables/add', { [item.id]: item.layers })
          })
          tileJson.vector_layers.forEach(data => {
            const layerid = data.id.split('#')
            if (layerid.length > 1) {
              const kode = layerid[0]
              const name = data.id.substr(kode.length + 1)
              const kodetabel = this.getCode(kode)
              if (kodetabel.hasOwnProperty(name)) {
                let layer = JSON.parse(JSON.stringify(kodetabel[name]))
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
                layer.metadata = { name: layer.name || name }
                layer.source = group.id
                layer['source-layer'] = data.id
                map.addLayer(layer)
                this.$store.dispatch('layers/add', {
                  group,
                  layer: {
                    id: layer.id,
                    name: layer.name || name,
                    feature: data.id,
                    visible: true,
                    type: layer.type,
                    paint: layer.paint
                  }
                })
                keys.push(layer.id)
              }
            }
          })
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
      }
    })
  }
}

export default {
  data () {
    let layersOpt = []

    return {
      message: null,
      snackbar: false,
      layersOpt
    }
  },
  fetch ({ store }) {
    return store.commit('title', 'Map')
  },
  methods: {
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
    ...mapGetters('code-tables', {
      codeTables: 'list'
    }),
    ...mapGetters('code-tables', {
      getCode: 'get'
    }),
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
        id: this.$route.params.dataId,
        $select: [
          'id',
          'projectId',
          'name',
          'meta',
          'style',
          'createdAt',
          'progress'
        ]
      }
    }).then(data => {
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
          data.forEach(item => {
            createDataLayers.call(this, item)
          })
        })
      })
    }).catch(err => {
      console.log(err)
    })
  }
}
</script>
<style scoped lang="stylus">
/*
#map {
  height: calc(100vh - 64px);
  width: 100%;
}
*/
.map-card {
  display: flex;
  flex-direction: column;
  flex: 1 0 100%;

  .card__text {
    flex: 1 1 100%;
  }
}
</style>
