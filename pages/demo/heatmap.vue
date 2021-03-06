<template>
  <v-content>
    <div id='map'></div>
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
require('mapbox-gl/dist/mapbox-gl.css')
let map
export default {
  data () {
    return {
      features: [],
      pagination: 0,
      dialog: false,
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
  },
  watch: {
  },
  computed: {
    feature () {
      if (this.pagination !== undefined && this.features.length > 0) {
        return this.features[this.pagination - 1]
      }
    },
    items () {
      let items = []
      if (this.feature) {
        Object.keys(this.feature.properties).forEach(key => {
          items.push({ name: key, value: this.feature.properties[key] })
        })
      }
      return items
    }
  },
  mounted () {
    const mapboxgl = require('mapbox-gl/dist/mapbox-gl')
    mapboxgl.accessToken =
      'pk.eyJ1IjoicnVuZXR2aWx1bSIsImEiOiJkeUg2WVkwIn0.yoMmv3etOc40RXkPsebXSg'
    map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/dark-v9',
      center: new mapboxgl.LngLat(12, 56),
      zoom: 6
    })
    map.on('mousemove', e => {
      const width = 10
      const height = 10
      var features = map.queryRenderedFeatures([
        [e.point.x - width / 2, e.point.y - height / 2],
        [e.point.x + width / 2, e.point.y + height / 2]
      ], {
        layers: ['heatmap']
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
        layers: ['heatmap']
      })
      console.log(temp)
      if (temp.length > 0) {
        this.dialog = true
        this.features = temp
        this.pagination = 1
      }
    })
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
      var layerDefs = [[0, 'green'], [20, 'orange'], [100, 'red']]

      layerDefs.forEach(function (layer, i) {
        console.log('cluste', i)
        map.addLayer({
          id: 'cluster-' + i,
          type: 'circle',
          source: 'postit',
          paint: {
            'circle-color': layer[1],
            'circle-radius': 50,
            'circle-blur': 1 // blur the circles to get a heatmap look
          },
          filter:
            i === layerDefs.length - 1
              ? ['>=', 'point_count', layer[0]]
              : [
                'all',
                ['>=', 'point_count', layer[0]],
                ['<', 'point_count', layerDefs[i + 1][0]]
              ]
        })
      })
      map.addLayer({
        id: 'heatmap',
        type: 'circle',
        source: 'postit',
        paint: {
          'circle-color': 'rgba(0,255,0,0.5)',
          'circle-radius': 20,
          'circle-blur': 1
        },
        filter: ['!=', 'cluster', true]
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
