<template>
  <v-content>
    <v-fab-transition>
      <v-speed-dial hover bottom fixed right v-model="fab" v-show="!dialog">
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
    </v-fab-transition>
    <v-toolbar app fixed prominent dark color="secondary">
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <img src="/icon.png" height="63" @click="$router.push('/')" style="cursor: pointer"/>
      <v-btn icon :to="{ name: 'admin-company-id-project', params: { id: $route.params.id } }">
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
    <v-data-table v-model="selected" selected-key="id" select-all :headers="headers" :items="data" :search="search" hide-actions>
      <template slot="items" scope="props">
        <td>
          <v-checkbox primary hide-details v-model="props.selected"></v-checkbox>
        </td>
        <td class="text-xs-left select">{{ props.item.createdAt }}</td>        
        <td class="text-xs-left select">{{ props.item.name }}</td>        
        <td class="text-xs-left select">{{ props.item.company }}</td>        
        <td class="text-xs-left select">{{ props.item.progress }} %</td>
        <td @click.stop="$router.push({ name: 'map-companyId-projectId-dataId', params: { companyId: $route.params.id, projectId: $route.params.projectId, dataId: props.item.id } })" class="text-xs-left select"><v-icon>pageview</v-icon></td>
      </template>
    </v-data-table>
    <v-dialog v-model="dialog" persistent max-width="500">
      <v-form v-model="valid" ref="form" @submit.prevent>
        <v-card>
          <v-card-title>
            <div class="headline">Upload GeoJSON</div>
          </v-card-title>
          <v-card-text>
            <v-text-field :rules="fileRules" readonly required label="GeoJSON" hint="Choose GeoJSON file" v-model="filename" append-icon="attach_file" :append-icon-cb="fileselect" :suffix="filesize"></v-text-field>
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
          <div class="headline">Delete Data</div>
        </v-card-title>
        <v-card-text>Delete selected data?</v-card-text>
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
      filename: null,
      valid: false,
      fab: false,
      showSearch: false,
      fileRules: [v => !!v || 'GeoJSON file is required'],
      dialog: false,
      dialogDelete: false,
      search: '',
      selected: [],
      headers: [
        /*
        {
          text: 'Client',
          align: 'left',
          sortable: true,
          value: 'client'
        },
        */
        {
          text: 'Date',
          align: 'left',
          sortable: true,
          value: 'createdAt'
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

        /*
        {
          text: 'User',
          align: 'left',
          sortable: true,
          value: 'user'
        },
        */
        {
          text: 'Progress',
          align: 'left',
          sortable: true,
          value: 'progress'
        },
        {
          text: 'Show',
          align: 'left',
          sortable: false
        }
      ]
    }
  },
  methods: {
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

      fileDialog({ accept: '.geojson' }).then(file => {
        this.filename = file[0].name
        this.filesize = formatsize(file[0].size)
        this.name = this.filename.substring(0, this.filename.length - 8)
        const fr = new FileReader()
        fr.onload = () => {
          this.geojson = JSON.parse(fr.result)
        }
        fr.readAsText(file[0])
      })
    },
    focus () {
      this.$nextTick(() =>
        this.$refs.searchfield.$el.getElementsByTagName('input')[0].focus()
      )
    },
    deleteData () {
      this.dialogDelete = true
      this.selected.forEach(item => {
        this.$store
          .dispatch('data/remove', item.id)
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
          .dispatch('data/create', {
            companyId: this.$store.state.auth.user.companyId,
            projectId: this.$route.params.projectId,
            name: this.name,
            userId: this.$store.state.auth.user.id,
            geojson: this.geojson
          })
          .then(res => {
            this.name = null
            this.geojson = null
            this.filesize = null
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
    ...mapGetters('company', {
      getCompany: 'get'
    }),
    ...mapGetters('data', {
      dataRaw: 'list'
    }),
    ...mapGetters('projects', {
      getProject: 'get'
    }),
    dataFilter () {
      return this.dataRaw.filter(item => {
        return item.projectId === this.$route.params.projectId
      })
    },
    data () {
      return this.dataFilter.map(item => {
        let temp = { ...item }
        temp.company = item['company.data'].name
        return temp
      })
    },
    company () {
      return this.getCompany(this.$route.params.id)
    },
    project () {
      return this.getProject(this.$route.params.projectId)
    },
    title () {
      return (this.company ? this.company.data.name : '') + ' - ' + (this.project ? this.project.name : '')
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
    this.$store.dispatch('company/find', {
      query: {
        id: this.$route.params.id
      }
    })
    this.$store.dispatch('data/find', {
      query: {
        $select: ['id', 'projectId', 'name', 'createdAt', 'progress'],
        projectId: this.$route.params.projectId
      }
    })
    this.$store.dispatch('projects/find', {
      query: {
        id: this.$route.params.projectId
      }
    })
  }
}
</script>
<style scoped lang="stylus">
.select {
  cursor: pointer;
}
</style>