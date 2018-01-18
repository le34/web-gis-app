<template>
  <div>
    <v-content>
      <v-container fluid grid-list-md class="grey lighten-4">
        <v-layout row wrap>
          <v-flex
            v-bind="{ [`xs${card.flex}`]: true }"
            v-for="card in cards"
            :key="card.title"
          >
            <v-card :to="card.link">
              <v-card-media
                :src="card.src"
                height="200px"
              >
                <v-container fill-height fluid>
                  <v-layout fill-height>
                    <v-flex xs12 align-end flexbox>
                      <span class="headline white--text" v-text="card.title"></span>
                    </v-flex>
                  </v-layout>
                </v-container>
              </v-card-media>              
            </v-card>
          </v-flex>
        </v-layout>
      </v-container>
    </v-content>
    <v-footer app height="150" dark class="white--text">
      <v-layout row wrap>
        <v-flex class="pa-3">
          <strong>LE34</strong><br/> Energivej 34<br/> 2750 Ballerup<br/> Denmark
          <br/> CVR 20683880
        </v-flex>
        <v-flex class="pa-3">
          <strong>Contact</strong><br/> Rune Tvilum<br/>
          <a href="mailto:rut@le34.dk?Subject=Visualize%20data%on %20web">rut@le34.dk</a><br/> +45 21 93 27 03
        </v-flex>
      </v-layout>
    </v-footer>
  </div>
</template>
<script>
export default {
  head () {
    return {
      title: this.title
    }
  },
  data () {
    return {
      cards: [
        { title: 'Drone data', link: '/demo/drone', src: 'drone.png', flex: 12 },
        { title: 'Heatmap', link: '/demo/heatmap', src: 'heatmap.png', flex: 6 },
        { title: 'Hexbins ', link: '/demo/hexbins', src: 'hexbins.png', flex: 6 }
      ]
    }
  },
  computed: {},
  methods: {},
  watch: {},
  mounted () {},
  fetch ({ store }) {}
}
</script>
<style scoped lang="stylus">
a {
  text-decoration: none;
  color: white;
}
</style>
