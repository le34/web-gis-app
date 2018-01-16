<template>
  <v-card slot="menu" :color="$vuetify.dark?'blue-grey':'blue-grey lighten-4'">
    <v-card-text>
      <p>Mål afstande i kortet ved at tegne en linje.</p>
      <p>Dobbeltklik for at afslutte.</p>
      <p>Flyt hele linjen ved først at klikke på den og derefter klikke og trække i den.</p> 
      <p>Rediger knudepunkter ved klikke endnu en gang på linjen og derefter klikke og trække i de enkelte knudepunkter.</p> 
      <p>Afstandes måles i UTM32/ETRS89 (EPGS:25832).</p> 
    </v-card-text>
    <v-card-actions>
      <v-spacer/>
      <v-btn @click="measure()" :color="$vuetify.dark?'blue-grey darken-2':'blue-grey lighten-2'">Mål</v-btn>
    </v-card-actions>
    <global-snackbar :timeout="timeout" color="accent" v-model="snackbar">
      Længde: {{afstand.toFixed(3)}} m
      <v-btn icon dark flat @click.native="snackbar = false">
        <v-icon>close</v-icon>
      </v-btn>
    </global-snackbar>
  </v-card>
</template>
<script>
import proj4 from 'proj4'
import * as turf from '@turf/turf'
import GlobalSnackbar from '~/components/GlobalSnackbar.vue'
require('@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css')
proj4.defs('EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs')
proj4.defs(
  'EPSG:25832',
  '+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
)
const MapboxDraw = require('@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw')
export default {
  components: {GlobalSnackbar},
  props: ['map', 'active'],
  data () {
    return {
      afstand: 0,
      snackbar: false,
      timeout: 360000
    }
  },
  fetch ({ store }) {},
  methods: {
    measure () {
      this.afstand = 0
      this.map.controls.draw.deleteAll().trash()
      this.map.controls.draw.changeMode('draw_line_string')
    },
    calculate () {
      this.afstand = 0
      const geojson = this.map.controls.draw.getAll()
      let lastCoor = null
      let prevCoor = null
      let data = {
        type: 'FeatureCollection',
        features: []
      }
      geojson.features.forEach(feature => {
        feature.geometry.coordinates.forEach(coor => {
          const utmCoor = proj4('EPSG:4326', 'EPSG:25832', coor)
          if (lastCoor) {
            const p1 = turf.point(prevCoor)
            const p2 = turf.point(coor)
            let midpoint = turf.midpoint(p1, p2)
            midpoint.properties.angle = turf.bearing(p1, p2) - 90
            midpoint.properties.afstand = 0
            data.features.push(midpoint)
            const featureAfstand = Math.sqrt(
              Math.pow(lastCoor[0] - utmCoor[0], 2) +
                Math.pow(lastCoor[1] - utmCoor[1], 2)
            )
            midpoint.properties.afstand = featureAfstand.toFixed(3)
            this.afstand += featureAfstand
          }
          prevCoor = coor
          lastCoor = utmCoor
        })
      })
      this.snackbar = true
      this.map.getSource('measure').setData(data)
      // console.log(data)
    },
    activate () {
      setTimeout(() => {
        console.log('activate measure')
        this.map.controls.draw = new MapboxDraw({
          displayControlsDefault: false
        })
        this.map.addControl(this.map.controls.draw)
        this.map.controls.draw.changeMode('draw_line_string')
        this.map.on('draw.render', this.calculate)
        this.map.addSource('measure', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: []
          }
        })
        this.map.addLayer({
          id: 'measure',
          source: 'measure',
          type: 'symbol',
          layout: {
            'text-field': '{afstand}',
            'text-rotation-alignment': 'map',
            'symbol-placement': 'point',
            'text-anchor': 'bottom',
            'text-offset': [
              0,
              -0.2
            ],
            'text-rotate': {
              'type': 'identity',
              'property': 'angle'
            },
            'text-font': [
              'DIN Offc Pro Italic',
              'Arial Unicode MS Regular'
            ],
            'text-size': {
              'base': 1,
              'stops': [
                [
                  13,
                  12
                ],
                [
                  18,
                  16
                ]
              ]
            }
          },
          'paint': {
            'text-halo-width': 0,
            'text-halo-blur': 0,
            'text-color': '#fbb03b'
          }
        })
      }, 1000)
    },
    deactivate () {
      console.log('deactivate measure')

      if (this.map && this.map.controls && this.map.controls.draw) {
        this.map.off('draw.render', this.calculate)
        this.map.removeLayer('measure')
        this.map.removeSource('measure')
        this.map.controls.draw.deleteAll().trash()
        this.map.removeControl(this.map.controls.draw)
      }
      this.snackbar = false
    }
  },
  computed: {},
  watch: {
    active (val) {
      if (this.map) {
        if (val) {
          this.activate()
        } else {
          this.deactivate()
        }
      }
    },
    map (val) {
      if (val) {
        if (this.active) {
          this.activate()
        } else {
          this.deactivate()
        }
      }
    }
  },
  mounted () {}
}
</script>
<style lang="stylus">
</style>
