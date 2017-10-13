<template>
  <v-container fluid>
    <v-card>
      <v-card-title>
        <h6>Bruger</h6>
      </v-card-title>
      <v-card-text>
        <v-text-field v-model="email" required name="email" label="Email" id="email"></v-text-field>
        <v-select required item-text="name" item-value="id" :items="$store.state.clients.items" v-model="client" label="Klient"></v-select>
      </v-card-text>
      <v-card-actions>
        <v-spacer/>
        <v-btn primary @click.native.stop="alert = true">Slet</v-btn>
      </v-card-actions>
    </v-card>
    <v-dialog v-model="alert" lazy absolute>         
      <v-card>
        <v-card-title>
          <div class="headline">slet bruger?</div>
        </v-card-title>
        <v-card-text>Er du sikker på at du vil slette brugeren?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn class="green--text darken-1" flat="flat" @click.native="alert = false">Nej</v-btn>
          <v-btn class="green--text darken-1" flat="flat" @click.native="remove()">Ja</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
<script>
export default {
  data () {
    return {
      alert: false
    }
  },
  methods: {
    remove (item) {
      this.$store.dispatch('users/remove', this.form).then(() => {
        this.$router.go(-1)
      })
    }
  },
  computed: {
    email: {
      get () {
        return this.form.email
      },
      set (e) {
        this.form.email = e
        this.$store.dispatch('users/edit', this.form)
      }
    },
    client: {
      get () {
        return this.form.client
      },
      set (e) {
        this.form.client = e
        this.$store.dispatch('users/edit', this.form)
      }
    },
    form () {
      const newItem = this.$store.state.users.items.find(item => item.id === this.$route.params.id) || {}
      return { ...newItem }
    }
  },
  watch: {
  },
  mounted () {
  }
}
</script>
<style scoped lang="stylus">
</style>