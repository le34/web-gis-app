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
    <v-data-table v-model="selected" selected-key="id" select-all :headers="headers" :items="companies" :search="search" hide-actions>
      <template slot="items" scope="props">
        <td>
          <v-checkbox primary hide-details v-model="props.selected"></v-checkbox>
        </td>
        <td @click.stop="edit(props.item)" class="text-xs-left select">{{ props.item.name }}</td>
        <td @click.stop="edit(props.item)" class="text-xs-right select">{{ props.item.cvr }}</td>
      </template>
    </v-data-table>
    <v-dialog v-model="dialog" persistent max-width="500">
      <v-form v-model="valid" ref="form" @submit.prevent>
        <v-card>
          <v-card-title>
            <div class="headline">Create new company</div>
          </v-card-title>
          <v-card-text>
            <v-select :rules="nameRules" ref="focus" clearable v-model="selectedCVR" :loading="loading" autocomplete item-text="display" :items="items" :search-input.sync="cvrSearch" label="Søg navn eller CVRnr"></v-select>
            <v-text-field readonly v-model="cvrNummer" label="CVR"></v-text-field>            
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
          <div class="headline">Delete company</div>
        </v-card-title>
        <v-card-text>Delete selected company?</v-card-text>
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
      title: 'Company',
      valid: false,
      fab: false,
      showSearch: false,
      form: {},
      items: [],
      name: null,
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
      this.selected.forEach(item => {
        this.$store.dispatch('companies/remove', item.id).then(res => {
          this.dialogRemove = false
        }).catch(err => {
          console.log(err)
        })
      })
    },
    save () {
      this.$store.dispatch('companies/create', {
        name: this.selectedCVR ? this.selectedCVR.Vrvirksomhed.virksomhedMetadata.nyesteNavn.navn : this.name,
        cvr: this.selectedCVR ? this.selectedCVR.Vrvirksomhed.cvrNummer : ''
      }).then((res) => {
        this.dialog = false
        this.$refs.form.reset()
      }).catch(err => {
        console.log('error', err)
        this.message = err
      })
    },
    edit (item) {
      this.$router.push({ name: 'admin-companies-id', params: { id: item.id } })
    }
  },
  computed: {
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
    },
    cvrNummer: {
      get () {
        return this.selectedCVR ? this.selectedCVR.Vrvirksomhed.cvrNummer : null
      },
      set (value) {
      }
    },
    cvrSearch: {
      get () {
        return null
      },
      set (value) {
        if (value) {
          this.name = value
          this.loading = true
          this.$store.dispatch('cvr/find', {
            query: {
              $select: [
                'Vrvirksomhed.cvrNummer',
                'Vrvirksomhed.virksomhedMetadata.nyesteNavn.navn'
              ],
              $sqs: {
                $fields: ['Vrvirksomhed.virksomhedMetadata.nyesteNavn.navn', 'Vrvirksomhed.cvrNummer'],
                $query: value || ''
              }
            }
          }).then((res) => {
            this.items = res.map(item => {
              return { display: '(' + item.Vrvirksomhed.cvrNummer + ') ' + item.Vrvirksomhed.virksomhedMetadata.nyesteNavn.navn, ...item }
            })
            this.loading = false
          })
        }
      }
    }
  },
  watch: {
  },
  mounted () {
    this.$store.dispatch('companies/find')
  }
}
</script>
<style scoped lang="stylus">
.select {
  cursor: pointer;
}
</style>