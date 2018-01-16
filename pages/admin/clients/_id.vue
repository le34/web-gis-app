<template>
  <v-content>
    <v-toolbar app fixed prominent dark color="secondary">
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <img src="/icon.png" height="63" @click="$router.push('/')" style="cursor: pointer"/>
      <v-toolbar-title>{{title}}</v-toolbar-title>
    </v-toolbar>
    <v-container fluid>
      {{client}}
      <v-card>
        <v-card-title primary-title class="title">
          Project
        </v-card-title>
        <v-card-text>
          <v-text-field v-model="name" required name="name" label="Name" id="name"></v-text-field>
          <v-select v-model="companyId" item-text="name" item-value="id" :items="companies" label="Company"></v-select>
          <v-checkbox label="Public" v-model="isPublic"></v-checkbox>
        </v-card-text>
        <v-card-actions>
          <v-layout row wrap>
            <v-flex>
              <v-btn flat :to="{ name: 'admin-projects-id-clients', params: { id: $route.params.id } }">
                <v-icon left>person</v-icon>
                  Clients
              </v-btn>
            </v-flex>
            <v-flex>
              <v-btn flat :to="{ name: 'admin-companies-id-projects', params: { id: $route.params.id } }">
                <v-icon left>assignment</v-icon>
                  Styles
              </v-btn>
            </v-flex>
          </v-layout>
          <v-spacer/>
          <v-btn flat color="primary" @click.stop="dialogRemove = true">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-container>
    <v-dialog v-model="dialogRemove" persistent max-width="500">
      <v-card>
        <v-card-title>
          <div class="headline">Delete</div>
        </v-card-title>
        <v-card-text>Delete project?</v-card-text>
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
export default {
  head () {
    return {
      title: this.title
    }
  },
  data () {
    return {
      dialogRemove: false
    }
  },
  methods: {
    remove () {
      this.dialogRemove = true
      this.$store.dispatch('projects/remove', this.$route.params.id).then(res => {
        this.$router.push('/admin/projects')
      }).catch(err => {
        console.log(err)
      })
    }
  },
  computed: {
    title () {
      return this.client ? this.client.id : 'Client'
    },
    ...mapGetters('clients', {
      getClient: 'get'
    }),
    client () {
      return this.getClient(this.$route.params.id)
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
    this.$store.dispatch('clients/get', this.$route.params.id)
  }
}
</script>
<style scoped lang="stylus">
.select {
  cursor: pointer;
}
</style>