<template>
  <v-content>
    <v-toolbar app fixed prominent dark color="secondary">
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <img src="/icon.png" height="63" @click="$router.push('/')" style="cursor: pointer" />
      <v-btn icon :to="{ name: 'admin-company-id-project-projectId', params: { id: $route.params.id, projectId: $route.params.projectId } }">
        <v-icon>chevron_left</v-icon>
      </v-btn>
      <v-toolbar-title>{{name}}</v-toolbar-title>
    </v-toolbar>
    <v-container fluid fill-height class="pa-0">
      <v-layout>
        <v-flex d-flex xs6>
          <div id='map'></div>
        </v-flex>
        <v-flex d-flex xs6>

          <v-layout column>
            <v-card tile>
              <v-toolbar card dark color="accent">
                <v-toolbar-title>Datasource</v-toolbar-title>
              </v-toolbar>
              <v-card-text>
                <v-text-field v-model="name" name="name" label="Name" id="name"></v-text-field>
              </v-card-text>
              <v-card-actions>
                <v-btn flat @click="fit()">Fit Map</v-btn>
                <v-spacer/>
                <v-btn flat @click="save()">Save Style</v-btn>
              </v-card-actions>
            </v-card>
            <v-flex d-flex>
              <div id="jsoneditor"></div>
            </v-flex>
          </v-layout>
        </v-flex>
      </v-layout>
    </v-container>
    <v-snackbar :timeout="timeout" color="error" v-model="snackbar"><v-icon dark>error</v-icon> {{ text }}</v-snackbar>
  </v-content>
</template>
<script>
import { mapGetters } from 'vuex'
import {v4} from 'uuid'
require('jsoneditor/dist/jsoneditor.min.css')
require('mapbox-gl/dist/mapbox-gl.css')
let map
let editor
export default {
  data () {
    return {
      active: 'tab-1',
      snackbar: false,
      text: '',
      timeout: 3600000,
      style: {}
    }
  },
  fetch ({ store }) {},
  methods: {
    fit () {
      var source = map.getSource(this.$route.params.dataId)
      map.fitBounds(source.bounds, {
        linear: true
      })
    },
    save () {
      this.$store
        .dispatch('data/patch', [this.data.id, { style: this.style }])
        .then(res => {
          console.log(res)
        })
        .catch(err => {
          this.snackbar = true
          this.text = err
        })
    },
    onChange () {
      this.snackbar = false
      const data = editor.getText()
      try {
        this.style = JSON.parse(data)
        if (map) {
          map.setStyle(this.style)
        }
      } catch (err) {
        this.snackbar = true
        this.text = err.message
      }
    }
  },
  computed: {
    ...mapGetters('data', {
      getData: 'get'
    }),
    ...mapGetters('code-tables', {
      codeTables: 'list'
    }),
    ...mapGetters('code-tables', {
      getCode: 'get'
    }),
    data () {
      return this.getData(this.$route.params.dataId)
    },
    name: {
      get () {
        return this.data ? this.data.name : null
      },
      set (e) {
        this.$store
          .dispatch('data/patch', [this.data.id, { name: e }])
          .then(res => {
            console.log(res)
          })
          .catch(err => {
            console.log('error', err)
          })
      }
    },
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
    const options = {
      mode: 'code',
      onChange: this.onChange
    }
    const JSONEditor = require('jsoneditor/dist/jsoneditor.min.js')
    const container = document.getElementById('jsoneditor')
    editor = new JSONEditor(container, options)
    this.$store.dispatch('data/find', {
      query: {
        $select: [
          'id',
          'projectId',
          'name',
          'meta',
          'style',
          'createdAt',
          'progress'
        ],
        id: this.$route.params.dataId
      }
    }).then(res => {
      if (res.length > 0) {
        const data = res[0]
        if (data.style) {
          editor.set(data.style)
          map.setStyle(data.style)
        } else {
          if (data.meta === null || (data.meta.hasOwnProperty('source') && data.meta.source < 2)) {
            this.$axios.get('/tiles/' + data.id).then(res => {
              const tileJson = res.data
              if (tileJson.format === 'pbf') {
                this.style = {
                  version: 8,
                  sources: {
                    [data.id]: {
                      type: 'vector',
                      tiles: tileJson.tiles,
                      minzoom: tileJson.minzoom,
                      maxzoom: tileJson.maxzoom,
                      bounds: tileJson.bounds
                    }
                  },
                  layers: []
                }
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
                        if (
                          layer.paint.hasOwnProperty('line-color') && layer.paint['line-color'] === '#ffffff'
                        ) {
                          layer.paint['line-color'] = '#000000'
                        } else if (
                          layer.paint.hasOwnProperty('circle-color') && layer.paint['circle-color'] === '#ffffff'
                        ) {
                          layer.paint['circle-color'] = '#000000'
                        }
                        layer.id = v4()
                        layer.metadata = { name: layer.name || name }
                        layer.source = this.$route.params.dataId
                        layer['source-layer'] = data.id
                        delete layer.name
                        delete layer.category
                        this.style.layers.push(layer)
                      }
                    }
                  })
                  editor.set(this.style)
                  map.setStyle(this.style)
                })
              } else {
                this.style = {
                  version: 8,
                  sources: {
                    [data.id]: {
                      type: 'raster',
                      tiles: tileJson.tiles,
                      minzoom: tileJson.minzoom,
                      maxzoom: tileJson.maxzoom,
                      bounds: tileJson.bounds
                    }
                  },
                  layers: [
                    {
                      id: data.id,
                      type: 'raster',
                      source: data.id,
                      metadata: data.name
                    }
                  ]
                }
                editor.set(this.style)
                map.setStyle(this.style)
              }
            }).catch(err => {
              this.snackbar = true
              if (err.statusCode === 404) {
                this.text = 'Error MBTiles file does not exists'
              } else {
                this.text = err.message
              }
            })
          }
        }
      }
    })

    const mapboxgl = require('mapbox-gl/dist/mapbox-gl')
    mapboxgl.accessToken =
      'pk.eyJ1IjoicnVuZXR2aWx1bSIsImEiOiJkeUg2WVkwIn0.yoMmv3etOc40RXkPsebXSg'
    map = new mapboxgl.Map({
      hash: true,
      container: 'map'
    })
    map.on('load', e => {
      console.log('load', e)
      this.fit()
    })
    map.on('styledata', e => {
      console.log('styledata', e)
    })
    const nav = new mapboxgl.NavigationControl()
    map.addControl(nav, 'top-left')
  }
}
</script>
<style lang="stylus">
div.jsoneditor-menu {
  background-color: #607D8B;
}

.jsoneditor-poweredBy {
  display: none;
}

div.jsoneditor {
  border: none;
}
</style>
