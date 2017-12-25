/* no-process-env: 0 */
<template>
  <v-content>
    <v-toolbar app fixed prominent dark color="secondary">
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <img src="/icon.png" height="63" @click="$router.push('/')" style="cursor: pointer" />
      <v-btn icon :to="{ name: 'admin-companies-id-project-projectId', params: { id: $route.params.id, projectId: $route.params.projectId } }">
        <v-icon>chevron_left</v-icon>
      </v-btn>
      <v-toolbar-title>{{name}}</v-toolbar-title>
    </v-toolbar>
    <v-container fluid fill-height class="pa-0">
      <v-layout>
        <v-flex d-flex xs6>
          <div id='map'></div>
        </v-flex>
        <v-flex xs6>
          <v-container fluid fill-height pa-0>
            <v-layout>
              <v-flex d-flex>
                <v-tabs fixed centered>
                  <v-container fluid fill-height pa-0>
                    <v-layout column>
                      <v-tabs-bar color="accent" dark>
                        <v-tabs-slider color="primary"></v-tabs-slider>
                        <v-tabs-item href="#tab-1">
                          Datasource
                        </v-tabs-item>
                        <v-tabs-item href="#tab-2">
                          Style
                        </v-tabs-item>
                      </v-tabs-bar>
                      <v-flex d-flex>
                        <v-tabs-items>
                          <v-tabs-content id="tab-1" class="fill-height" d-flex>
                            <v-container fluid fill-height pa-0>
                              <v-layout>
                                <v-flex d-flex>
                                  <v-card>
                                    <v-card-text>
                                      <v-text-field :rules="requiredRules" required v-model="name" name="name" label="Name" id="name"></v-text-field>
                                      <v-text-field type="number" v-model="priority" name="priority" label="Priority" id="priority"></v-text-field>
                                      <v-text-field v-if="datasourceType===2" :rules="requiredRules" required label="Database Connectionstring" hint="postgres://username:password@server:5432/database" v-model="connectionString"></v-text-field>
                                      <v-text-field v-if="datasourceType===2" :rules="requiredRules" required label="Table/View" v-model="dbTable"></v-text-field>
                                      <v-text-field v-if="datasourceType===2" :rules="requiredRules" required label="Geometry Column" v-model="geometryColumn"></v-text-field>
                                      <v-checkbox v-if="datasourceType===2" label="Create Tiles" v-model="tile"></v-checkbox>
                                    </v-card-text>
                                    <v-card-actions>
                                      <v-btn flat @click="fit()">Fit Map</v-btn>
                                      <v-spacer/>
                                      <v-btn flat @click="save()">Save Style</v-btn>
                                    </v-card-actions>
                                  </v-card>
                                </v-flex>
                              </v-layout>
                            </v-container>
                          </v-tabs-content>
                          <v-tabs-content id="tab-2" class="fill-height">
                            <div id="jsoneditor" class="fill-height"></div>
                          </v-tabs-content>
                        </v-tabs-items>
                      </v-flex>
                    </v-layout>
                  </v-container>
                </v-tabs>
              </v-flex>
            </v-layout>
          </v-container>
        </v-flex>
      </v-layout>
    </v-container>
    <v-snackbar :timeout="timeout" color="error" v-model="snackbar">
      <v-icon dark>error</v-icon> {{ text }}</v-snackbar>
  </v-content>
</template>
<script>
import { mapGetters } from 'vuex'
import { v4 } from 'uuid'
require('jsoneditor/dist/jsoneditor.min.css')
require('mapbox-gl/dist/mapbox-gl.css')
let map
let editor
export default {
  data () {
    return {
      requiredRules: [v => !!v || 'Field is required'],
      active: 'tab-1',
      snackbar: false,
      text: '',
      timeout: 3600000,
      style: {},
      geojson: {}
    }
  },
  fetch ({ store }) {},
  methods: {
    fit () {
      var source = map.getSource(this.$route.params.dataId)
      let bounds
      if (source.type === 'geojson') {
        bounds = this.extent
          ? [
            this.extent.geometry.coordinates[0][0][0],
            this.extent.geometry.coordinates[0][0][1],
            this.extent.geometry.coordinates[0][2][0],
            this.extent.geometry.coordinates[0][2][1]
          ]
          : [0, -90, 180, 90]
      } else {
        bounds = source.bounds
      }
      map.fitBounds(bounds, {
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
    ...mapGetters('extent', {
      getExtent: 'get'
    }),
    ...mapGetters('code-tables', {
      codeTables: 'list'
    }),
    ...mapGetters('code-tables', {
      getCode: 'get'
    }),
    extent () {
      return this.getExtent(this.$route.params.dataId)
    },
    data () {
      return this.getData(this.$route.params.dataId)
    },
    datasourceType () {
      return this.data ? this.data.meta.source : 0
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
    priority: {
      get () {
        return this.data ? this.data.priority : null
      },
      set (e) {
        this.$store
          .dispatch('data/patch', [this.data.id, { priority: e }])
          .then(res => {
            console.log(res)
          })
          .catch(err => {
            console.log('error', err)
          })
      }
    },
    connectionString: {
      get () {
        return this.data ? this.data.meta.connectionString : null
      },
      set (e) {
        let meta = { ...this.data.meta }
        meta.connectionString = e
        this.$store
          .dispatch('data/patch', [this.data.id, { meta }])
          .then(res => {
            console.log(res)
          })
          .catch(err => {
            console.log('error', err)
          })
      }
    },
    geometryColumn: {
      get () {
        return this.data ? this.data.meta.geometryColumn : null
      },
      set (e) {
        let meta = { ...this.data.meta }
        meta.geometryColumn = e
        this.$store.dispatch('data/patch', [this.data.id, { meta }]).then(res => {
          console.log(res)
        }).catch(err => {
          console.log('error', err)
        })
      }
    },
    dbTable: {
      get () {
        return this.data ? this.data.meta.dbTable : null
      },
      set (e) {
        let meta = { ...this.data.meta }
        meta.dbTable = e
        this.$store
          .dispatch('data/patch', [this.data.id, { meta }])
          .then(res => {
            console.log(res)
          })
          .catch(err => {
            console.log('error', err)
          })
      }
    },
    tile: {
      get () {
        return this.data ? this.data.meta.tile : null
      },
      set (e) {
        let data = { ...this.data }
        let meta = { ...this.data.meta }
        meta.tile = e
        data.meta = meta
        this.$store.dispatch('data/update', [this.data.id, data]).then(res => {
          console.log(res)
        }).catch(err => {
          console.log('error', err)
        })
        console.log(this.style.sources)
        if (this.style.sources) {
          console.log('tile', e)
          if (e) {
            this.$axios.get(`/tiles/${this.$route.params.dataId}`).then(res => {
              const tileJson = res.data
              this.style.sources[this.$route.params.dataId] = {
                type: 'vector',
                tiles: tileJson.tiles,
                minzoom: tileJson.minzoom,
                maxzoom: tileJson.maxzoom,
                bounds: tileJson.bounds
              }
              this.style.layers.forEach(layer => {
                if (layer.source === this.$route.params.dataId) {
                  layer['source-layer'] = this.$route.params.dataId
                }
              })
              editor.set(this.style)
              map.setStyle(this.style)
            })
          } else {
            this.style.sources[this.$route.params.dataId] = {
              type: 'geojson',
              data: `${process.env.FEATHERS}/db/${this.$route.params.dataId}`
            }
            this.style.layers.forEach(layer => {
              if (layer.source === this.$route.params.dataId) {
                delete layer['source-layer']
              }
            })
            editor.set(this.style)
            map.setStyle(this.style)
          }
        }
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
    this.$store.dispatch('extent/get', this.$route.params.dataId)
    this.$store.dispatch('data/get', [this.$route.params.dataId]).then(data => {
      if (data.style) {
        this.style = JSON.parse(JSON.stringify(data.style))
        editor.set(this.style)
        map.setStyle(this.style)
      } else {
        if (
          data.meta === null ||
            (data.meta.hasOwnProperty('source') && data.meta.source < 2)
        ) {
          this.$axios
            .get('/tiles/' + data.id)
            .then(res => {
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
                  if (data.id) {
                    const layerid = data.id.split('#')
                    if (layerid.length > 1) {
                      const kode = layerid[0]
                      if (!this.codeTables.hasOwnProperty(kode)) {
                        promises.push(this.$axios.$get('/style/' + kode))
                        this.$store.commit('code-tables/add', { [kode]: {} })
                      }
                    }
                  }
                })
                Promise.all(promises).then(items => {
                  items.forEach(item => {
                    this.$store.commit('code-tables/add', {
                      [item.id]: item.layers
                    })
                  })
                  tileJson.vector_layers.forEach(data => {
                    const layerid = data.id.split('#')
                    if (layerid.length > 1) {
                      const kode = layerid[0]
                      const name = data.id.substr(kode.length + 1)
                      const kodetabel = this.getCode(kode)
                      if (kodetabel.hasOwnProperty(name)) {
                        let layer = JSON.parse(
                          JSON.stringify(kodetabel[name])
                        )
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
                        layer.id = v4()
                        layer.metadata = { name: layer.name || name }
                        layer.source = this.$route.params.dataId
                        layer['source-layer'] = data.id
                        delete layer.name
                        delete layer.category
                        this.style.layers.push(layer)
                      }
                    } else {
                      this.style.layers.push({
                        id: v4(),
                        metadata: { name: data.id },
                        source: this.$route.params.dataId,
                        'source-layer': data.id,
                        type: 'circle',
                        paint: { 'circle-color': '#FF0000' }
                      })
                      this.style.layers.push({
                        id: v4(),
                        metadata: { name: data.id },
                        source: this.$route.params.dataId,
                        'source-layer': data.id,
                        type: 'line',
                        paint: { 'line-color': '#FF0000' }
                      })
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
            })
            .catch(err => {
              this.snackbar = true
              if (err.statusCode === 404) {
                this.text = 'Error MBTiles file does not exists'
              } else {
                this.text = err.message
              }
            })
        } else {
          this.style = {
            version: 8,
            sources: {
              [this.$route.params.dataId]: {
                type: 'geojson',
                data: `${process.env.FEATHERS}/db/${this.$route.params
                  .dataId}`
              }
            },
            layers: [
              {
                id: `${this.$route.params.dataId}-point`,
                type: 'circle',
                source: this.$route.params.dataId
              },
              {
                id: `${this.$route.params.dataId}-line`,
                type: 'line',
                source: this.$route.params.dataId
              }
            ]
          }
          editor.set(this.style)
          map.setStyle(this.style)
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
    const nav = new mapboxgl.NavigationControl()
    map.addControl(nav, 'top-left')
  }
}
</script>
<style lang="stylus">
div.jsoneditor-menu {
  background-color: #757575; // #607D8B;
  border: none;
}

.jsoneditor-poweredBy {
  display: none;
}

div.jsoneditor {
  border: none;
}
</style>
