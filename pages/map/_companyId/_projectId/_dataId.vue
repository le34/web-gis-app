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
          <v-data-table v-bind:headers="headers" :items="items" hide-actions class="elevation-1">
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
import { mapGetters } from 'vuex'
require('mapbox-gl/dist/mapbox-gl.css')
let map
let keys = []
let codeTables = {}

const createDataLayers = function (data) {
  const group = { ...data, visible: true }
  this.$axios.$get('/tiles/' + group.id).then(tileJson => {
    const options = {
      type: 'vector',
      tiles: [
        window.location.protocol +
          '//' +
          window.location.host +
          '/api/tiles/' +
          group.id +
          '/{z}/{x}/{y}.pbf'
      ],
      maxzoom: tileJson.maxzoom,
      minzoom: tileJson.minzoom,
      bounds: tileJson.bounds
    }
    map.addSource(group.id, options)
    map.fitBounds(tileJson.bounds)
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
    Promise.all(promises)
      .then(items => {
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
              layer.id = data.id
              layer.source = group.id
              layer['source-layer'] = data.id
              map.addLayer(layer)
              this.$store.dispatch('layers/add', {
                group,
                layer: {
                  id: data.id,
                  name: layer.name || name,
                  visible: true,
                  type: layer.type,
                  paint: layer.paint
                }
              })
              keys.push(data.id)
            }
          }
        })
      })
      .catch(err => console.log(err))
  })
}

export default {
  data () {
    let layersOpt = []

    return {
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
    setStyle (name, dark) {
      const oldStyle = map.getStyle()
      this.$axios.$get(name).then(style => {
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
            style.layers.push(layer)
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
        group.layers.forEach(item => {
          map.setLayoutProperty(
            item.id,
            'visibility',
            item.visible ? 'visible' : 'none'
          )
        })
      })
    }
  },
  mounted () {
    this.$store.commit('layers/list', [])
    this.$store.dispatch('data/find', {
      query: {
        id: this.$route.params.dataId,
        $select: ['id', 'name', 'createdAt']
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

        const nav = new mapboxgl.NavigationControl()
        map.addControl(nav, 'top-left')
        map.addControl(new mapboxgl.GeolocateControl(), 'top-left')
        map.on('mousemove', e => {
          const width = 10
          const height = 10
          var features = map.queryRenderedFeatures([
            [e.point.x - width / 2, e.point.y - height / 2],
            [e.point.x + width / 2, e.point.y + height / 2]
          ], {
            layers: keys
          })
          map.getCanvas().style.cursor = features.length ? 'pointer' : ''
        })
        map.on('click', e => {
          const width = 10
          const height = 10
          e.originalEvent.stopPropagation()
          this.pagination = 0
          this.features = 0
          let temp = map.queryRenderedFeatures([
            [e.point.x - width / 2, e.point.y - height / 2],
            [e.point.x + width / 2, e.point.y + height / 2]
          ], {
            layers: keys
          })
          console.log(temp)
          if (temp.length > 0) {
            this.dialog = true
            this.features = temp
            this.pagination = 1
          }
        })
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
