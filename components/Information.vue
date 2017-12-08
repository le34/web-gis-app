<template>
  <v-card :color="$vuetify.dark?'blue-grey':'blue-grey lighten-4'">
    <v-card-text>Klik på et element i kortet for at se information om elementet.</v-card-text>
    <v-dialog max-width="500px" scrollable v-model="dialog" :fullscreen="$vuetify.breakpoint.xsOnly" lazy>
      <v-card color="blue-grey lighten-4">
        <v-toolbar card dark color="accent">
          <v-toolbar-title>{{feature ? feature.name : ''}}</v-toolbar-title>
          <v-spacer/>
          <v-btn dark flat icon @click.native="dialog = false">
            <v-icon>close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text light class="pa-0">
          <v-data-table light v-bind:headers="headers" :items="items" hide-actions>
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
                <v-pagination color="accent" v-model="pagination" :length="features.length"></v-pagination>
              </div>
            </v-flex>
          </v-layout>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>
<script>
import { mapGetters } from 'vuex'
export default {
  props: ['map', 'active'],
  data () {
    return {
      dialog: false,
      headers: [
        {
          text: 'Name',
          align: 'left',
          sortable: true,
          value: 'name'
        },
        {
          text: 'Value',
          align: 'left',
          sortable: false,
          value: 'value'
        }
      ],
      features: [],
      pagination: 0
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
  fetch ({ store }) {},
  methods: {
    mousemove (e) {
      const width = 10
      const height = 10
      var features = this.map.queryRenderedFeatures(
        [
          [e.point.x - width / 2, e.point.y - height / 2],
          [e.point.x + width / 2, e.point.y + height / 2]
        ],
        {
          // layers: keys
        }
      )
      this.map.getCanvas().style.cursor = features.length ? 'pointer' : ''
    },
    click (e) {
      const width = 10
      const height = 10
      e.originalEvent.stopPropagation()
      this.pagination = 0
      this.features = 0
      let temp = this.map.queryRenderedFeatures(
        [
          [e.point.x - width / 2, e.point.y - height / 2],
          [e.point.x + width / 2, e.point.y + height / 2]
        ],
        {
          // layers: keys
        }
      )
      console.log(temp)
      if (temp.length > 0) {
        this.dialog = true
        this.features = temp
        this.pagination = 1
      }
    },
    activate () {
      setTimeout(() => {
        console.log('activate information')
        this.map.on('mousemove', this.mousemove)
        this.map.on('click', this.click)
      }, 1000)
    },
    deactivate () {
      console.log('deactivate information')
      this.map.off('mousemove', this.mousemove)
      this.map.off('click', this.click)
    }
  },
  computed: {
    ...mapGetters('layers', {
      layers: 'list'
    }),
    feature () {
      if (this.pagination !== undefined && this.features.length > 0) {
        let item = this.features[this.pagination - 1]
        const group = this.layers.find(group => {
          return group.id === item.layer.source
        })
        if (group !== undefined) {
          const layer = group.layers.find(layer => {
            return layer.id === item.layer.id
          })
          if (layer !== undefined) {
            item.name = layer.name
          }
        }
        return item
      }
    },
    items: function () {
      let items = []
      if (this.feature) {
        Object.keys(this.feature.properties).forEach(key => {
          items.push({ name: key, value: this.feature.properties[key] })
        })
      }
      return items
    }
  },
  mounted () {}
}
</script>
<style scoped lang="stylus">
</style>
