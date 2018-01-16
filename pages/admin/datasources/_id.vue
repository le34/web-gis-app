<template>
  <v-content>
    <v-toolbar app fixed prominent dark color="secondary">
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <img src="/icon.png" height="63" @click="$router.push('/')" style="cursor: pointer"/>
      <v-toolbar-title>{{title}}</v-toolbar-title>
    </v-toolbar>
    <v-container fluid>
      <v-card>
        <v-card-title primary-title class="title">
          Datasource
        </v-card-title>
        <v-card-text>
          <v-text-field readonly label="Type" :value="datasource ? datasource['datasourcetype.name']:''"></v-text-field>
          <v-text-field :rules="requiredRules" required v-model="name" name="name" label="Name" id="name"></v-text-field>          
          <v-text-field v-if="datasource && datasource.datasourcetypeId===3" :rules="requiredRules" required label="Database Connectionstring" hint="postgres://username:password@server:5432/database" v-model="connectionString"></v-text-field>
          <v-text-field v-if="datasource && datasource.datasourcetypeId===3" :rules="requiredRules" required label="Table/View" v-model="dbTable"></v-text-field>
          <v-text-field v-if="datasource && datasource.datasourcetypeId===3" :rules="requiredRules" required label="Geometry Column" v-model="geometryColumn"></v-text-field>
          <v-checkbox v-if="datasource && datasource.datasourcetypeId===3" label="Create Tiles" v-model="tile"></v-checkbox>
        </v-card-text>
        <v-card-actions>
          <v-btn flat @click.stop="create()">
              Create Style
          </v-btn>
          <v-spacer/>
          <v-btn flat color="primary" @click.stop="dialogRemove=true">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-container>
    <v-dialog v-model="dialog" persistent max-width="500">
      <v-form v-model="valid" ref="form" @submit.prevent>
        <v-card>
          <v-card-title>
            <div class="headline">Create new Style</div>
          </v-card-title>
          <v-card-text>
            <v-text-field ref="stylename" :rules="requiredRules" required v-model="stylename" name="stylename" label="Name" id="stylename"></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" flat @click.native="dialog = false">Cancel</v-btn>
            <v-btn type="submit" color="primary" @click.stop="save()">Create</v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
    <v-dialog v-model="dialogRemove" persistent max-width="500">
      <v-card>
        <v-card-title>
          <div class="headline">Delete</div>
        </v-card-title>
        <v-card-text>Delete datasource?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" flat="flat" @click.native="dialogRemove = false">Cancel</v-btn>
          <v-btn color="primary" flat="flat" @click.native="remove()">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-content>
</template>
<script>
import { mapGetters } from 'vuex'
import { v4 } from 'uuid'
export default {
  head () {
    return {
      title: this.title
    }
  },
  data () {
    return {
      dialog: false,
      valid: false,
      stylename: null,
      dialogRemove: false,
      requiredRules: [v => !!v || 'Field is required']
    }
  },
  methods: {
    remove () {
      this.dialogRemove = true
      this.$store.dispatch('datasources/remove', this.$route.params.id).then(res => {
        this.$router.push('/admin/datasources')
      }).catch(err => {
        console.log(err)
      })
    },
    create () {
      this.stylename = this.datasource.name
      this.dialog = true
      this.$nextTick(() => this.$refs.stylename.$el.getElementsByTagName('input')[0].focus())
    },
    save () {
      if (this.valid) {
        Promise.resolve().then(() => {
          let style = {
            name: this.name,
            projectId: this.datasource.projectId,
            dark: {
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
            },
            light: {
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
          }
          if (this.datasource.datasourcetypeId < 3) {
            return this.$store.dispatch('tiles/get', this.$route.params.id).then(tileJson => {
              if (tileJson.format === 'pbf') {
                let sources = {
                  [this.$route.params.id]: {
                    type: 'vector',
                    tiles: tileJson.tiles,
                    minzoom: tileJson.minzoom,
                    maxzoom: tileJson.maxzoom,
                    bounds: tileJson.bounds
                  }
                }
                style.light.sources = sources
                style.dark.sources = sources
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
                console.log(promises)
                return Promise.all(promises).then(items => {
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
                        let id = v4()
                        let layerlight = JSON.parse(
                          JSON.stringify(kodetabel[name])
                        )
                        let layerdark = JSON.parse(
                          JSON.stringify(kodetabel[name])
                        )
                        layerlight.id = id
                        layerdark.id = id
                        layerlight.metadata = { name: layerlight.name || name }
                        layerdark.metadata = { name: layerdark.name || name }
                        layerlight.source = this.$route.params.id
                        layerdark.source = this.$route.params.id
                        layerlight['source-layer'] = data.id
                        layerdark['source-layer'] = data.id
                        delete layerlight.name
                        delete layerdark.name
                        delete layerlight.category
                        delete layerdark.category
                        if (layerlight.paint.hasOwnProperty('line-color') && layerlight.paint['line-color'] === '#ffffff') {
                          layerlight.paint['line-color'] = '#000000'
                        } else if (layerlight.paint.hasOwnProperty('circle-color') && layerlight.paint['circle-color'] === '#ffffff') {
                          layerlight.paint['circle-color'] = '#000000'
                        }
                        style.light.layers.push(layerlight)
                        if (layerdark.paint.hasOwnProperty('line-color') && layerdark.paint['line-color'] === '#000000') {
                          layerdark.paint['line-color'] = '#ffffff'
                        } else if (layerdark.paint.hasOwnProperty('circle-color') && layerdark.paint['circle-color'] === '#000000') {
                          layerdark.paint['circle-color'] = '#ffffff'
                        }
                        style.dark.layers.push(layerdark)
                      }
                    } else {
                      const layerCircle = {
                        id: v4(),
                        metadata: { name: data.id },
                        source: this.$route.params.id,
                        'source-layer': data.id,
                        type: 'circle',
                        paint: { 'circle-color': '#FF0000' }
                      }
                      const layerLine = {
                        id: v4(),
                        metadata: { name: data.id },
                        source: this.$route.params.id,
                        'source-layer': data.id,
                        type: 'line',
                        paint: { 'line-color': '#FF0000' }
                      }
                      style.light.layers.push(layerCircle)
                      style.light.layers.push(layerLine)
                      style.dark.layers.push(layerCircle)
                      style.dark.layers.push(layerLine)
                    }
                  })
                  return style
                })
              } else {
                const sources = {
                  [this.$route.params.id]: {
                    type: 'raster',
                    tiles: tileJson.tiles,
                    minzoom: tileJson.minzoom,
                    maxzoom: tileJson.maxzoom,
                    bounds: tileJson.bounds,
                    tileSize: 256
                  }
                }
                const layer = {
                  id: v4(),
                  type: 'raster',
                  source: this.$route.params.id,
                  metadata: this.stylename
                }
                style.light.sources = sources
                style.dark.sources = sources
                style.light.layers.push(layer)
                style.dark.layers.push(layer)
                console.log(style)
                return style
              }
            })
          } else {
            const sources = {
              [this.$route.params.id]: {
                type: 'geojson',
                data: `${process.env.FEATHERS}/db/${this.$route.params.id}`
              }
            }
            const layerCircle = {
              id: v4(),
              source: this.$route.params.id,
              type: 'circle',
              paint: { 'circle-color': '#FF0000' }
            }
            const layerLine = {
              id: v4(),
              source: this.$route.params.id,
              type: 'line',
              paint: { 'line-color': '#FF0000' }
            }
            style.light.sources = sources
            style.dark.sources = sources
            style.light.layers.push(layerCircle)
            style.light.layers.push(layerLine)
            style.dark.layers.push(layerCircle)
            style.dark.layers.push(layerLine)
            return style
          }
        }).then(style => {
          console.log(style)
          return this.$store.dispatch('styles/create', style)
        }).then(res => {
          this.$router.push({ name: 'admin-styles-id', params: { id: res.id } })
        }).catch(err => {
          console.log(err)
          this.snackbar = true
          if (err.statusCode === 404) {
            this.text = 'Error MBTiles file does not exists'
          } else {
            this.text = err.message
          }
        })
      }
    }
  },
  computed: {
    title () {
      return this.datasource ? this.datasource.name : 'Datasource'
    },
    ...mapGetters('datasources', {
      getDatasource: 'get'
    }),
    ...mapGetters('code-tables', {
      codeTables: 'list'
    }),
    ...mapGetters('code-tables', {
      getCode: 'get'
    }),
    datasource () {
      return this.getDatasource(this.$route.params.id)
    },
    name: {
      get () {
        return this.datasource ? this.datasource.name : null
      },
      set (e) {
        this.$store.dispatch('datasources/patch', [this.datasource.id, { name: e }])
      }
    },
    connectionString: {
      get () {
        return this.datasource ? this.datasource.data.connectionString : null
      },
      set (e) {
        let data = { ...this.datasource.data }
        data.connectionString = e
        this.$store.dispatch('datasources/patch', [this.datasource.id, { data }])
      }
    },
    geometryColumn: {
      get () {
        return this.datasource ? this.datasource.data.geometryColumn : null
      },
      set (e) {
        let data = { ...this.datasource.data }
        data.geometryColumn = e
        this.$store.dispatch('datasources/patch', [this.datasource.id, { data }])
      }
    },
    dbTable: {
      get () {
        return this.datasource ? this.datasource.data.dbTable : null
      },
      set (e) {
        let data = { ...this.datasource.data }
        data.dbTable = e
        this.$store.dispatch('datasources/patch', [this.datasource.id, { data }])
      }
    },
    tile: {
      get () {
        return this.datasource ? this.datasource.data.tile : null
      },
      set (e) {
        let datasource = { ...this.datasource }
        let data = { ...this.datasource.data }
        data.tile = e
        datasource.meta = data
        this.$store.dispatch('datasources/update', [this.datasource.id, data])
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
  mounted () {
    this.$store.dispatch('datasources/get', this.$route.params.id)
  }
}
</script>
<style scoped lang="stylus">
.select {
  cursor: pointer;
}
</style>