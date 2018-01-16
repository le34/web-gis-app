export const state = () => ({
  layers: []
})

export const getters = {
  activeBasemap: state => {
    return state.layers.find(item => {
      return item.isBasemap && item.active
    })
  },
  basemaps: state => {
    return state.layers.filter(item => {
      return item.isBasemap
    })
  },
  layers: state => {
    // return state.layers
    return state.layers.filter(item => {
      return !item.isBasemap
    })
  }
}

export const mutations = {
  clearLayers (state, data) {
    state.layers = []
  },
  addLayer (state, data) {
    state.layers = [...state.layers, data]
  },
  editLayer (state, data) {
    const index = state.layers.findIndex(item => {
      return item.id === data.id
    })
    if (index !== -1) {
      let temp = [...state.layers]
      temp[index] = data
      state.layers = temp
    }
  }
}
