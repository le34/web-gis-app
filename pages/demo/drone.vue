<template>
  <v-content>
    <div id='map'></div>
  </v-content>
</template>
<script>
require('mapbox-gl/dist/mapbox-gl.css')
let map
export default {
  data () {
    return {
      mini: false,
      drawer: false
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
  computed: {},
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
    map.on('load', function () {
      map.addSource('drone', {
        type: 'raster',
        tiles: ['/api/tiles/drone/{z}/{x}/{y}.png'],
        bounds: [
          12.26932945568605,
          55.89761405375065,
          12.28573887516303,
          55.90699107605572
        ],
        tileSize: 256,
        minzoom: 0,
        maxzoom: 22,
        attribution: "© <a href='http://www.le34.dk'>LE34</a>"
      })
      map.addLayer({
        id: 'drone',
        type: 'raster',
        source: 'drone'
      })
      map.fitBounds([
        12.26932945568605,
        55.89761405375065,
        12.28573887516303,
        55.90699107605572
      ])
    })
  }
}
</script>
<style scoped lang="stylus">
#map {
  height: calc(100vh - 64px);
  width: 100%;
}
</style>
