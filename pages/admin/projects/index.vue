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
          <span>Create</span>
        </v-tooltip>
        <v-tooltip left>
          <v-btn fab dark small color="red" slot="activator" @click.stop="dialogDelete = true">
            <v-icon>delete</v-icon>
          </v-btn>
          <span>Delete</span>
        </v-tooltip>
      </v-speed-dial>
    </v-fab-transition>
    <v-toolbar app fixed prominent dark color="secondary">
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <img src="/icon.png" height="63" @click="$router.push('/')" style="cursor: pointer"/>
      <v-toolbar-title>{{title}}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon v-if="!showSearch && $vuetify.breakpoint.xsOnly" @click.stop="showSearch=!showSearch;focus()">
        <v-icon>search</v-icon>
      </v-btn>
      <v-text-field autofocus v-if="!$vuetify.breakpoint.xsOnly" dark append-icon="search" label="Search" single-line hide-details v-model="search"></v-text-field>
      <v-text-field ref="searchfield" prepend-icon="close" :prepend-icon-cb="() => (showSearch = !showSearch)" v-if="$vuetify.breakpoint.xsOnly && showSearch" slot="extension" dark append-icon="search" label="Søg" single-line hide-details v-model="search"></v-text-field>
    </v-toolbar>
    <v-data-table v-model="selected" selected-key="id" select-all :headers="headers" :items="projects" :search="search" hide-actions :custom-filter="customSearch">
      <template slot="items" scope="props">
        <td>
          <v-checkbox primary hide-details v-model="props.selected"></v-checkbox>
        </td>
        <td>
          <v-btn icon @click.stop="edit(props.item)"><v-icon>edit</v-icon></v-btn>
        </td>
        <td @click.stop="$router.push({ name: 'admin-projects-id', params: { id: props.item.id } })" class="text-xs-left select">{{ props.item.name }}</td>
        <td @click.stop="$router.push({ name: 'admin-companies-id-projects', params: { id: props.item.companyId } })" class="text-xs-left select">{{ props.item['company.name'] }}</td>
        <td @click.stop="$router.push({ name: 'admin-projects-id', params: { id: props.item.id } })" class="text-xs-left select">{{ props.item.public }}</td>        
        <td @click.stop="$router.push({ name: 'admin-projects-id', params: { id: props.item.id } })" class="text-xs-left select">{{ props.item.updatedAt | date }}</td>          
        <td @click.stop="$router.push({ name: 'admin-users-id', params: { id: props.item.userId } })" class="text-xs-left select">{{ props.item['user.email'] }}</td>
      </template>
    </v-data-table>
    <v-dialog v-model="dialog" persistent max-width="500">
      <v-form v-model="valid" ref="form" @submit.prevent>
        <v-card>
          <v-card-title>
            <div class="headline">Create new Project</div>
          </v-card-title>
          <v-card-text>
            <v-text-field ref="name" :rules="nameRules" required v-model="name" name="name" label="Name" id="name"></v-text-field>
            <v-select required :rules="companyRules" v-model="companyId" item-text="name" item-value="id" :items="companies" label="Select company"></v-select>
            <v-checkbox label="Public?" v-model="isPublic"></v-checkbox>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" flat @click.native="dialog = false">Cancel</v-btn>
            <v-btn type="submit" color="primary" @click.stop="save()">Save</v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
    <v-dialog v-model="dialogEdit" persistent max-width="500">
      <v-form v-model="validEdit" ref="formEdit" @submit.prevent>
        <v-card>
          <v-card-title>
            <div class="headline">Edit Project</div>
          </v-card-title>
          <v-card-text>
            <v-text-field ref="name" :rules="nameRules" required v-model="itemEdit.name" name="name" label="Name" id="name"></v-text-field>
            <v-select required :rules="companyRules" v-model="itemEdit.companyId" item-text="name" item-value="id" :items="companies" label="Select company"></v-select>
            <v-checkbox label="Public?" v-model="itemEdit.public"></v-checkbox>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" flat @click.native="dialogEdit = false">Cancel</v-btn>
            <v-btn type="submit" color="primary" @click.stop="patch()">Save</v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
    <v-dialog v-model="dialogDelete" persistent max-width="500" >
      <v-card>
        <v-card-title>
          <div class="headline">Delete Project</div>
        </v-card-title>
        <v-card-text>Delete selected project?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" flat="flat" @click.native="dialogDelete = false">Cancel</v-btn>
          <v-btn color="primary" flat="flat" @click.native="deleteData()">Delete</v-btn>
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
      title: 'Projects',
      name: null,
      companyId: null,
      isPublic: false,
      valid: false,
      validEdit: false,
      fab: false,
      showSearch: false,
      nameRules: [v => !!v || 'Name is required'],
      companyRules: [(v) => !!v || 'Company is required'],
      dialog: false,
      dialogDelete: false,
      dialogEdit: false,
      itemEdit: {},
      search: '',
      selected: [],
      headers: [
        {
          text: 'Edit',
          align: 'left',
          sortable: false
        },
        {
          text: 'Name',
          align: 'left',
          sortable: true,
          value: 'name'
        },
        {
          text: 'Company',
          align: 'left',
          sortable: true,
          value: 'company.name'
        },
        {
          text: 'Public',
          align: 'left',
          sortable: true,
          value: 'public'
        },
        {
          text: 'Updated At',
          align: 'left',
          sortable: true,
          value: 'updatedAt'
        },
        {
          text: 'Updated By',
          align: 'left',
          sortable: true,
          value: 'user.email'
        }
      ]
    }
  },
  filters: {
    date (value) {
      return (new Date(value)).toLocaleString()
    }
  },
  methods: {
    customSearch (items, search, filter, headers) {
      search = search.toString().toLowerCase()
      if (search.trim() === '') return items
      const props = headers.map(h => h.value)
      return items.filter(item => props.some(prop => filter(item[prop], search)))
    },
    edit (item) {
      this.itemEdit = { ...item }
      this.dialogEdit = true
    },
    patch () {
      if (this.validEdit) {
        this.$store.dispatch('projects/patch', [this.itemEdit.id, { name: this.itemEdit.name, public: this.itemEdit.public, companyId: this.itemEdit.companyId }]).then(res => {
          this.itemEdit = {}
          this.$refs.formEdit.reset()
          this.dialogEdit = false
        }).catch(err => {
          console.log('error', err)
          this.message = err
        })
      }
    },
    focus () {
      this.$nextTick(() =>
        this.$refs.searchfield.$el.getElementsByTagName('input')[0].focus()
      )
    },
    create () {
      this.dialog = true
      this.$nextTick(() => this.$refs.name.$el.getElementsByTagName('input')[0].focus())
    },
    deleteData () {
      this.dialogDelete = true
      this.selected.forEach(item => {
        this.$store
          .dispatch('projects/remove', item.id)
          .then(res => {
            this.dialogDelete = false
          })
          .catch(err => {
            console.log(err)
          })
      })
    },
    save () {
      if (this.valid) {
        this.$store
          .dispatch('projects/create', {
            name: this.name,
            public: this.isPublic,
            companyId: this.companyId
          })
          .then(res => {
            this.$refs.form.reset()
            this.dialog = false
          })
          .catch(err => {
            console.log('error', err)
            this.message = err
          })
      }
    }
  },
  computed: {
    ...mapGetters('projects', {
      projects: 'list'
    }),
    ...mapGetters('companies', {
      companies: 'list'
    }),
    drawer: {
      get () {
        return this.$store.state.drawer
      },
      set (value) {
        this.$store.commit('drawer', value)
      }
    }
  },
  watch: {},
  mounted () {
    this.$store.dispatch('projects/find')
    this.$store.dispatch('companies/find')
  }
}
</script>
<style scoped lang="stylus">
.select {
  cursor: pointer;
}
</style>