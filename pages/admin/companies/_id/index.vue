<template>
  <v-content>
    <v-toolbar app fixed prominent dark color="secondary">
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <img src="/icon.png" height="63" @click="$router.push('/')" style="cursor: pointer"/>
      <v-toolbar-title>{{title}}</v-toolbar-title>
    </v-toolbar>
    <v-container fluid>
      <v-card>
        <v-card-text>
          <v-text-field v-model="name" required name="name" label="Name" id="name"></v-text-field>
          <v-text-field v-model="cvr" required name="cvr" label="CVR" id="cvr"></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-layout row wrap>
            <v-flex>
              <v-btn flat :to="{ name: 'admin-companies-id-users', params: { id: $route.params.id } }">
                <v-icon left>person</v-icon>
                  Users
              </v-btn>
            </v-flex>
            <v-flex>
              <v-btn flat :to="{ name: 'admin-companies-id-projects', params: { id: $route.params.id } }">
                <v-icon left>assignment</v-icon>
                  Projects
              </v-btn>
            </v-flex>
          </v-layout>
          <v-spacer/>
          <v-btn flat color="primary" @click.native.stop="alert = true">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-container>
  </v-content>
</template>
<script>
import { mapGetters } from 'vuex'
export default {
  head () {
    return {
      title: this.title
    }
  },
  data () {
    return {

    }
  },
  methods: {},
  computed: {
    title () {
      return this.company ? this.company.name : 'Company'
    },
    ...mapGetters('companies', {
      getCompany: 'get'
    }),
    company () {
      return this.getCompany(this.$route.params.id)
    },
    name: {
      get () {
        return this.company ? this.company.name : null
      },
      set (e) {
        this.$store.dispatch('company/patch', [this.company.id, { name: e }])
      }
    },
    cvr: {
      get () {
        return this.company ? this.company.cvr : null
      },
      set (e) {
        this.$store.dispatch('company/patch', [this.company.id, { cvr: e }])
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
    this.$store.dispatch('companies/get', this.$route.params.id)
  }
}
</script>
<style scoped lang="stylus">
.select {
  cursor: pointer;
}
</style>