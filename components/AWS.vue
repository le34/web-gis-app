<template>

  <v-card :color="$vuetify.dark?'blue-grey':'blue-grey lighten-4'" style="width:300px">
    <v-toolbar dense card dark color="accent" class="px-1">
      <v-text-field ref="awsInput" spellcheck="false" autofocus append-icon="search" label="Søg adresse" single-line hide-details v-model="search"></v-text-field>
    </v-toolbar>
    
      <v-list dense light v-scroll:#scroll-target="onScroll" id="scroll-target" ref="awslist" class="pa-0 aws-list">            
        <template v-for="(item, index) in items">
          <v-list-tile :key="index" class="legend" @click="click(item)">
              <v-list-tile-content>
                <v-list-tile-title>
                  {{item.tekst}}
                </v-list-tile-title>
              </v-list-tile-content>                
          </v-list-tile>
          <v-divider :key="`d${index}`" v-if="index<items.length-1"></v-divider>
        </template>            
      </v-list>
  
  </v-card>
   
</template>
<script>
import { mapGetters } from 'vuex'
export default {
  props: ['map', 'active'],
  data () {
    return {
      dialog: false,
      loading: false,
      selected: null,
      items: [],
      page: 0,
      searchstring: null,
      tekst: null,
      type: 'vejnavne'
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
    click (item) {
      if (this.type === 'vejnavne') {
        this.tekst = item.tekst
        this.type = 'adgangsadresser'
        this.search = item.tekst + ' '
        this.$refs.awsInput.$el.getElementsByTagName('input')[0].focus()
      } else {
        this.$axios.get(item.adgangsadresse.href).then(res => {
          this.map.flyTo({center: res.data.adgangspunkt.koordinater, zoom: 20})
        })
      }
    },
    activate () {
      // this.dialog = true
      setTimeout(() => {
        console.log('activate aws')
      }, 1000)
    },
    deactivate () {
      // this.dialog = false
      console.log('deactivate aws')
    },
    onScroll (e) {
      let h = e.target.scrollHeight - e.target.clientHeight
      // console.log(this.page, h, e.target.scrollTop, h - e.target.scrollTop)
      if (!this.loading && (h - e.target.scrollTop < 100)) {
        /*
        console.log('load', this.page, e)
        console.log(e.target.scrollHeight)
        console.log(e.target.clientHeight)
        console.log(e.target.scrollTop)
        */
        this.page++
        this.loading = true
        this.$axios.get(`https://dawa.aws.dk/${this.type}/autocomplete?side=${this.page}&per_side=50&q=${this.searchstring}*`).then((res) => {
          if (res.data.length > 0) {
            res.data.forEach(item => {
              this.items.push(item)
            })
            this.loading = false
          }
        })
      }
    }
  },
  computed: {
    ...mapGetters('layers', {
      layers: 'list'
    }),
    search: {
      get () {
        return this.searchstring
      },
      set (value) {
        if (value.length === 0) {
          this.type = 'vejnavne'
          this.items = []
        } else {
          if (this.tekst && this.tekst.length > value.length) {
            this.type = 'vejnavne'
          }
          this.searchstring = value
          this.page = 1
          this.loading = true
          this.$refs.awslist.$el.scrollTo(0, 0)
          this.$axios.get(`https://dawa.aws.dk/${this.type}/autocomplete?side=${this.page}&per_side=50&q=${this.searchstring}*`).then((res) => {
            if (res.data.length === 0 && this.type === 'vejnavne') {
              this.type = 'adgangsadresser'
              this.tekst = value
              this.search = value
            } else {
              this.items = res.data
              this.loading = false
            }
          })
        }
      }
    }
  },
  mounted () {}
}
</script>
<style scoped lang="stylus">
.aws-list
  height 200px
  overflow-y scroll
</style>
