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
          Tool
        </v-card-title>
        <v-card-text>
          <v-text-field :value="tool && tool.id" readonly label="Id"></v-text-field>
          <v-text-field v-model="name" required label="Name"></v-text-field>
          <v-text-field multi-line v-model="description" label="Description"></v-text-field>          
        </v-card-text>
        <v-card-actions>
          <v-spacer/>
          <v-btn flat color="primary" @click.stop="dialogRemove = true">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-container>
    <v-dialog v-model="dialogRemove" persistent max-width="500">
      <v-card>
        <v-card-title>
          <div class="headline">Delete</div>
        </v-card-title>
        <v-card-text>Remove layer?</v-card-text>
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
      dialogRemove: false
    }
  },
  methods: {
    remove () {
      this.dialogRemove = true
      this.$store.dispatch('tools/remove', this.$route.params.id).then(res => {
        this.$router.push('/admin/tools')
      }).catch(err => {
        console.log(err)
      })
    }
  },
  computed: {
    name: {
      get () {
        return this.tool ? this.tool.name : null
      },
      set (e) {
        this.$store.dispatch('tools/patch', [this.$route.params.id, { name: e }])
      }
    },
    description: {
      get () {
        return this.tool ? this.tool.description : null
      },
      set (e) {
        this.$store.dispatch('tools/patch', [this.$route.params.id, { description: e }])
      }
    },
    title () {
      return this.tool ? this.tool.name : 'Tool'
    },
    ...mapGetters('tools', {
      getTool: 'get'
    }),
    tool () {
      return this.getTool(this.$route.params.id)
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
    this.$store.dispatch('tools/get', this.$route.params.id)
  }
}
</script>
<style scoped lang="stylus">
.select {
  cursor: pointer;
}
</style>