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
          <v-btn fab dark small color="red" slot="activator" @click.stop="dialogRemove = true">
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
    <v-data-table v-model="selected" selected-key="id" select-all :headers="headers" :items="projectstools" :search="search" hide-actions :custom-filter="customSearch">
      <template slot="items" scope="props">
        <td>
          <v-checkbox primary hide-details v-model="props.selected"></v-checkbox>
        </td>
        <td @click.stop="$router.push({ name: 'admin-projectstools-id', params: { id: props.item.id } })" class="text-xs-left select">{{ props.item.priority }}</td>
        <td @click.stop="$router.push({ name: 'admin-projectstools-id', params: { id: props.item.id } })" class="text-xs-left select">{{ props.item.name }}</td>
        <td @click.stop="$router.push({ name: 'admin-projectstools-id', params: { id: props.item.id } })" class="text-xs-left select">{{ props.item.active }}</td>
        <td @click.stop="$router.push({ name: 'admin-tools-id', params: { id: props.item.toolId } })" class="text-xs-left select">{{ props.item['tool.name'] }}</td>
        <td @click.stop="$router.push({ name: 'admin-projectstools-id', params: { id: props.item.id } })" class="text-xs-left select">{{ props.item.updatedAt | date }}</td>
        <td @click.stop="$router.push({ name: 'admin-users-id', params: { id: props.item.userId } })" class="text-xs-left select">{{ props.item['user.email'] }}</td>
      </template>
    </v-data-table>
    <v-dialog v-model="dialog" persistent max-width="500">
      <v-form v-model="valid" ref="form" @submit.prevent>
        <v-card>
          <v-card-title>
            <div class="headline">Add Tool</div>
          </v-card-title>
          <v-card-text>
            <v-select required :rules="toolRules" v-model="tool" item-text="name" :items="tools" label="Tool"></v-select>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" flat @click.native="dialog=false">Cancel</v-btn>
            <v-btn type="submit" color="primary" @click.stop="save()">Save</v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
    <v-dialog v-model="dialogRemove" persistent max-width="500">
      <v-card>
        <v-card-title>
          <div class="headline">Remove Client</div>
        </v-card-title>
        <v-card-text>Remove selected clients?</v-card-text>
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
      valid: false,
      fab: false,
      showSearch: false,
      tool: null,
      toolRules: [(v) => !!v || 'Tool is required'],
      dialog: false,
      dialogRemove: false,
      search: '',
      selected: [],
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
          text: 'Tool',
          align: 'left',
          sortable: true,
          value: 'tool.name'
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
    create () {
      this.dialog = true
    },
    remove () {
      this.dialogRemove = true
      this.selected.forEach(item => {
        this.$store.dispatch('projects-tools/remove', item.id).then(res => {
          this.dialogRemove = false
        }).catch(err => {
          console.log(err)
        })
      })
    },
    save () {
      if (this.valid) {
        this.$store.dispatch('projects-tools/create', {
          name: this.tool.name,
          toolId: this.tool.id,
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
    ...mapGetters('tools', {
      tools: 'list'
    }),
    ...mapGetters('projects-tools', {
      findProjectsTools: 'find'
    }),
    ...mapGetters('projects', {
      getProject: 'get'
    }),
    title () {
      return `${this.project ? this.project.name : ''} - Tools`
    },
    projectstools () {
      return this.findProjectsTools({ query: { projectId: this.$route.params.id } }).data
    },
    project () {
      return this.getProject(this.$route.params.id)
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
  watch: {
  },
  mounted () {
    this.$store.dispatch('projects/get', this.$route.params.id)
    this.$store.dispatch('tools/find')
    this.$store.dispatch('projects-tools/find', { query: { projectId: this.$route.params.id } })
  }
}
</script>
<style scoped lang="stylus">
.select {
  cursor: pointer;
}
</style>