<template>
  <v-app>
    <v-navigation-drawer persistent dark enable-resize-watcher height="100%" v-model="drawer" :mini-variant.sync="mini">
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
        <v-list-tile nuxt to="admin">
          <v-list-tile-action>
            <v-icon dark>settings</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Administration</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>                   
      </v-list>
    </v-navigation-drawer>
    <v-toolbar fixed dark class="primary">
      <v-toolbar-side-icon @click.stop="drawer = !drawer" />
      <v-toolbar-title @click.stop="home()">LE34 - Heatmap</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items class="hidden-sm-and-down">
        <v-btn flat nuxt to="/heatmap">Heatmap</v-btn>
        <v-btn flat nuxt to="/hexbins">Hexbins</v-btn>
      </v-toolbar-items>
    </v-toolbar>
    <main style="width: 100%; height: 100%">
      <div id='map'></div>
    </main>
    <v-dialog width="90%" v-model="popup.show" class="map-modal">
      <v-card class="map-card">
        <v-card-title>
          <div class="headline">{{popup.title}}</div>
        </v-card-title>
        <v-card-text class="fill">
          <v-data-table
            v-bind:headers="headers"
            :items="items"
            hide-actions
            class="elevation-1"
          >
            <template slot="items" scope="props">
              <td>{{ props.item.name }}</td>
              <td class="text-xs-right">{{ props.item.value }}</td>              
            </template>
          </v-data-table>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat dark primary @click.stop="popup.show =! popup.show">
            Luk
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>
<script>
let map
export default {
  data () {
    return {
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
      ]
    }
  },
  methods: {
    home: function () {
      console.log(map.getBearing())
      console.log(map.getCenter())
      console.log(map.getPitch())
      console.log(map.getZoom())
      this.$router.push('/')
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
  computed: {
    items: function () {
      let items = []
      if (this.feature) {
        Object.keys(this.feature.properties).forEach((key) => {
          items.push({name: key, value: this.feature.properties[key]})
        })
      }
      return items
    }
  },
  mounted () {
    const mapboxgl = require('mapbox-gl/dist/mapbox-gl')
    mapboxgl.accessToken = 'pk.eyJ1IjoicnVuZXR2aWx1bSIsImEiOiJkeUg2WVkwIn0.yoMmv3etOc40RXkPsebXSg'
    map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/dark-v9',
      center: new mapboxgl.LngLat(12, 56),
      zoom: 6
    })
    map.on('mousemove', function (e) {
      var features = map.queryRenderedFeatures(e.point, { layers: ['heatmap'] })
      map.getCanvas().style.cursor = (features.length) ? 'pointer' : ''
    })
    map.on('click', function (e) {
      e.originalEvent.stopPropagation()
      let features = map.queryRenderedFeatures(e.point, { layers: ['heatmap'] })
      if (!features.length) {
        return
      }
      let feature = features[0]
      this.feature = feature
      this.popup.show = true
    }.bind(this))
    map.on('load', function () {
      map.addSource('postit', {
        type: 'geojson',
        // Point to GeoJSON data. This example visualizes all M1.0+ earthquakes
        // from 12/22/15 to 1/21/16 as logged by USGS' Earthquake hazards program.
        data: '/postit.geojson',
        cluster: true,
        clusterMaxZoom: 15, // Max zoom to cluster points on
        clusterRadius: 20 // Use small cluster radius for the heatmap look
      })
      var layerDefs = [
        [0, 'green'],
        [20, 'orange'],
        [100, 'red']
      ]

      layerDefs.forEach(function (layer, i) {
        console.log('cluste', i)
        map.addLayer({
          'id': 'cluster-' + i,
          'type': 'circle',
          'source': 'postit',
          'paint': {
            'circle-color': layer[1],
            'circle-radius': 50,
            'circle-blur': 1 // blur the circles to get a heatmap look
          },
          'filter': i === layerDefs.length - 1 ? ['>=', 'point_count', layer[0]] : ['all', ['>=', 'point_count', layer[0]], ['<', 'point_count', layerDefs[i + 1][0]]]
        })
      })
      map.addLayer({
        'id': 'heatmap',
        'type': 'circle',
        'source': 'postit',
        'paint': {
          'circle-color': 'rgba(0,255,0,0.5)',
          'circle-radius': 20,
          'circle-blur': 1
        },
        'filter': ['!=', 'cluster', true]
      })
    })
  }
}
</script>
<style scoped lang="stylus">
#map
  height: calc(100vh - 64px)
  width: 100%

.map-card
  display: flex
  flex-direction: column
  flex: 1 0 100%
  .card__text
    flex: 1 1 100%

@media only screen and (max-width: 576px)
  .dialog
    margin 0
    width 100% !important
    height 100%
    position: fixed
    overflow-y: auto
    top: 0
    left 0
    &:not(.dialog--fullscreen)
      max-width: 100%
      max-height: 100%
    >
      .card
        min-height 100%
        min-width 100%
        margin 0 !important
        padding 0 !important
</style>
