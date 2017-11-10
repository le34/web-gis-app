import { Router } from 'express'
import fs from 'fs'
import path from 'path'

const router = Router()
const port = process.env.PORT || 3000
const urlPrefix = process.env.URL_PREFIX || 'http://localhost:' + port
const filePath = process.env.STYLES || path.join(__dirname, '../../styles')

router.get('/', function (req, res, next) {
  fs.readdir(filePath, (err, files) => {
    if (err) {
      return res.status(500).json(err)
    }
    res.json(files)
  })
})

router.get('/:id', function (req, res, next) {
  const filename = path.join(filePath, req.params.id, 'style.json')
  fs.readFile(filename, function (err, data) {
    if (err) {
      return res.status(404).json(err)
    }
    const style = JSON.parse(data)
    Object.keys(style.sources).forEach(key => {
      const source = style.sources[key]
      if (source.url) {
        source.url = source.url.replace('{urlPrefix}', urlPrefix)
      }
    })
    if (style.sprite) {
      style.sprite = style.sprite.replace('{urlPrefix}', urlPrefix)
    } if (style.glyphs) {
      style.glyphs = style.glyphs.replace('{urlPrefix}', urlPrefix)
    }
    res.json(style)
  })
})

export default router
