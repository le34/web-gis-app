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
      <v-btn icon :to="{ name: 'admin-company-id', params: { id: $route.params.id } }">
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
        <td class="text-xs-left select">{{ props.item.progress }} %</td>
        <td @click.stop="$router.push({ name: 'map-companyId-dataId', params: { companyId: $route.params.id, dataId: props.item.id } })" class="text-xs-left select"><v-icon>pageview</v-icon></td>
      </template>
    </v-data-table>
    <v-dialog v-model="dialog" persistent max-width="500">
      <v-form v-model="valid" ref="form" @submit.prevent>
        <v-card>
          <v-card-title>
            <div class="headline">Upload GeoJSON</div>
          </v-card-title>
          <v-card-text>
            <v-select ref="company" :rules="companyRules" required item-text="data.name" :items="company" v-model="selectedCompany" label="Company"></v-select>
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
    <v-dialog v-model="dialogDelete" lazy absolute>
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
      title: 'Data',
      filesize: null,
      geojson: null,
      clientId: null,
      name: null,
      filename: null,
      valid: false,
      fab: false,
      showSearch: false,
      role: null,
      email: null,
      selectedCompany: null,
      emailRules: [
        v => !!v || 'Email er påkrævet',
        v =>
          /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) ||
          'E-mail must be valid'
      ],
      companyRules: [v => !!v || 'Company is required'],
      fileRules: [v => !!v || 'GeoJSON file is required'],
      dialog: false,
      dialogDelete: false,
      search: '',
      selected: [],
      headers: [

        /*
        {
          text: 'Company',
          align: 'left',
          sortable: true,
          value: 'company'
        },
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
        console.log(this.name)
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
    create () {
      this.dialog = true
      // this.$nextTick(() => this.$refs.company.$el.getElementsByTagName('input')[0].focus())
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
            companyId: this.selectedCompany.id,
            clientId: this.$route.params.id,
            name: this.name,
            userId: this.$store.state.auth.user.id,
            geojson: this.geojson
          })
          .then(res => {
            this.selectedCompany = null
            this.clientId = null
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
    ...mapGetters('users', {
      users: 'list'
    }),
    ...mapGetters('company', {
      companyRaw: 'list'
    }),
    ...mapGetters('data', {
      data: 'list'
    }),
    company () {
      return this.companyRaw.filter(item => {
        return (
          item.id === this.$route.params.id ||
          (item.data.hasOwnProperty('clients') &&
            item.data.clients.indexOf(this.$route.params.id) !== -1)
        )
      })
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
    this.$store.dispatch('users/find')
    this.$store.dispatch('company/find')
    this.$store.dispatch('data/find', {
      query: {
        $select: ['id', 'name', 'createdAt', 'progress'],
        $or: [
          { companyId: this.$route.params.id },
          { clientId: this.$route.params.id }
        ]
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