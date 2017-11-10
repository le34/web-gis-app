import { Router } from 'express'
import xml2js from 'xml2js'
import path from 'path'
import fs from 'fs'
import iconv from 'iconv-lite'
const router = Router()
var parser = new xml2js.Parser()
const filePath = process.env.XFM || path.join(__dirname, '../../xfm')
router.get('/', function (req, res, next) {
  const files = fs.readdirSync(filePath)
  const names = []
  files.forEach(file => {
    let p = path.parse(file)
    if (p.ext === '.xfm') {
      names.push(p.name)
    }
  })
  res.json(names)
})

router.get('/:style', function (req, res, next) {
  const json = {
    id: req.params.style,
    layers: {}
  }
  fs.readFile(path.join(filePath, req.params.style + '.xfm'), function (err, data) {
    if (err) {
      return res.status(500).json(err)
    }
    let encoding = 'iso-8859-1'
    if (data[0] === 255) {
      encoding = 'utf-16'
    }
    data = iconv.decode(data, encoding)
    parser.parseString(data, function (err, result) {
      if (err) {
        return res.status(500).json(err)
      }
      result.GeospatialSchema.Workspace[0].Features[0].feature.forEach(element => {
        if (element.hasOwnProperty('X34')) {
          let options = {
            name: element.$.alias,
            category: element.$.category
          }
          element.X34.forEach(style => {
            let width = style.WebGisWidth ? parseInt(style.WebGisWidth[0]) : 2
            width = width > 2 ? width : 2
            const color = style.WebGisColor ? style.WebGisColor[0] : '#000'
            let dash = null
            if (style.WebGisDash) {
              dash = (style.WebGisDash[0].split(' ')).map(item => parseInt(item)).filter(item => { return !isNaN(item) })
              if (dash.length < 2) {
                dash = null
              }
            }
            if (element.Symbology[0].$.type === 'linear') {
              options.type = 'line'
              options.paint = {
                'line-color': color,
                'line-width': width
              }
              if (dash) {
                options.paint['line-dasharray'] = dash
              }
            } else if (element.Symbology[0].$.type === 'cell') {
              options.type = 'circle'
              options.paint = {
                'circle-radius': {
                  'base': 1.75,
                  'stops': [[12, 2], [22, 10]]
                },
                'circle-opacity': 0.7,
                'circle-color': color
              // 'circle-stroke-color': style.WebGisColor ? style.WebGisColor[0] : '#000',
              // 'circle-stroke-width': 2 // parseInt(style.WebGisWidth[0])
              }
            } else if (element.Symbology[0].$.type === 'shape') {
              options.type = 'line'
              options.paint = {
                'line-color': color,
                'line-width': width
                /*
                  'fill-outline-color': style.WebGisColor ? style.WebGisColor[0] : '#000',
                  'fill-color': style.WebGisFillColor ? style.WebGisFillColor[0] : '#000',
                  'fill-opacity': style.WebGisFillOpacity && !isNaN(parseFloat(style.WebGisFillOpacity[0])) ? parseFloat(style.WebGisFillOpacity[0]) : 1
                  */
              }
              if (dash) {
                options.paint['line-dasharray'] = dash
              }
            }
            json.layers[element.$.name] = options
          })
        }
      })
      res.status(200).json(json)
    })
  })
})
export default router
