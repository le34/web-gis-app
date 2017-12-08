<template>
  <v-snackbar :color="color" :absolute="absolute" :bottom="bottom" :left="left" :multiLine="multiLine" :right="right" :top="top" :timeout="timeout" :vertical="vertical" v-model="value">
    <slot></slot>
  </v-snackbar>
</template>
<script>
export default {
  name: 'global-snackbar',
  props: {
    color: String,
    value: Boolean,
    absolute: Boolean,
    bottom: Boolean,
    left: Boolean,
    multiLine: Boolean,
    right: Boolean,
    top: Boolean,
    // TODO: change this to closeDelay to match other API in delayable.js
    timeout: {
      type: Number,
      default: 6000
    },
    vertical: Boolean
  },
  mounted () {
    const app = document.querySelector('[data-app]')

    if (!app) {
      return console.warn('Application is missing <v-app> component.')
    }

    // If child has already been removed, bail
    // if (!this.$refs.content) return console.warn('no content')
    // console.log(this.$refs)

    app.insertBefore(this.$el, app.firstChild)
  }
}
</script>