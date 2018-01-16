<template>
  <v-card :color="$vuetify.dark?'blue-grey':'blue-grey lighten-4'">
    <v-card-text>
      <p>Beregner antal komponenter, længder og arealer på det angivne område.</p>
      <p>Klik på polygon knappen i øverste højre hjørne for at tegne en polygon om det område som skal beregnes.</p>
      <p>Dobbeltklik for at afslutte. Der kan tegnes flere polygoner</p>
      <p>Rediger polygon ved at klikke på den. Vertices redigeres ved at klikke på dem og trække i dem.</p>
      <p>Polygoner og vertices slettes ved at klikke på dem og derefter klikke på skraldespanen</p>
    </v-card-text>
    <v-card-actions>
      <v-spacer/>
      <v-btn @click="calculate()" :color="$vuetify.dark?'blue-grey darken-2':'blue-grey lighten-2'">Beregn</v-btn>
    </v-card-actions>
    <v-dialog scrollable v-model="dialog" :fullscreen="$vuetify.breakpoint.xsOnly" lazy>
      <v-card light color="blue-grey lighten-4">
        <v-toolbar dark card dense color="accent">
          <v-toolbar-title>Objektberegning</v-toolbar-title>
          <v-spacer/>
          <v-btn dark flat icon @click.native="dialog = false">
            <v-icon>close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text class="pa-0" color="accent">
          <v-container grid-list-lg>
            <v-layout row wrap>
              <v-flex xs12>
                <v-card light>
                  <v-toolbar dark card dense color="accent">
                    <v-toolbar-title>Arealer</v-toolbar-title>
                  </v-toolbar>
                  <v-card-text class="pa-0">
                    <v-data-table light :custom-sort="sort" :headers="headersArea" :items="listArea" hide-actions class="sum">
                      <template slot="items" scope="props">
                        <td>{{ props.item.name }}</td>
                        <td class="text-xs-right">{{ props.item.st_area.toFixed(2) }} m²</td>
                        <td class="text-xs-right">{{ props.item.st_perimeter.toFixed(2) }} m</td>
                        <td class="text-xs-right">{{ props.item.half.toFixed(2) }} m</td>
                      </template>
                    </v-data-table>
                  </v-card-text>
                  <v-card-actions>
                  </v-card-actions>
                </v-card>
              </v-flex>
              <v-flex md6>
                <v-card light>
                  <v-toolbar dark card dense color="accent">
                    <v-toolbar-title>Længder</v-toolbar-title>
                  </v-toolbar>
                  <v-card-text class="pa-0">
                    <v-data-table light :custom-sort="sort" :headers="headers" :items="listLength" hide-actions class="sum">
                      <template slot="items" scope="props">
                        <td>{{ props.item.name }}</td>
                        <td class="text-xs-right">{{ props.item.st_length.toFixed(2) }} m</td>
                      </template>
                    </v-data-table>
                  </v-card-text>
                  <v-card-actions>
                  </v-card-actions>
                </v-card>
              </v-flex>
              <v-flex md6>
                <v-card light>
                  <v-toolbar dark card dense color="accent">
                    <v-toolbar-title>Punkter</v-toolbar-title>
                  </v-toolbar>
                  <v-card-text class="pa-0">
                    <v-data-table light :custom-sort="sort" :headers="headersCount" :items="listCount" hide-actions class="sum">
                      <template slot="items" scope="props">
                        <td>{{ props.item.name }}</td>
                        <td class="text-xs-right">{{ props.item.antal }} </td>
                      </template>
                    </v-data-table>
                  </v-card-text>
                  <v-card-actions>
                  </v-card-actions>
                </v-card>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-card>
</template>
<script>
import { mapGetters } from 'vuex'
require('@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css')
const MapboxDraw = require('@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw')
export default {
  props: ['map', 'active'],
  data () {
    return {
      dialog: false,
      items: [],
      headers: [
        {
          text: 'Feature',
          align: 'left',
          sortable: true,
          value: 'id'
        },
        {
          text: 'Længde',
          align: 'right',
          sortable: true,
          value: 'st_length'
        }
      ],
      headersCount: [
        {
          text: 'Feature',
          align: 'left',
          sortable: true,
          value: 'id'
        },
        {
          text: 'Antal',
          align: 'right',
          sortable: true,
          value: 'antal'
        }
      ],
      headersArea: [
        {
          text: 'Feature',
          align: 'left',
          sortable: true,
          value: 'id'
        },
        {
          text: 'Areal',
          align: 'right',
          sortable: true,
          value: 'st_area'
        },
        {
          text: 'Omkreds',
          align: 'right',
          sortable: true,
          value: 'st_perimeter'
        },
        {
          text: 'Halve omkreds',
          align: 'right',
          sortable: true,
          value: 'half'
        }
      ]
    }
  },
  fetch ({ store }) {},
  methods: {
    sort (items, key, ascending) {
      if (!key) {
        return items
      }
      const total = items[items.length - 1]
      let temp = [...items]
      temp.splice(-1, 1)
      let tempSort = temp.sort((a, b) => {
        if (a[key] < b[key]) {
          return ascending ? 1 : -1
        }
        if (a[key] > b[key]) {
          return ascending ? -1 : 1
        }
        return 0
      })
      tempSort.push(total)
      return tempSort
    },
    calculate () {
      const style = this.map.getStyle()
      console.log(style.sources)
      this.$store.commit('totals/clearAll')
      this.$store
        .dispatch('totals/find', {
          query: {
            ...this.$route.params,
            geojson: this.map.controls.draw.getAll()
          }
        })
        .then(data => {
          let promises = []
          data.forEach(item => {
            const layerid = item.id.split('#')
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
            this.items = data.map(item => {
              let temp = { ...item }
              temp.name = item.id
              const layerid = item.id.split('#')
              if (layerid.length > 1) {
                const kode = layerid[0]
                const name = layerid[1]
                temp.name = name
                const kodetabel = this.getCode(kode)
                if (kodetabel.hasOwnProperty(name)) {
                  temp.name = kodetabel[name].name
                  if (!temp.name) {
                    temp.name = name
                  }
                }
              } else {
                const layer = this.getLayer(item.id)
                if (layer) {
                  temp.name = layer.name
                }
              }
              return temp
            })
            this.dialog = true
          })
        })
        .catch(err => {
          console.log(err)
        })
    },
    activate () {
      console.log('activate Mængdeberegning')
      setTimeout(() => {
        this.map.controls.draw = new MapboxDraw({
          displayControlsDefault: false,
          controls: {
            polygon: true,
            trash: true
          }
        })
        this.map.addControl(this.map.controls.draw)
      }, 1000)
    },
    deactivate () {
      console.log('deactivate Mængdeberegning')
      if (this.map && this.map.controls && this.map.controls.draw) {
        this.map.controls.draw.deleteAll().trash()
        this.map.removeControl(this.map.controls.draw)
      }
    }
  },
  computed: {
    ...mapGetters('code-tables', {
      codeTables: 'list'
    }),
    ...mapGetters('code-tables', {
      getCode: 'get'
    }),
    ...mapGetters('layers', {
      getLayer: 'get'
    }),
    listArea () {
      let sum = {name: 'Total', st_area: 0, st_perimeter: 0, half: 0}
      let items = this.items.filter(item => {
        if (item.st_geometrytype === 'ST_Polygon') {
          sum.st_area += item.st_area
          sum.st_perimeter += item.st_perimeter
          sum.half += item.st_perimeter / 2
          return true
        }
        return false
      })
      items = items.map(item => {
        return {...item, half: item.st_perimeter / 2}
      })
      items.push(sum)
      return items
    },
    listLength () {
      let sum = 0
      let items = this.items.filter(item => {
        if (item.st_geometrytype === 'ST_LineString') {
          sum += item.st_length
          return true
        }
        return false
      })
      items.push({ name: 'Total', st_length: sum })
      return items
    },
    listCount () {
      let sum = 0
      let items = this.items.filter(item => {
        if (item.st_geometrytype === 'ST_Point') {
          sum += item.antal
          return true
        }
        return false
      })
      items.push({ name: 'Total', antal: sum })
      return items
    }
  },
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
.sum {
  tr {
    &:last-child {
      td {
        font-weight: bold;
      }
    }
  }
}
</style>
