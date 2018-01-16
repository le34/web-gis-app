/* no-process-env: 0 */
<template>
  <v-content>
    <v-toolbar app fixed prominent dark color="secondary">
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <img src="/icon.png" height="63" @click="$router.push('/')" style="cursor: pointer" />
      <v-btn icon :to="{ name: 'admin-styles' }">
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
          <v-layout column>
            <v-card>
              <v-card-text>
                <v-text-field :rules="requiredRules" required v-model="name" name="name" label="Name" id="name"></v-text-field>
              </v-card-text>
              <v-card-actions>
                <v-btn flat @click="fit()">Fit Map</v-btn>
                <v-spacer/>
                <v-btn flat @click="save()">Save Style</v-btn>
              </v-card-actions>              
            </v-card>
            <v-flex d-flex>
              <v-tabs fixed-tabs class="r-tabs" v-model="selected" color="accent" slider-color="yellow" dark>
                
                <v-tab>
                  Light Style
                </v-tab>
                <v-tab>
                  Dark Style
                </v-tab>
                
                <v-tabs-items class="r-flex d-flex" >
                 <v-tab-item>
                   <div id="jsoneditorlight" class="fill-height"></div>
                 </v-tab-item>
                 <v-tab-item>
                   <div id="jsoneditordark" class="fill-height"></div>
                 </v-tab-item>
                </v-tabs-items>
          
                  
              </v-tabs>
              <!--v-tabs fixed-tabs centered v-model="selected">
                <v-container fluid fill-height pa-0>
                  <v-layout column>
                    <v-tabs-bar color="accent" dark>
                      <v-tabs-slider color="primary"></v-tabs-slider>
                      <v-tabs-item href="#tab-1">
                        Light Style
                      </v-tabs-item>
                      <v-tabs-item href="#tab-2">
                        Dark Style
                      </v-tabs-item>
                    </v-tabs-bar>
                    <v-flex d-flex>
                      <v-tabs-items>
                        <v-tabs-content id="tab-1" class="fill-height">
                          <div id="jsoneditorlight" class="fill-height"></div>
                        </v-tabs-content>
                        <v-tabs-content id="tab-2" class="fill-height">
                          <div id="jsoneditordark" class="fill-height"></div>
                        </v-tabs-content>
                      </v-tabs-items>
                    </v-flex>
                  </v-layout>
                </v-container>
              </v-tabs-->
            </v-flex>
          </v-layout>
        </v-flex>
      </v-layout>
    </v-container>
    <v-snackbar :timeout="timeout" color="error" v-model="snackbar">
      <v-icon dark>error</v-icon> {{ text }}</v-snackbar>
  </v-content>
</template>
<script>
import { mapGetters } from 'vuex'

require('jsoneditor/dist/jsoneditor.min.css')
require('mapbox-gl/dist/mapbox-gl.css')
let map
let editorlight
let editordark
export default {
  data () {
    return {
      requiredRules: [v => !!v || 'Field is required'],
      active: 'tab-1',
      snackbar: false,
      text: '',
      timeout: 3600000
    }
  },
  fetch ({ store }) {},
  methods: {
    fit () {
      const style = map.getStyle()
      let bounds
      Object.keys(style.sources).forEach(key => {
        console.log(key)
        const source = style.sources[key]
        if (source.bounds) {
          bounds = source.bounds
        }
      })
      if (bounds) {
        map.fitBounds(bounds)
      } else {
        let options = {}
        if (style.center) {
          options.center = style.center
        }
        if (style.zoom) {
          options.zoom = style.zoom
        }
        map.jumpTo(options)
      }
      /* var source = map.getSource(this.style.datasourceId)
      Promise.resolve().then(() => {
        if (source.type === 'geojson') {
          return this.$store.dispatch('extent/get', this.style.datasourceId).then(res => {
            return [
              this.res.geometry.coordinates[0][0][0],
              this.res.geometry.coordinates[0][0][1],
              this.res.geometry.coordinates[0][2][0],
              this.res.geometry.coordinates[0][2][1]
            ]
          })
        } else {
          return source.bounds
        }
      }).then(bounds => {
        map.fitBounds(bounds, {
          linear: true
        })
      }) */
    },
    save () {
      Promise.resolve().then(() => {
        let data = {}
        data.light = JSON.parse(editorlight.getText())
        data.dark = JSON.parse(editordark.getText())
        return data
      }).then(data => {
        return this.$store.dispatch('styles/patch', [this.$route.params.id, data])
      }).catch(err => {
        this.snackbar = true
        this.text = err
      })
    },
    onChangeLight () {
      this.snackbar = false
      const data = editorlight.getText()
      try {
        const style = JSON.parse(data)
        if (map) {
          map.setStyle(style)
        }
      } catch (err) {
        this.snackbar = true
        this.text = err.message
      }
    },
    onChangeDark () {
      this.snackbar = false
      const data = editordark.getText()
      try {
        const style = JSON.parse(data)
        if (map) {
          map.setStyle(style)
        }
      } catch (err) {
        this.snackbar = true
        this.text = err.message
      }
    },
    transformRequest (url, resourceType) {
      if (url.substr(0, 7) === 'le34://') {
        url = process.env.FEATHERS + url.substring(6, url.length)
        return { url: url, headers: { Authorization: this.$store.state.auth.accessToken } }
      } else if (url.substr(0, 8) === 'local://') {
        url = window.location.origin + url.substring(7, url.length)
        return {url}
      }
    }
  },
  computed: {
    ...mapGetters('styles', {
      getStyle: 'get'
    }),
    ...mapGetters('code-tables', {
      codeTables: 'list'
    }),
    ...mapGetters('code-tables', {
      getCode: 'get'
    }),
    style () {
      return this.getStyle(this.$route.params.id)
    },
    selected: {
      get () {},
      set (e) {
        switch (e) {
          case '0':
            map.setStyle(JSON.parse(editorlight.getText()))
            break
          case '1':
            map.setStyle(JSON.parse(editordark.getText()))
            break
        }
      }
    },
    name: {
      get () {
        return this.style ? this.style.name : null
      },
      set (e) {
        this.$store.dispatch('styles/patch', [this.style.id, { name: e }])
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
    }
  },
  mounted () {
    try {
      const JSONEditor = require('jsoneditor/dist/jsoneditor.min.js')
      const containerlight = document.getElementById('jsoneditorlight')
      const containerdark = document.getElementById('jsoneditordark')
      console.log(containerlight)
      editorlight = new JSONEditor(containerlight, {
        mode: 'code',
        onChange: this.onChangeLight
      })
      editordark = new JSONEditor(containerdark, {
        mode: 'code',
        onChange: this.onChangeDark
      })
      this.$store.dispatch('styles/get', this.$route.params.id).then(style => {
        let dark = {
          version: 8,
          sources: {
          },
          layers: [{
            id: 'background',
            type: 'background',
            paint: {
              'background-color': '#000000'
            }
          }]
        }
        let light = {
          version: 8,
          sources: {
          },
          layers: [{
            id: 'background',
            type: 'background',
            paint: {
              'background-color': '#ffffff'
            }
          }]
        }
        if (style.dark) {
          dark = JSON.parse(JSON.stringify(style.dark))
        }
        editordark.set(dark)
        if (style.light) {
          light = JSON.parse(JSON.stringify(style.light))
        }
        editorlight.set(light)
        if (style.light) {
          map.setStyle(light)
        } else if (style.dark) {
          map.setStyle(dark)
        }
      })
    } catch (err) {
      console.log(err)
    }
    const mapboxgl = require('mapbox-gl/dist/mapbox-gl')
    mapboxgl.accessToken = 'pk.eyJ1IjoicnVuZXR2aWx1bSIsImEiOiJkeUg2WVkwIn0.yoMmv3etOc40RXkPsebXSg'
    map = new mapboxgl.Map({
      hash: true,
      container: 'map',
      transformRequest: this.transformRequest.bind(this)
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
.r-flex
  flex: 1 1 auto
.r-tabs
  display: flex
  flex-direction: column
</style>
