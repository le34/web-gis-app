import { Router } from 'express'
import fs from 'fs'
import path from 'path'
import MBTiles from '@mapbox/mbtiles'
import zlib from 'zlib'
// import zlib from 'zlib'

const port = process.env.PORT || 3000
const urlPrefix = process.env.URL_PREFIX || 'http://localhost:' + port
const router = Router()
const filePath = process.env.MBTILES || path.join(__dirname, '../../mbtiles')

router.get('/:id', function (req, res) {
  const mbtilesFile = path.join(filePath, req.params.id + '.mbtiles')
  fs.stat(mbtilesFile, (err, stats) => {
    if (err || !stats.isFile() || stats.size === 0) {
      return res.status(404).send('ERROR: Not valid MBTiles file: ' + req.params.id)
    }
    const instance = new MBTiles(mbtilesFile, function (err) {
      if (err) {
        return res.status(500).json(err)
      }
      instance.getInfo(function (err, info) {
        if (err || !info) {
          return res.status(404).send('ERROR: Metadata missing in the MBTiles.')
        }
        info.tiles = [urlPrefix + '/api/tiles/' + req.params.id + '/{z}/{x}/{y}.' + info.format]
        res.json(info)
      })
    })
  })
})
router.get('/:id/:z(\\d+)/:x(\\d+)/:y(\\d+).:format([\\w.]+)', function (req, res) {
  const z = req.params.z | 0
  const x = req.params.x | 0
  const y = req.params.y | 0
  const format = req.params.format
  const mbtilesFile = path.join(filePath, req.params.id + '.mbtiles')
  const source = new MBTiles(mbtilesFile, function (err) {
    if (err) {
      return res.status(500).json(err)
    }
    source.getTile(z, x, y, function (err, data, headers) {
      if (err) {
        if (/does not exist/.test(err.message)) {
          return res.status(404).send(err.message)
        } else {
          return res.status(500).send(err.message)
        }
      }
      if (format === 'png') {
        res.set('Content-Type', 'image/png')
        res.send(data)
      } else {
        res.set('Content-Encoding', 'gzip')
        res.set('Content-Type', 'application/x-protobuf')
        const isGzipped = data.slice(0, 2).indexOf(Buffer.from([0x1f, 0x8b])) === 0
        if (isGzipped) {
          return res.send(data)
        }
        data = zlib.gzip(data, (err, result) => {
          if (err) {
            return res.status(500).json(err)
          }
          res.send(result)
        })
      }
    })
  })
})

export default router
