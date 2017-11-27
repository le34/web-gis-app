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
          <v-text-field v-model="cvrno" required name="cvr" label="CVR" id="cvr"></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-layout row wrap>
            <v-flex>
              <v-btn flat :to="{ name: 'admin-company-id-users', params: { id: $route.params.id } }">
                <v-icon left>person</v-icon>
                <v-badge right>
                  Users
                  <span slot="badge">{{users}}</span>
                </v-badge>
              </v-btn>
            </v-flex>
            <v-flex>
              <v-btn flat :to="{ name: 'admin-company-id-clients', params: { id: $route.params.id } }">
                <v-icon left>business</v-icon>
                <v-badge right>
                  Clients
                  <span slot="badge">{{clients}}</span>
                </v-badge>
              </v-btn>
            </v-flex>
            <v-flex>
              <v-btn flat :to="{ name: 'admin-company-id-project', params: { id: $route.params.id } }">
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
  data () {
    return {

    }
  },
  methods: {},
  computed: {
    title () {
      return this.company ? this.company.data.name : 'Company'
    },
    ...mapGetters('users', {
      usersRaw: 'list'
    }),
    ...mapGetters('company', {
      companyRaw: 'list',
      getCompany: 'get'
    }),
    users () {
      const items = this.usersRaw.filter(item => {
        return item.companyId === this.$route.params.id
      })
      return items.length
    },
    company () {
      return this.getCompany(this.$route.params.id)
    },
    name: {
      get () {
        return this.company ? this.company.data.name : null
      },
      set (e) {
        let data = { ...this.company.data }
        data.name = e
        this.$store
          .dispatch('company/patch', [this.company.id, { data }])
          .then(res => {
            console.log(res)
          })
          .catch(err => {
            console.log('error', err)
          })
      }
    },
    cvrno: {
      get () {
        return this.company ? this.company.data.cvrno : null
      },
      set (e) {
        let data = { ...this.company.data }
        data.cvrno = e
        this.$store
          .dispatch('company/patch', [this.company.id, { data }])
          .then(res => {
            console.log(res)
          })
          .catch(err => {
            console.log('error', err)
          })
      }
    },
    clients () {
      return this.company && this.company.data.clients
        ? this.company.data.clients.length
        : 0
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
    this.$store
      .dispatch('company/find', { query: { id: this.$route.params.id } })
      .then(res => {})
      .catch(err => {
        console.log(err)
      })
    this.$store
      .dispatch('users/find', { query: { companyId: this.$route.params.id } })
      .then(res => {
        // this.users = res.total
      })
      .catch(err => {
        console.log(err)
      })
  }
}
</script>
<style scoped lang="stylus">
.select {
  cursor: pointer;
}
</style>