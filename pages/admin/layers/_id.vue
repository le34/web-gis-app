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
          Layer
        </v-card-title>
        <v-card-text>
          <v-text-field v-model="name" required label="Name"></v-text-field>
          <v-text-field type="number" v-model="priority" label="Priority"></v-text-field>
          <v-checkbox label="Active" v-model="active"></v-checkbox>
          <v-checkbox label="Is Basemap" v-model="isBasemap"></v-checkbox>
          <v-checkbox v-if="isBasemap" label="Is Dark" v-model="isDark"></v-checkbox>
          <v-text-field :value="layer && layer['style.name']" readonly label="Style"></v-text-field>
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
      this.$store.dispatch('layers/remove', this.$route.params.id).then(res => {
        this.$router.push('/admin/layers')
      }).catch(err => {
        console.log(err)
      })
    }
  },
  computed: {
    name: {
      get () {
        return this.layer ? this.layer.name : null
      },
      set (e) {
        this.$store.dispatch('layers/patch', [this.$route.params.id, { name: e }])
      }
    },
    priority: {
      get () {
        return this.layer ? this.layer.priority : null
      },
      set (e) {
        this.$store.dispatch('layers/patch', [this.$route.params.id, { priority: e }])
      }
    },
    active: {
      get () {
        return this.layer ? this.layer.active : null
      },
      set (e) {
        this.$store.dispatch('layers/patch', [this.$route.params.id, { active: e }])
      }
    },
    isBasemap: {
      get () {
        return this.layer ? this.layer.isBasemap : null
      },
      set (e) {
        this.$store.dispatch('layers/patch', [this.$route.params.id, { isBasemap: e }])
      }
    },
    isDark: {
      get () {
        return this.layer ? this.layer.isDark : null
      },
      set (e) {
        this.$store.dispatch('layers/patch', [this.$route.params.id, { isDark: e }])
      }
    },
    title () {
      return this.layer ? this.layer.name : 'Layer'
    },
    ...mapGetters('layers', {
      getLayer: 'get'
    }),
    layer () {
      return this.getLayer(this.$route.params.id)
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
    this.$store.dispatch('layers/get', this.$route.params.id)
  }
}
</script>
<style scoped lang="stylus">
.select {
  cursor: pointer;
}
</style>