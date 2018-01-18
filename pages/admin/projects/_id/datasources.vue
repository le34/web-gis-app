<template>
  <v-content>
    <v-speed-dial open-on-hover bottom fixed right v-model="fab" v-show="!dialog">
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
      <v-btn icon :to="{ name: 'admin-projects-id', params: { id: $route.params.id } }">
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
    <v-data-table v-model="selected" selected-key="id" select-all :headers="headers" :items="datasources" :search="search" hide-actions :custom-filter="customSearch">
      <template slot="items" scope="props">
        <td>
          <v-checkbox primary hide-details v-model="props.selected"></v-checkbox>
        </td>
        <td @click.stop="$router.push({ name: 'admin-datasources-id', params: { id: props.item.id } })" class="text-xs-left select">{{ props.item.updatedAt | date }}</td>
        <td @click.stop="$router.push({ name: 'admin-datasources-id', params: { id: props.item.id } })" class="text-xs-left select">{{ props.item['datasourcetype.name'] }}</td>    
        <td @click.stop="$router.push({ name: 'admin-datasources-id', params: { id: props.item.id } })" class="text-xs-left select">{{ props.item.name }}</td>        
        <td @click.stop="$router.push({ name: 'admin-companies-id', params: { id: props.item.companyId } })" class="text-xs-left select">{{ props.item['company.name'] }}</td>        
        <td @click.stop="$router.push({ name: 'admin-datasources-id', params: { id: props.item.id } })" class="text-xs-left select">{{ props.item.progress }} %</td>        
        <td @click.stop="$router.push({ name: 'admin-users-id', params: { id: props.item.userId } })" class="text-xs-left select">{{ props.item['user.email'] }}</td>
      </template>
    </v-data-table>
    <v-dialog v-model="dialog" persistent max-width="500">
      <v-form v-model="valid" ref="form" @submit.prevent>
        <v-card>
          <v-card-title>
            <div class="headline">Create new datasource</div>
          </v-card-title>
          <v-card-text>
            <v-select v-model="datasourceType" item-text="name" :items="datasourcetypes" label="Select datasource type"></v-select>
            <v-text-field :rules="fileRules" required label="Name" v-model="name"></v-text-field>
            <v-text-field v-if="datasourceType && datasourceType.id<3" :rules="fileRules" readonly :label="datasourceType.name" hint="Choose file" v-model="filename" append-icon="attach_file" :append-icon-cb="fileselect" :suffix="filesize"></v-text-field>
            <v-text-field v-if="datasourceType && datasourceType.id===3" :rules="fileRules" required label="Database Connectionstring" hint="postgres://username:password@server:5432/database" v-model="connectionString"></v-text-field>
            <v-text-field v-if="datasourceType && datasourceType.id===3" :rules="fileRules" required label="Table/View" v-model="dbTable"></v-text-field>
            <v-text-field v-if="datasourceType && datasourceType.id===3" :rules="fileRules" required label="Geometry Column" v-model="geometryColumn"></v-text-field>
            <v-checkbox v-if="datasourceType && datasourceType.id===3" label="Create Tiles" v-model="tile"></v-checkbox>
          </v-card-text>
          <v-progress-linear v-model="percentCompleted"></v-progress-linear>
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
          <div class="headline">Delete</div>
        </v-card-title>
        <v-card-text>Delete selected datasources?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" flat="flat" @click.native="dialogDelete = false">Cancel</v-btn>
          <v-btn color="primary" flat="flat" @click.native="deleteDatasource()">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-content>
</template>
<script>
import { mapGetters } from 'vuex'
import { v4 } from 'uuid'
const UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
const STEP = 1024

function format (value, power) {
  return (value / Math.pow(STEP, power)).toFixed(2) + ' ' + UNITS[power]
}
function formatsize (value) {
  for (var i = 0; i < UNITS.length; i++) {
    if (value < Math.pow(STEP, i)) {
      if (UNITS[i - 1]) {
        return format(value, i - 1)
      }
      return value + ' ' + UNITS[i]
    }
  }
  return format(value, i - 1)
}
export default {
  head () {
    return {
      title: this.title
    }
  },
  data () {
    return {
      filesize: null,
      geojson: null,
      name: null,
      file: null,
      filename: null,
      tile: null,
      valid: false,
      fab: false,
      showSearch: false,
      fileRules: [v => !!v || 'GeoJSON file is required'],
      dialog: false,
      dialogDelete: false,
      search: '',
      selected: [],
      percentCompleted: 0,
      datasourceType: 0,
      connectionString: null,
      geometryColumn: null,
      dbTable: null,
      headers: [
        {
          text: 'Updated At',
          align: 'left',
          sortable: true,
          value: 'updatedAt'
        },
        {
          text: 'Type',
          align: 'left',
          sortable: true,
          value: 'datasourcetype.name'
        },
        {
          text: 'Name',
          align: 'left',
          sortable: true,
          value: 'name'
        },
        {
          text: 'Client',
          align: 'left',
          sortable: true,
          value: 'company'
        },
        {
          text: 'Progress',
          align: 'left',
          sortable: true,
          value: 'progress'
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
    onUploadProgress (progressEvent) {
      this.percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
    },
    edit (item) {
      this.$router.push()
    },
    fileselect () {
      const fileDialog = (...args) => {
        const input = document.createElement('input')

        // Set config
        if (typeof args[0] === 'object') {
          if (args[0].multiple === true) input.setAttribute('multiple', '')
          if (args[0].accept !== undefined) { input.setAttribute('accept', args[0].accept) }
        }
        input.setAttribute('type', 'file')

        // IE10/11 Addition
        input.style.display = 'none'
        input.setAttribute('id', 'hidden-file')
        document.body.appendChild(input)

        // Return promise/callvack
        return new Promise((resolve, reject) => {
          input.addEventListener('change', e => {
            resolve(input.files)
            const lastArg = args[args.length - 1]
            if (typeof lastArg === 'function') lastArg(input.files)

            // IE10/11 Addition
            document.body.removeChild(input)
          })

          // Simluate click event
          const evt = document.createEvent('MouseEvents')
          evt.initMouseEvent(
            'click',
            true,
            true,
            window,
            1,
            0,
            0,
            0,
            0,
            false,
            false,
            false,
            false,
            0,
            null
          )
          input.dispatchEvent(evt)
        })
      }
      fileDialog({ accept: this.datasourceType.id === 1 ? '.geojson' : '.mbtiles' }).then(file => {
        this.file = file[0]
        this.filename = file[0].name
        this.filesize = formatsize(file[0].size)
        this.name = this.filename.substring(0, this.filename.length - 8)
        if (this.datasourceType.id === 1) {
          const fr = new FileReader()
          fr.onload = () => {
            this.geojson = JSON.parse(fr.result)
          }
          fr.readAsText(file[0])
        }
      })
    },
    focus () {
      this.$nextTick(() =>
        this.$refs.searchfield.$el.getElementsByTagName('input')[0].focus()
      )
    },
    deleteDatasource () {
      var promises = []
      this.selected.forEach(item => {
        promises.push(this.$store.dispatch('datasources/remove', item.id))
      })
      Promise.all(promises).then(res => {
        this.dialogDelete = false
      }).catch(err => {
        console.log(err)
      })
    },
    save () {
      if (this.valid) {
        Promise.resolve().then(() => {
          let options = {
            id: v4(),
            companyId: this.$store.state.auth.user.companyId,
            projectId: this.$route.params.id,
            name: this.name,
            datasourcetypeId: this.datasourceType.id
          }
          switch (this.datasourceType.id) {
            case 1: options.geojson = this.geojson
              return options
            case 2:
              var formData = new FormData()
              formData.append('id', options.id)
              formData.append('mbtile', this.file)
              var config = {
                onUploadProgress: this.onUploadProgress
              }
              return this.$axios.post(process.env.FEATHERS + '/files', formData, config).then(() => {
                return options
              })
            case 3: options.data.connectionString = this.connectionString
              options.data.geometryColumn = this.geometryColumn
              options.data.dbTable = this.dbTable
              options.data.tile = this.tile
              return options
          }
        }).then(options => {
          return this.$store.dispatch('datasources/create', options)
        }).then(res => {
          this.$refs.form.reset()
          this.name = null
          this.geojson = null
          this.file = null
          this.filesize = null
          this.datasourceType = null
          this.connectionString = null
          this.geometryColumn = null
          this.dbTable = null
          this.tile = null
          this.dialog = false
        }).catch(err => {
          console.log('error', err)
          this.message = err
        })
      }
    }
  },
  computed: {
    ...mapGetters('datasources', {
      findDatasources: 'find'
    }),
    ...mapGetters('datasourcetypes', {
      datasourcetypes: 'list'
    }),
    ...mapGetters('projects', {
      getProject: 'get'
    }),
    datasources () {
      return this.findDatasources({
        query: {
          projectId: this.$route.params.id
        }
      }).data
    },
    project () {
      return this.getProject(this.$route.params.id)
    },
    title () {
      return `${this.project ? this.project.name : ''} - Datasources`
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
    this.$store.dispatch('datasources/find', {
      query: {
        projectId: this.$route.params.id
      }
    })
    this.$store.dispatch('projects/get', this.$route.params.id)
    this.$store.dispatch('datasourcetypes/find')
  }
}
</script>
<style scoped lang="stylus">
.select {
  cursor: pointer;
}
</style>