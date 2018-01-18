<template>
  <v-content>
    <v-fab-transition>
      <v-speed-dial hover bottom fixed right v-model="fab">
        <v-btn slot="activator" color="blue darken-2" dark fab hover v-model="fab">
          <v-icon>more_vert</v-icon>
          <v-icon>close</v-icon>
        </v-btn>
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
    <v-data-table v-model="selected" selected-key="id" select-all :headers="headers" :items="datasources" :search="search" hide-actions :custom-filter="customSearch">
      <template slot="items" scope="props">
        <td>
          <v-checkbox primary hide-details v-model="props.selected"></v-checkbox>
        </td>
        <td @click.stop="$router.push({ name: 'admin-datasources-id', params: { id: props.item.id } })" class="text-xs-left select">{{ props.item.name }}</td>        
        <td @click.stop="$router.push({ name: 'admin-datasources-id', params: { id: props.item.id } })" class="text-xs-left select">{{ props.item['datasourcetype.name'] }}</td>        
        <td @click.stop="$router.push({ name: 'admin-projetcs-id', params: { id: props.item.projetcId } })" class="text-xs-left select">{{ props.item['project.name'] }}</td>        
        <td @click.stop="$router.push({ name: 'admin-companies-id', params: { id: props.item.companyId } })" class="text-xs-left select">{{ props.item['company.name'] }}</td>        
        <td @click.stop="$router.push({ name: 'admin-datasources-id', params: { id: props.item.id } })" class="text-xs-left select">{{ props.item.updatedAt | date }}</td>
        <td @click.stop="$router.push({ name: 'admin-users-id', params: { id: props.item.userId } })" class="text-xs-left select">{{ props.item['user.email'] }}</td>
      </template>
    </v-data-table>
    <v-dialog v-model="dialogDelete" persistent max-width="500">
      <v-card>
        <v-card-title>
          <div class="headline">Delete Datasource</div>
        </v-card-title>
        <v-card-text>Delete selected datasources?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" flat="flat" @click.native="dialogDelete = false">Cancel</v-btn>
          <v-btn color="primary" flat="flat" @click.native="deleteDatasources()">Delete</v-btn>
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
      title: 'Datasources',
      fab: false,
      showSearch: false,
      dialogDelete: false,
      search: '',
      selected: [],
      headers: [
        {
          text: 'Name',
          align: 'left',
          sortable: true,
          value: 'name'
        },
        {
          text: 'Type',
          align: 'left',
          sortable: true,
          value: 'datasourcetype.name'
        },
        {
          text: 'Project',
          align: 'left',
          sortable: true,
          value: 'project.name'
        },
        {
          text: 'Owner',
          align: 'left',
          sortable: true,
          value: 'company.name'
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
    deleteDatasources () {
      var promises = []
      this.selected.forEach(item => {
        promises.push(this.$store.dispatch('datasources/remove', item.id))
      })
      Promise.all(promises).then(res => {
        this.dialogDelete = false
      }).catch(err => {
        console.log(err)
      })
    }
  },
  computed: {
    ...mapGetters('datasources', {
      datasources: 'list'
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
    this.$store.dispatch('datasources/find')
  }
}
</script>
<style scoped lang="stylus">
.select {
  cursor: pointer;
}
</style>