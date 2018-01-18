<template>
  <v-content>
    <v-speed-dial open-on-hover bottom fixed right v-model="fab">
      <v-btn slot="activator" color="blue darken-2" dark fab hover v-model="fab">
        <v-icon>more_vert</v-icon>
        <v-icon>close</v-icon>
      </v-btn>
      <v-tooltip left>
        <v-btn fab dark small color="green" slot="activator" @click.stop="dialog = true">
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
    <v-data-table v-model="selected" selected-key="id" select-all :headers="headers" :items="layers" :search="search" hide-actions :custom-filter="customSearch">
      <template slot="items" scope="props">
        <td>
          <v-checkbox primary hide-details v-model="props.selected"></v-checkbox>
        </td>
        <td @click.stop="$router.push({ name: 'admin-layers-id', params: { id: props.item.id } })" class="text-xs-left select">{{ props.item.priority }}</td>        
        <td @click.stop="$router.push({ name: 'admin-layers-id', params: { id: props.item.id } })" class="text-xs-left select">{{ props.item.name }}</td>
        <td @click.stop="$router.push({ name: 'admin-layers-id', params: { id: props.item.id } })" class="text-xs-left select">{{ props.item.active }}</td>
        <td @click.stop="$router.push({ name: 'admin-styles-id', params: { id: props.item.styleId } })" class="text-xs-left select">{{ props.item['style.name'] }}</td>        
        <td @click.stop="$router.push({ name: 'admin-layers-id', params: { id: props.item.id } })" class="text-xs-left select">{{ props.item.isBasemap }}</td>
        <td @click.stop="$router.push({ name: 'admin-layers-id', params: { id: props.item.id } })" class="text-xs-left select">{{ props.item.isDark }}</td>
        <td @click.stop="$router.push({ name: 'admin-layers-id', params: { id: props.item.id } })" class="text-xs-left select">{{ props.item.updatedAt | date }}</td>
        <td @click.stop="$router.push({ name: 'admin-users-id', params: { id: props.item.userId } })" class="text-xs-left select">{{ props.item['user.email'] }}</td>
      </template>
    </v-data-table>
    <v-dialog v-model="dialog" persistent max-width="500">
      <v-form v-model="valid" ref="form" @submit.prevent>
        <v-card>
          <v-card-title>
            <div class="headline">Add Layer</div>
          </v-card-title>
          <v-card-text>            
            <v-select autocomplete v-model="companyId" item-text="name" item-value="id" :items="companies" label="Select company"></v-select>
            <v-select v-model="projectId" item-text="name" item-value="id" :items="projects" label="Select project"></v-select>
            <v-select v-model="style" item-text="name" :items="styles" label="Select style"></v-select>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" flat @click.native="dialog = false">Cancel</v-btn>
            <v-btn type="submit" color="primary" @click.stop="save()">Save</v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
    <v-dialog v-model="dialogDelete" persistent max-width="500">
      <v-card>
        <v-card-title>
          <div class="headline">Delete Overlay</div>
        </v-card-title>
        <v-card-text>Delete selected overlays?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" flat="flat" @click.native="dialogDelete = false">Cancel</v-btn>
          <v-btn color="primary" flat="flat" @click.native="deleteLayers()">Delete</v-btn>
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
      fab: false,
      showSearch: false,
      dialog: false,
      dialogDelete: false,
      search: '',
      valid: false,
      selected: [],
      style: null,
      projects: [],
      datasources: [],
      styles: [],
      headers: [
        {
          text: 'Priority',
          align: 'left',
          sortable: true,
          value: 'priority'
        },
        {
          text: 'Name',
          align: 'left',
          sortable: true,
          value: 'name'
        },
        {
          text: 'Active',
          align: 'left',
          sortable: true,
          value: 'active'
        },
        {
          text: 'Style',
          align: 'left',
          sortable: true,
          value: 'style.name'
        },
        {
          text: 'Is Basemap',
          align: 'left',
          sortable: true,
          value: 'isBasemap'
        },
        {
          text: 'Is Dark',
          align: 'left',
          sortable: true,
          value: 'isDark'
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
    deleteLayers () {
      this.dialogDelete = true
      var promises = []
      this.selected.forEach(item => {
        promises.push(this.$store.dispatch('layers/remove', item.id))
      })
      Promise.all(promises).then(res => {
        this.dialogDelete = false
      }).catch(err => {
        console.log(err)
      })
    },
    save () {
      if (this.valid) {
        this.$store.dispatch('layers/create', {
          styleId: this.style.id,
          name: this.style.name,
          projectId: this.$route.params.id
        }).then((res) => {
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
    ...mapGetters('layers', {
      findLayers: 'find'
    }),
    ...mapGetters('companies', {
      companies: 'list'
    }),
    ...mapGetters('projects', {
      getProject: 'get'
    }),
    layers () {
      return this.findLayers({
        query: {
          projectId: this.$route.params.id
        }
      }).data
    },
    project () {
      return this.getProject(this.$route.params.id)
    },
    title () {
      return `${this.project ? this.project.name : ''} - Layers`
    },
    companyId: {
      get () {
      },
      set (value) {
        this.$store.dispatch('projects/find', {
          query: {
            companyId: value
          }
        }).then(res => {
          this.projects = res
        })
      }
    },
    projectId: {
      get () {
        return this._projectId
      },
      set (value) {
        this._projectId = value
        this.$store.dispatch('styles/find', {
          query: {
            projectId: value
          }
        }).then(res => {
          this.styles = res
        })
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
  watch: {},
  mounted () {
    this.$store.dispatch('layers/find', {
      query: {
        projectId: this.$route.params.id
      }
    })
    this.$store.dispatch('companies/find')
    this.$store.dispatch('projects/get', this.$route.params.id)
  }
}
</script>
<style scoped lang="stylus">
.select {
  cursor: pointer;
}
</style>