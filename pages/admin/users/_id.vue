<template>
  <v-content>
    <v-toolbar app fixed prominent dark color="secondary">
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <img src="/icon.png" height="63" @click="$router.push('/')" style="cursor: pointer" />
      <v-toolbar-title>{{title}}</v-toolbar-title>
    </v-toolbar>
    <v-container fluid>
      <v-card>
        <v-card-title>
          <h6>User</h6>
        </v-card-title>
        <v-card-text>
          <v-text-field v-model="email" required name="email" label="Email" id="email"></v-text-field>
          <v-select required item-text="name" item-value="id" :items="companies" v-model="companyId" label="Company"></v-select>
          <v-select required item-text="name" item-value="id" :items="roles" v-model="roleId" label="Role"></v-select>
        </v-card-text>
        <v-card-actions>
          <v-spacer/>
          <v-btn color="primary" @click.stop="dialogDelete = true">Delete</v-btn>
        </v-card-actions>
      </v-card>
      <v-dialog v-model="dialogDelete" persistent max-width="500">
        <v-card>
          <v-card-title>
            <div class="headline">Delete User</div>
          </v-card-title>
          <v-card-text>Delete User?</v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" flat="flat" @click.native="dialogDelete = false">Cancel</v-btn>
            <v-btn color="primary" flat="flat" @click.native="deleteUser()">Delete</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
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
      title: 'User',
      dialogDelete: false
    }
  },
  methods: {
    deleteUser (item) {
      this.$store.dispatch('users/remove', this.$route.params.id).then(() => {
        this.$router.push({ name: 'admin-users' })
      })
    }
  },
  computed: {
    ...mapGetters('users', {
      getUser: 'get'
    }),
    ...mapGetters('companies', {
      companies: 'list'
    }),
    ...mapGetters('roles', {
      roles: 'list'
    }),
    drawer: {
      get () {
        return this.$store.state.drawer
      },
      set (value) {
        this.$store.commit('drawer', value)
      }
    },
    email: {
      get () {
        return this.user ? this.user.email : null
      },
      set (e) {
        this.$store.dispatch('users/patch', [
          this.$route.params.id,
          { email: e }
        ])
      }
    },
    companyId: {
      get () {
        return this.user ? this.user.companyId : null
      },
      set (e) {
        this.$store.dispatch('users/patch', [
          this.$route.params.id,
          { companyId: e }
        ])
      }
    },
    roleId: {
      get () {
        return this.user ? this.user.roleId : null
      },
      set (e) {
        this.$store.dispatch('users/patch', [
          this.$route.params.id,
          { roleId: e }
        ])
      }
    },
    user () {
      return this.getUser(this.$route.params.id)
    }
  },
  watch: {},
  mounted () {
    this.$store.dispatch('users/get', this.$route.params.id)
    this.$store.dispatch('companies/find')
    this.$store.dispatch('roles/find')
  }
}
</script>
<style scoped lang="stylus">
</style>