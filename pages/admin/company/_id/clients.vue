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
          <span>Remove</span>
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
    <v-data-table v-model="selected" selected-key="id" select-all :headers="headers" :items="clients" :search="search" hide-actions>
      <template slot="items" scope="props">
        <td>
          <v-checkbox primary hide-details v-model="props.selected"></v-checkbox>
        </td>
        <td @click.stop="$router.push({ name: 'admin-company-id-project', params: { id: props.item.id } })" class="text-xs-left select">{{ props.item.name }}</td>
        <td @click.stop="$router.push({ name: 'admin-company-id-project', params: { id: props.item.id } })" class="text-xs-right select">{{ props.item.cvrno }}</td>
      </template>
    </v-data-table>
    <v-dialog v-model="dialog" persistent max-width="500">
      <v-form v-model="valid" ref="form" @submit.prevent>
        <v-card>
          <v-card-title>
            <div class="headline">Add Client</div>
          </v-card-title>
          <v-card-text>
            <v-select :rules="nameRules" ref="focus" clearable v-model="selectedCVR" required item-text="data.name" :items="selects" label="Select Company"></v-select>
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
          <div class="headline">Remove Clients</div>
        </v-card-title>
        <v-card-text>Remove selected clients?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" flat="flat" @click.native="dialogRemove = false">Cancel</v-btn>
          <v-btn color="primary" flat="flat" @click.native="remove()">Remove</v-btn>
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
      form: {},
      items: [],
      loading: false,
      selectedCVR: null,
      nameRules: [() => this.selectedCVR !== null || 'Select a company from the list'],
      dialog: false,
      dialogRemove: false,
      search: '',
      selected: [],
      headers: [
        {
          text: 'Name',
          align: 'left',
          sortable: true,
          value: 'name'
        },
        { text: 'CVR', value: 'cvrno' }
      ]
    }
  },
  methods: {
    focus () {
      this.$nextTick(() => this.$refs.searchfield.$el.getElementsByTagName('input')[0].focus())
    },
    create () {
      this.dialog = true
      this.$nextTick(() => this.$refs.focus.$el.getElementsByTagName('input')[0].focus())
    },
    remove () {
      this.dialogRemove = true
      const keys = this.selected.map(item => item.id)
      let data = { ...this.company.data }
      data.clients = this.clients.filter(item => keys.indexOf(item.id) === -1).map(item => item.id)
      this.$store.dispatch('company/patch', [this.company.id, { data }]).then(res => {
        console.log(res)
        this.dialogRemove = false
      }).catch(err => {
        console.log('error', err)
      })
    },
    save () {
      if (this.valid) {
        let data = { ...this.company.data }
        data.clients = data.clients || []
        data.clients = [ this.selectedCVR.id, ...data.clients ]
        this.$store.dispatch('company/patch', [this.company.id, { data }]).then(res => {
          console.log(res)
          this.dialog = false
          this.selectedCVR = null
          this.$refs.form.reset()
        }).catch(err => {
          console.log('error', err)
        })
      }
    }
  },
  computed: {
    ...mapGetters('company', {
      companyRaw: 'list',
      getCompany: 'get'
    }),
    company () {
      return this.getCompany(this.$route.params.id)
    },
    clients () {
      return this.companyRaw.filter(item => {
        return this.company && this.company.data && this.company.data.clients && this.company.data.clients.indexOf(item.id) !== -1
      }).map(item => {
        return { id: item.id, ...item.data }
      })
    },
    selects () {
      return this.companyRaw.filter(item => {
        return !this.company || !this.company.data.clients || this.company.data.clients.indexOf(item.id) === -1
      })
    },
    drawer: {
      get () {
        return this.$store.state.drawer
      },
      set (value) {
        this.$store.commit('drawer', value)
      }
    },
    title () {
      return this.company ? this.company.data.name + ' - Clients' : 'Clients'
    }
  },
  watch: {
  },
  mounted () {
    this.$store.dispatch('company/find')
  }
}
</script>
<style scoped lang="stylus">
.select {
  cursor: pointer;
}
</style>