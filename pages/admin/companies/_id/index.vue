<template>
  <v-content>
    <v-toolbar app fixed prominent dark color="secondary">
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <img src="/icon.png" height="63" @click="$router.push('/')" style="cursor: pointer"/>
      <v-toolbar-title>{{title}}</v-toolbar-title>
    </v-toolbar>
    <v-container fluid>
      <v-card>
        <v-card-title primary-title class="title">
          Company
        </v-card-title>
        <v-card-text>
          <v-text-field v-model="name" required name="name" label="Name" id="name"></v-text-field>
          <v-text-field v-model="cvr" required name="cvr" label="CVR" id="cvr"></v-text-field>
          <v-text-field readonly label="Logo" hint="Choose file" v-model="filename" append-icon="attach_file" :append-icon-cb="fileselect"></v-text-field>
          <img :src="logo"/>
        </v-card-text>
        <v-card-actions>
          <v-layout row wrap>
            <v-flex>
              <v-btn flat :to="{ name: 'admin-companies-id-users', params: { id: $route.params.id } }">
                <v-icon left>person</v-icon>
                  Users
              </v-btn>
            </v-flex>
            <v-flex>
              <v-btn flat :to="{ name: 'admin-companies-id-projects', params: { id: $route.params.id } }">
                <v-icon left>assignment</v-icon>
                  Projects
              </v-btn>
            </v-flex>
          </v-layout>
          <v-spacer/>
          <v-btn flat color="primary" @click.native.stop="alert = true">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-container>
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
      filename: null
    }
  },
  methods: {
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
      fileDialog({ accept: 'image/*' }).then(file => {
        this.filename = file[0].name
        const fr = new FileReader()
        fr.onload = () => {
          this.logo = fr.result
        }
        fr.readAsDataURL(file[0])
      })
    }
  },
  computed: {
    title () {
      return this.company ? this.company.name : 'Company'
    },
    ...mapGetters('companies', {
      getCompany: 'get'
    }),
    ...mapGetters('logos', {
      getLogo: 'get'
    }),
    company () {
      return this.getCompany(this.$route.params.id)
    },
    logoraw () {
      return this.getLogo(this.$route.params.id)
    },
    name: {
      get () {
        return this.company ? this.company.name : null
      },
      set (e) {
        this.$store.dispatch('companies/patch', [this.company.id, { name: e }])
      }
    },
    cvr: {
      get () {
        return this.company ? this.company.cvr : null
      },
      set (e) {
        this.$store.dispatch('companies/patch', [this.company.id, { cvr: e }])
      }
    },
    logo: {
      get () {
        return this.logoraw ? this.logoraw.data : null
      },
      set (e) {
        this.$store.dispatch('logos/get', this.$route.params.id).then(logo => {
          this.$store.dispatch('logos/patch', [this.$route.params.id, { data: e }])
        }).catch(() => {
          this.$store.dispatch('logos/create', { id: this.$route.params.id, data: e })
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
  mounted () {
    this.$store.dispatch('companies/get', this.$route.params.id)
    this.$store.dispatch('logos/get', this.$route.params.id)
  }
}
</script>
<style scoped lang="stylus">
.select {
  cursor: pointer;
}
</style>