<template>
  <v-content>
    <v-fab-transition>
      <v-speed-dial hover bottom fixed right v-model="fab" v-show="!dialog">
        <v-btn slot="activator" color="blue darken-2" dark fab hover v-model="fab">
          <v-icon>more_vert</v-icon>
          <v-icon>close</v-icon>
        </v-btn>
        <v-tooltip left>
          <v-btn fab dark small color="green" slot="activator" @click.stop="create()">
            <v-icon>add</v-icon>
          </v-btn>
          <span>Opret ny</span>
        </v-tooltip>
        <v-tooltip left>
          <v-btn fab dark small color="red" slot="activator" @click.stop="dialogDeleteUsers = true">
            <v-icon>delete</v-icon>
          </v-btn>
          <span>Slet valgte</span>
        </v-tooltip>
      </v-speed-dial>
    </v-fab-transition>
    <v-toolbar app fixed prominent dark color="secondary">
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <img src="/icon.png" height="63" @click="$router.push('/')" style="cursor: pointer"/>
      <v-btn icon :to="{ name: 'admin-companies-id', params: { id: $route.params.id } }">
        <v-icon>chevron_left</v-icon>
      </v-btn>
      <v-toolbar-title>{{title}}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon v-if="!showSearch && $vuetify.breakpoint.xsOnly" @click.stop="showSearch=!showSearch;focus()">
        <v-icon>search</v-icon>
      </v-btn>
      <v-text-field autofocus v-if="!$vuetify.breakpoint.xsOnly" dark append-icon="search" label="Search" single-line hide-details v-model="search"></v-text-field>
      <v-text-field ref="searchfield" prepend-icon="close" :prepend-icon-cb="() => (showSearch = !showSearch)" v-if="$vuetify.breakpoint.xsOnly && showSearch" slot="extension" dark append-icon="search" label="Søg" single-line hide-details v-model="search"></v-text-field>
    </v-toolbar>
    <v-data-table v-model="selected" selected-key="id" select-all :headers="headers" :items="users" :search="search" hide-actions>
      <template slot="items" scope="props">
        <td>
          <v-checkbox primary hide-details v-model="props.selected"></v-checkbox>
        </td>
        <td @click.stop="$router.push({name: 'admin-users-id', params: {id: props.item.id}})" class="text-xs-left select">{{ props.item.email }}</td>
        <td class="text-xs-left select">{{ props.item.role }}</td>
        <td @click.stop="editCompany(props.item)" class="text-xs-left select">{{ props.item['company.data'].name }}</td>
      </template>
    </v-data-table>
    <v-dialog v-model="dialog" persistent max-width="500">
      <v-form v-model="valid" ref="form" @submit.prevent>
        <v-card>
          <v-card-title>
            <div class="headline">Create new user</div>
          </v-card-title>
          <v-card-text>
            <v-text-field ref="email" :rules="emailRules" required v-model="email" name="email" label="Email" id="email"></v-text-field>
            <v-select :rules="rolesRules" required item-text="role" item-value="role" :items="roles" v-model="role" label="Role"></v-select>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" flat @click.native="dialog = false">Cancel</v-btn>
            <v-btn type="submit" color="primary" @click.stop="save()">Save</v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
    <v-dialog v-model="dialogDeleteUsers" persistent max-width="500">
      <v-card>
        <v-card-title>
          <div class="headline">Delete user</div>
        </v-card-title>
        <v-card-text>Delete selected users?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" flat="flat" @click.native="dialogDeleteUsers = false">Cancel</v-btn>
          <v-btn color="primary" flat="flat" @click.native="deleteUsers()">Delete</v-btn>
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
      valid: false,
      fab: false,
      showSearch: false,
      role: null,
      email: null,
      emailRules: [
        (v) => !!v || 'Email er påkrævet',
        (v) => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) || 'E-mail must be valid'
      ],
      rolesRules: [(v) => !!v || 'Role is required'],
      dialog: false,
      dialogDeleteUsers: false,
      search: '',
      selected: [],
      headers: [
        {
          text: 'Email',
          align: 'left',
          sortable: true,
          value: 'email'
        },
        {
          text: 'Role',
          align: 'left',
          sortable: true,
          value: 'role'
        },
        {
          text: 'Company',
          align: 'left',
          sortable: true,
          value: 'company'
        }
      ]
    }
  },
  methods: {
    focus () {
      this.$nextTick(() => this.$refs.searchfield.$el.getElementsByTagName('input')[0].focus())
    },
    create () {
      this.dialog = true
      this.$nextTick(() => this.$refs.email.$el.getElementsByTagName('input')[0].focus())
    },
    deleteUsers () {
      this.dialogDeleteUsers = true
      this.selected.forEach(user => {
        this.$store.dispatch('users/remove', user.id).then(res => {
          this.dialogDeleteUsers = false
        }).catch(err => {
          console.log(err)
        })
      })
    },
    save () {
      if (this.valid) {
        this.$store.dispatch('users/create', { email: this.email, role: this.role, companyId: this.$route.params.id }).then((res) => {
          this.email = null
          this.role = null
          this.dialog = false
          this.$refs.form.reset()
        }).catch(err => {
          console.log('error', err)
          this.message = err
        })
      }
    }
  },
  computed: {
    ...mapGetters('users', {
      usersRaw: 'list'
    }),
    ...mapGetters('companies', {
      getCompany: 'get'
    }),
    ...mapGetters('roles', {
      roles: 'list'
    }),
    company () {
      return this.getCompany(this.$route.params.id)
    },
    title () {
      return this.company ? this.company.data.name + ' - Users' : 'Users'
    },
    drawer: {
      get () {
        return this.$store.state.drawer
      },
      set (value) {
        this.$store.commit('drawer', value)
      }
    },
    users () {
      return this.usersRaw.filter(item => {
        return item.companyId === this.$route.params.id
      })
    }
  },
  watch: {
  },
  mounted () {
    this.$store.dispatch('users/find', { query: { companyId: this.$route.params.id } })
    this.$store.dispatch('companies/find', { query: { id: this.$route.params.id } })
    this.$store.dispatch('roles/find')
  }
}
</script>
<style scoped lang="stylus">
.select {
  cursor: pointer;
}
</style>