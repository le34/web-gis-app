export const state = () => ({
  items: [],
  matrikel: false,
  buildings: false,
  light: false,
  dark: true,
  satellite: false
})

export const getters = {
  get: state => data => {
    return state.items.find(item => {
      return item.id === data
    })
  },
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
      item.groups = [...item.groups].sort((a, b) => {
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
      state.items = [...state.items, {...data.group, groups: [{visible: data.layer.visible, name: data.layer.name, paint: data.layer.paint, layers: [data.layer], source: data.group.meta ? data.group.meta.source : 0}]}]
    } else {
      const indexGroup = state.items[index].groups.findIndex(group => {
        return group.name === data.layer.name
      })
      let temp = [...state.items]
      let groups = [...temp[index].groups]
      if (indexGroup === -1) {
        let group = {visible: data.layer.visible, name: data.layer.name, paint: data.layer.paint, layers: [data.layer], source: data.group.meta ? data.group.meta.source : 0}
        temp[index].groups = [...temp[index].groups, group]
      } else {
        let group = {...groups[indexGroup]}
        group.layers = [...group.layers, data.layer]
        temp[index].groups[indexGroup] = group
      }
      state.items = temp
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
    const index = state.items.findIndex(item => {
      return item.id === data.id
    })
    if (index !== -1) {
      const indexGroup = state.items[index].groups.findIndex(item => {
        return item.name === data.layer.name
      })
      if (indexGroup !== -1) {
        let group = {...state.items[index]}
        let subgroups = [...group.groups]
        subgroups[indexGroup] = data.layer
        group.groups = subgroups
        let groups = [...state.items]
        groups[index] = group
        state.items = groups
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
