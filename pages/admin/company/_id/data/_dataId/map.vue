<template>
  <v-content>
    <v-toolbar app fixed prominent dark clipped-right color="secondary">
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <img src="/icon.png" height="63" @click="$router.push('/')" style="cursor: pointer"/>
      <v-toolbar-title>{{title}}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-side-icon @click.stop="drawerRight = !drawerRight"></v-toolbar-side-icon>
    </v-toolbar>
    <div id="map"></div>
    <v-snackbar color="error" v-model="snackbar">
      {{ message }}
      <v-btn dark flat @click.native="snackbar = false">Luk</v-btn>
    </v-snackbar>
  </v-content>
</template>
<script>
require('mapbox-gl/dist/mapbox-gl.css')
let map
let keys = []
export default {
  data () {
    let layers = []
    let layersOpt = []

    return {
      message: null,
      snackbar: false,
      title: 'Map',
      drawerRight: true,
      show3dBuildings: false,
      showHeatmap: false,
      showMatrikel: false,
      showHexbins: false,
      mini: false,
      drawer: false,
      popup: {
        show: false,
        title: '',
        properties: {}
      },
      feature: null,
      headers: [
        {
          text: 'Navn',
          align: 'left',
          sortable: true,
          value: 'name'
        },
        {
          text: 'Værdi',
          sortable: false,
          value: 'value'
        }
      ],
      layers,
      layersOpt
    }
  },
  fetch ({ store }) {},
  methods: {
    home: function () {
      console.log(map.getBearing())
      console.log(map.getCenter())
      console.log(map.getPitch())
      console.log(map.getZoom())
      this.$router.push('/')
    },
    toggleMatrikel: function () {
      map.setLayoutProperty(
        'matrikel_skel',
        'visibility',
        this.showMatrikel ? 'none' : 'visible'
      )
      map.setLayoutProperty(
        'matrikel_skelpunkt',
        'visibility',
        this.showMatrikel ? 'none' : 'visible'
      )
      map.setLayoutProperty(
        'matrikel_centroide',
        'visibility',
        this.showMatrikel ? 'none' : 'visible'
      )
      map.setLayoutProperty(
        'matrikel_optagetvej',
        'visibility',
        this.showMatrikel ? 'none' : 'visible'
      )
      map.setLayoutProperty(
        'matrikel_optagetvejbredde',
        'visibility',
        this.showMatrikel ? 'none' : 'visible'
      )
      this.showMatrikel = !this.showMatrikel
    },
    toggle3dBuildings: function () {
      if (!this.show3dBuildings) {
        map.flyTo({
          center: [12.591562175559488, 55.682075280539635],
          zoom: 15.6543790835138,
          bearing: -0.08659721087042271,
          pitch: 55.49999999999995
        })
      }
      map.setLayoutProperty(
        '3d-buildings',
        'visibility',
        this.show3dBuildings ? 'none' : 'visible'
      )
      this.show3dBuildings = !this.show3dBuildings
    },
    hideLayer: function (item) {
      map.setLayoutProperty(
        item.id,
        'visibility',
        item.visible ? 'none' : 'visible'
      )
      item.visible = !item.visible
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
    }
  },
  computed: {
    items: function () {
      let items = []
      if (this.feature) {
        Object.keys(this.feature.properties).forEach(key => {
          items.push({ name: key, value: this.feature.properties[key] })
        })
      }
      return items
    }
  },
  watch: {
    drawer: function (data) {
      if (map) {
        setTimeout(function () {
          map.resize()
        }, 500)
      }
    },
    mini: function (data) {
      if (map) {
        setTimeout(function () {
          map.resize()
        }, 500)
      }
    }
  },
  mounted () {
    let codeTables = {}
    let layers = this.layers
    const mapboxgl = require('mapbox-gl/dist/mapbox-gl')
    const minimap = require('~/plugins/minimap')
    mapboxgl.accessToken =
      'pk.eyJ1IjoicnVuZXR2aWx1bSIsImEiOiJkeUg2WVkwIn0.yoMmv3etOc40RXkPsebXSg'
    this.$axios
      .$get('/styles/dark-v9')
      .then(style => {
        /*
      Object.keys(style.sources).forEach(key => {
        if (style.sources[key].hasOwnProperty('url')) {
          style.sources[key].url = window.location.protocol + '//' + window.location.host + '/api/tiles/' + key + '.json'
        }
      })
      style.sprite = window.location.protocol + '//' + window.location.host + '/api/styles/light-v9/sprite'
      style.glyphs = window.location.protocol + '//' + window.location.host + '/api/fonts/{fontstack}/{range}.pbf'
      */
        return style
      })
      .then(style => {
        map = new mapboxgl.Map({
          container: 'map',
          style: style,
          center: new mapboxgl.LngLat(12, 56),
          zoom: 7
        })
        const nav = new mapboxgl.NavigationControl()
        map.addControl(nav, 'top-left')
        map.on('mousemove', e => {
          var features = map.queryRenderedFeatures(e.point, { layers: keys })
          map.getCanvas().style.cursor = features.length ? 'pointer' : ''
        })
        map.on('click', e => {
          e.originalEvent.stopPropagation()
          let features = map.queryRenderedFeatures(e.point, { layers: keys })
          if (!features.length) {
            return
          }
          let feature = features[0]
          this.feature = feature
          this.popup.show = true
        })
        map.on('load', () => {
          console.log('map load')
          map.addLayer({
            id: 'ortofoto',
            type: 'raster',
            source: {
              type: 'raster',
              tiles: [
                'https://a.kortforsyningen.kms.dk/orto_foraar_webm?login=qgisdk&password=qgisdk&request=GetTile&version=1.0.0&service=WMTS&Layer=orto_foraar&style=default&format=image/jpeg&TileMatrixSet=GoogleMapsCompatible&TileMatrix={z}&TileRow={y}&TileCol={x}',
                'https://b.kortforsyningen.kms.dk/orto_foraar_webm?login=qgisdk&password=qgisdk&request=GetTile&version=1.0.0&service=WMTS&Layer=orto_foraar&style=default&format=image/jpeg&TileMatrixSet=GoogleMapsCompatible&TileMatrix={z}&TileRow={y}&TileCol={x}',
                'https://c.kortforsyningen.kms.dk/orto_foraar_webm?login=qgisdk&password=qgisdk&request=GetTile&version=1.0.0&service=WMTS&Layer=orto_foraar&style=default&format=image/jpeg&TileMatrixSet=GoogleMapsCompatible&TileMatrix={z}&TileRow={y}&TileCol={x}'
              ],
              tileSize: 256,
              minzoom: 0,
              maxzoom: 20,
              attribution:
                'FOT ortofoto <a href="http://www.kortforsyningen.dk" target="_blank">@ Geodatastyrelsen</a>'
            },
            layout: {
              visibility: 'none'
            },
            minzoom: 0,
            maxzoom: 22
          })
          map.addControl(new minimap.LayerSwitcher(), 'bottom-left')
          let layersA = map.getStyle().layers.reverse()
          var labelLayerIdx = layersA.findIndex(function (layer) {
            return layer.type !== 'symbol'
          })
          var labelLayerId =
            labelLayerIdx !== -1 ? layersA[labelLayerIdx].id : undefined
          let layerA = {
            id: '3d-buildings',
            source: 'composite',
            'source-layer': 'building',
            filter: ['==', 'extrude', 'true'],
            type: 'fill-extrusion',
            minzoom: 15,
            paint: {
              'fill-extrusion-color': '#aaa',
              'fill-extrusion-height': {
                type: 'identity',
                property: 'height'
              },
              'fill-extrusion-base': {
                type: 'identity',
                property: 'min_height'
              },
              'fill-extrusion-opacity': 0.6
            },
            layout: {
              visibility: 'none'
            }
          }
          map.addLayer(layerA, labelLayerId)
          if (this.$route.params.dataId) {
            this.$axios
              .$get('/tiles/' + this.$route.params.dataId)
              .then(tileJson => {
                const options = {
                  type: 'vector',
                  tiles: [
                    window.location.protocol +
                      '//' +
                      window.location.host +
                      '/api/tiles/' +
                      this.$route.params.dataId +
                      '/{z}/{x}/{y}.pbf'
                  ],
                  maxzoom: tileJson.maxzoom,
                  minzoom: tileJson.minzoom,
                  bounds: tileJson.bounds
                }
                map.addSource(this.$route.params.dataId, options)
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
                          layer.id = data.id
                          layer.source = this.$route.params.dataId
                          layer['source-layer'] = data.id
                          map.addLayer(layer)
                          layers.push({
                            id: data.id,
                            name: layer.name || name,
                            visible: true,
                            type: layer.type,
                            paint: layer.paint
                          })
                          keys.push(data.id)
                        }
                      }
                    })
                  })
                  .catch(err => console.log(err))
              })
          }
        })
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

@media only screen and (max-width: 576px) {
  .dialog {
    margin: 0;
    width: 100% !important;
    height: 100%;
    position: fixed;
    overflow-y: auto;
    top: 0;
    left: 0;

    &:not(.dialog--fullscreen) {
      max-width: 100%;
      max-height: 100%;
    }

    > {
      .card {
        min-height: 100%;
        min-width: 100%;
        margin: 0 !important;
        padding: 0 !important;
      }
    }
  }
}
</style>
