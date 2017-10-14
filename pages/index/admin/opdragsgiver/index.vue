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
          <v-btn fab dark small color="red" slot="activator" @click.stop="dialogRemove = true">
            <v-icon>delete</v-icon>
          </v-btn>
          <span>Slet valgte</span>
        </v-tooltip>
      </v-speed-dial>
    </v-fab-transition>
    <v-toolbar app fixed prominent dark color="secondary">
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <img src="/icon.png" height="63" />
      <v-toolbar-title>Opdragsgivere</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon v-if="!showSearch && $vuetify.breakpoint.xsOnly" @click.stop="showSearch=!showSearch;focus()">
        <v-icon>search</v-icon>
      </v-btn>
      <v-text-field autofocus v-if="!$vuetify.breakpoint.xsOnly" dark append-icon="search" label="Søg" single-line hide-details v-model="search"></v-text-field>
      <v-text-field ref="searchfield" prepend-icon="close" :prepend-icon-cb="() => (showSearch = !showSearch)" v-if="$vuetify.breakpoint.xsOnly && showSearch" slot="extension" dark append-icon="search" label="Søg" single-line hide-details v-model="search"></v-text-field>
    </v-toolbar>
    <v-data-table v-model="selected" selected-key="id" select-all :headers="headers" :items="clients" :search="search" hide-actions>
      <template slot="items" scope="props">
        <td>
          <v-checkbox primary hide-details v-model="props.selected"></v-checkbox>
        </td>
        <td @click.stop="edit(props.item)" class="text-xs-left select">{{ props.item.name }}</td>
        <td @click.stop="editClient(props.item)" class="text-xs-left select">{{ props.item.cvrno }}</td>
      </template>
    </v-data-table>
    <v-dialog v-model="dialog" persistent max-width="500">
      <v-form v-model="valid" ref="form" @submit.prevent>
        <v-card>
          <v-card-title>
            <div class="headline">Opret ny opdragsgiver</div>
          </v-card-title>
          <v-card-text>
            <v-select :rules="nameRules" ref="focus" clearable v-model="selectedCVR" :loading="loading" autocomplete required item-text="Vrvirksomhed.virksomhedMetadata.nyesteNavn.navn" :items="cvr" :search-input.sync="cvrSearch" label="Søg navn eller CVRnr"></v-select>
            <v-text-field readonly v-model="cvrNummer" label="CVR"></v-text-field>            
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" flat @click.native="clear()">Fortryd</v-btn>
            <v-btn type="submit" color="primary" @click.stop="save()">Gem</v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
    <v-dialog v-model="dialogRemove" lazy absolute>
      <v-card>
        <v-card-title>
          <div class="headline">Slet valgte opdragsgivere</div>
        </v-card-title>
        <v-card-text>Er du sikker på at du vil slette valgte opdragsgivere?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" flat="flat" @click.native="dialogRemove = false">Fortryd</v-btn>
          <v-btn color="primary" flat="flat" @click.native="remove()">Slet</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-content>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex'
export default {
  data () {
    return {
      valid: false,
      fab: false,
      showSearch: false,
      breadcrumbs: [
        {
          text: 'Admin',
          disabled: false,
          href: '/admin'
        },
        {
          text: 'Users',
          disabled: true,
          href: '/admin/users'
        }
      ],
      form: {},
      loading: false,
      selectedCVR: null,
      nameRules: [() => this.selectedCVR !== null || 'Du skal vælge en virksomhed fra listen'],
      dialog: false,
      dialogRemove: false,
      search: '',
      selected: [],
      headers: [
        {
          text: 'Navn',
          align: 'left',
          sortable: true,
          value: 'name'
        },
        { text: 'CVR', value: 'cvrno' }
      ]
    }
  },
  methods: {
    clear () {
      this.$store.commit('cvr/clearAll')
    },
    focus () {
      this.$nextTick(() => this.$refs.searchfield.$el.getElementsByTagName('input')[0].focus())
    },
    create () {
      this.dialog = true
      this.$nextTick(() => this.$refs.focus.$el.getElementsByTagName('input')[0].focus())
    },
    remove () {
      this.dialogRemove = true
      this.selected.forEach(user => {
        this.$store.dispatch('users/remove', user.id).then(res => {
          this.dialogRemove = false
        }).catch(err => {
          console.log(err)
        })
      })
    },
    save () {
      if (this.valid) {
        this.$store.dispatch('clients/create', {
          data: {
            name: this.selectedCVR.Vrvirksomhed.virksomhedMetadata.nyesteNavn.navn,
            cvrno: this.selectedCVR.Vrvirksomhed.cvrNummer
          }
        }).then((res) => {
          this.email = null
          this.role = null
          this.clientId = null
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
    ...mapMutations('cvr', {
      clearCVR: 'clearAll'
    }),
    ...mapGetters('cvr', {
      cvr: 'list'
    }),
    ...mapGetters('users', {
      users: 'list'
    }),
    ...mapGetters('clients', {
      clientsRaw: 'list'
    }),
    clients () {
      return this.clientsRaw.map(client => {
        return { id: client.id, ...client.data }
      })
    },
    ...mapGetters('roles', {
      roles: 'list'
    }),
    drawer: {
      get () {
        return this.$store.state.drawer
      },
      set (value) {
        this.$store.commit('drawer', value)
      }
    },
    cvrNummer () {
      return this.selectedCVR ? this.selectedCVR.Vrvirksomhed.cvrNummer : null
    },
    cvrSearch: {
      get () {
        return null
      },
      set (value) {
        if (value) {
          console.log(value)
          this.loading = true
          this.$store.commit('cvr/clearAll')
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
          }).then(() => {
            this.loading = false
          })
        }
        /*
        this.$axios.$get('/cvr/' + value).then(data => {
          this.cvr = data.hits.hits
        }).catch(err => {
          console.log(err)
        })
        */
      }
    }
  },
  watch: {
  },
  mounted () {
    this.$store.dispatch('users/find')
    this.$store.dispatch('clients/find', { query: { data: { type: 'opdragsgiver' } } })
    this.$store.dispatch('roles/find')
  }
}
</script>
<style scoped lang="stylus">
.select {
  cursor: pointer;
}
</style>