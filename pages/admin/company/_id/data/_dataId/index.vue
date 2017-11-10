<template>
  <v-content>
    <v-toolbar app fixed prominent dark color="secondary">
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <img src="/icon.png" height="63" @click="$router.push('/')" style="cursor: pointer"/>
      <v-toolbar-title>{{title}}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon v-if="!showSearch && $vuetify.breakpoint.xsOnly" @click.stop="showSearch=!showSearch;focus()">
        <v-icon>search</v-icon>
      </v-btn>
      <v-text-field autofocus v-if="!$vuetify.breakpoint.xsOnly" dark append-icon="search" label="Search" single-line hide-details v-model="search"></v-text-field>
      <v-text-field ref="searchfield" prepend-icon="close" :prepend-icon-cb="() => (showSearch = !showSearch)" v-if="$vuetify.breakpoint.xsOnly && showSearch" slot="extension" dark append-icon="search" label="Søg" single-line hide-details v-model="search"></v-text-field>
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
export default {
  head () {
    return {
      title: this.title
    }
  },
  data () {
    return {
      title: 'Inspect',
      showSearch: false,
      search: '',
      snackbar: false,
      message: null
    }
  },
  fetch ({ store }) {},
  methods: {},
  computed: {
    drawer: {
      get () {
        return this.$store.state.drawer
      },
      set (value) {
        this.$store.commit('drawer', value)
      }
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
    const route = this.$route
    const mapboxgl = require('mapbox-gl/dist/mapbox-gl')
    const MapboxInspect = require('mapbox-gl-inspect')
    mapboxgl.accessToken = 'pk.eyJ1IjoicnVuZXR2aWx1bSIsImEiOiJkeUg2WVkwIn0.yoMmv3etOc40RXkPsebXSg'
    this.$axios.$get('/tiles/' + route.params.dataId).then(res => {
      map = new mapboxgl.Map({
        hash: true,
        container: 'map',
        style: {
          maxBounds: res.bounds,
          center: [res.center[0], res.center[1]],
          zoom: res.center[2],
          version: 8,
          sources: {
            vector_layer_: {
              type: 'vector',
              url: '/api/tiles/' + route.params.dataId
            }
          },
          layers: []
        }
      })
      const inspect = new MapboxInspect({
        showInspectMap: true,
        showInspectButton: false,
        popup: new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false
        })
      })
      map.addControl(inspect)
      map.on('styledata', function () {
        console.log('styledata', inspect)
      })
      map.on('load', function () {})
      const nav = new mapboxgl.NavigationControl()
      map.addControl(nav, 'top-left')
    }).catch(err => {
      this.message = err.response.data
      this.snackbar = true
    })
  }
}
</script>
<style scoped lang="stylus">
#map {
  height: calc(100vh);
  width: 100%;
}
</style>
