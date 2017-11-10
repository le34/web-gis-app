// Control implemented as ES6 class
const mapboxgl = require('mapbox-gl/dist/mapbox-gl')
require('mapbox-gl/dist/mapbox-gl.css')
class LayerSwitcher {
  update () {
    let zoom = this._map.getZoom()
    zoom = zoom - 2 >= 0 ? zoom - 2 : zoom
    this._minimap.jumpTo({center: this._map.getCenter(), zoom: zoom, bearing: this._map.getBearing(), pitch: this._map.getPitch()})
  }
  onAdd (map) {
    this._map = map
    this._isOrto = true
    this._container = document.createElement('div')
    this._container.className = 'layer-switcher'
    mapboxgl.accessToken = 'pk.eyJ1IjoicnVuZXR2aWx1bSIsImEiOiJkeUg2WVkwIn0.yoMmv3etOc40RXkPsebXSg'
    var ll = new mapboxgl.LngLat(12, 56)
    this._minimap = new mapboxgl.Map({
      container: this._container,
      center: ll,
      zoom: 6,
      maxZoom: 21,
      style: map.getStyle(), // tilejson, // 'mapbox://styles/mapbox/streets-v9',
      interactive: false,
      attributionControl: false
    })
    this._map.on('styledataloading', e => {
      console.log(this._minimap)
      this._minimap.setStyle(e.style.stylesheet, {diff: false})
    })
    /*
    this._map.on('styledata', e => {
      console.log(e)
      // this._minimap.setStyle(this._map.getStyle())
    })
    */
    this._minimap.on('styledataloading', e => {
      console.log('minimap styledataloading', e)
      /*
      if (this._isOrto) {
        // this._minimap.setStyle('/api/tileserver/styles/light-v9/style.json')
        // this._map.setStyle(tilejson)
        this._map.setLayoutProperty('ortofoto', 'visibility', 'visible')
        this._minimap.setLayoutProperty('ortofoto', 'visibility', 'none')
      } else {
        // this._map.setStyle('mapbox://styles/mapbox/streets-v10')
        this._map.setLayoutProperty('ortofoto', 'visibility', 'none')
        this._minimap.setLayoutProperty('ortofoto', 'visibility', 'visible')
        // this._minimap.setStyle(tilejson)
      }
      */
    })
    this._minimap.on('load', () => {
      this._minimap.setLayoutProperty('ortofoto', 'visibility', 'visible')
      this._map.on('move', this.update.bind(this)).on('rotate', this.update.bind(this))
      setTimeout(() => {
        this._minimap.resize()
      }, 1000)
      this._minimap.on('click', () => {
        if (this._isOrto) {
          // this._minimap.setStyle('/api/tileserver/styles/light-v9/style.json')
          // this._map.setStyle(tilejson)
          this._map.setLayoutProperty('ortofoto', 'visibility', 'visible')
          this._minimap.setLayoutProperty('ortofoto', 'visibility', 'none')
        } else {
          // this._map.setStyle('mapbox://styles/mapbox/streets-v10')
          this._map.setLayoutProperty('ortofoto', 'visibility', 'none')
          this._minimap.setLayoutProperty('ortofoto', 'visibility', 'visible')
          // this._minimap.setStyle(tilejson)
        }
        this._isOrto = !this._isOrto
      })
    })
    return this._container
  }

  onRemove () {
    this._container.parentNode.removeChild(this._container)
    this._map = undefined
  }
}

export { LayerSwitcher }
