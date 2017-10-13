<template>
  <v-content>
    <v-container fluid grid-list-md>
      <v-layout row wrap>
        <v-flex xs12 sm6 d-flex>
          <v-card>
            <v-toolbar card class="grey darken-3 white--text">
              <v-toolbar-title>
                <v-icon dark>border_all</v-icon> Tiles</v-toolbar-title>
            </v-toolbar>
            <v-card-text>
              <p>Vector tiles gemes i en sqlite database i en struktur defineret ved mbtiles formatet.</p>
            </v-card-text>
            <v-card-actions>
              <v-spacer/>
              <v-btn nuxt to="tiles" flat primary>Administrer tiles</v-btn>
            </v-card-actions>
          </v-card>
        </v-flex>
        <v-flex xs12 sm6 d-flex>
          <v-card>
            <v-toolbar card class="grey darken-3 white--text">
              <v-toolbar-title>
                <v-icon dark>brush</v-icon> Styles</v-toolbar-title>
            </v-toolbar>
            <v-card-text full-height>
              <p>En style definere hvilke lag der skal være i kortet og hvordan de skal præsenteres visuelt.</p>
            </v-card-text>
            <v-card-actions>
              <v-spacer/>
              <v-btn nuxt to="styles" flat color="primary">Administrer styles</v-btn>
            </v-card-actions>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
  </v-content>
</template>
<script>
export default {
  data () {
    return {
    }
  },
  methods: {
  },
  computed: {
  },
  watch: {
  },
  mounted () {
  },
  fetch ({ store }) {
  }
}
</script>
<style scoped lang="stylus">
</style>