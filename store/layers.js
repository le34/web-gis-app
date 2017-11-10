export const state = () => ({
  items: [],
  matrikel: false,
  buildings: false,
  light: false,
  dark: true,
  satellite: false
})

export const getters = {
  list: state => {
    return state.items
  },
  sortedList: state => {
    let data = [...state.items].sort((a, b) => {
      if (a.createdAt < b.createdAt) {
        return -1
      }
      if (a.createdAt > b.createdAt) {
        return 1
      }
      return 0
    })
    for (var i = 0; i < data.length; i++) {
      let item = {...data[i]}
      item.layers = [...item.layers].sort((a, b) => {
        if (a.name < b.name) {
          return -1
        }
        if (a.name > b.name) {
          return 1
        }
        return 0
      })
      data[i] = item
    }
    return data
  }
}

export const mutations = {
  light (state, data) {
    state.light = data
  },
  dark (state, data) {
    state.dark = data
  },
  satellite (state, data) {
    state.satellite = data
  },
  matrikel (state, data) {
    state.matrikel = data
  },
  buildings (state, data) {
    state.buildings = data
  },
  list (state, data) {
    state.items = data
  },
  add (state, data) {
    const index = state.items.findIndex(item => {
      return item.id === data.group.id
    })
    if (index === -1) {
      state.items = [...state.items, {...data.group, layers: [data.layer]}]
    } else {
      const indexLayer = state.items[index].layers.findIndex(item => {
        return item.id === data.layer.id
      })
      if (indexLayer === -1) {
        let temp = [...state.items]
        temp[index].layers = [...temp[index].layers, data.layer]
        state.items = temp
      }
    }
  },
  items (state, data) {
    state.items = data
  },
  editGroup (state, data) {
    const index = state.items.findIndex(item => {
      return item.id === data.id
    })
    if (index !== -1) {
      let temp = [...state.items]
      temp[index] = data
      state.items = temp
    }
  },
  editLayer (state, data) {
    console.log(data)
    const index = state.items.findIndex(item => {
      return item.id === data.id
    })
    if (index !== -1) {
      const indexLayer = state.items[index].layers.findIndex(item => {
        return item.id === data.layer.id
      })
      if (indexLayer !== -1) {
        let group = {...state.items[index]}
        let layers = [...group.layers]
        layers[indexLayer] = data.layer
        group.layers = layers
        let groups = [...state.items]
        groups[index] = group
        state.items = groups
        console.log('ok')
      }
    }
  },
  remove (state, data) {
    state.items = state.items.filter(item => item.id !== data.id)
  }
}

export const actions = {
  add (context, data) {
    return context.commit('add', data)
  },
  edit (context, data) {
    return context.commit('edit', data)
  },
  remove (context, data) {
    return context.commit('remove', data)
  }
}
