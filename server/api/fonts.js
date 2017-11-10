import { Router } from 'express'
import fs from 'fs'
import path from 'path'

const router = Router()
const filePath = process.env.FONTS || path.join(__dirname, '../../fonts')
router.get('/:fontstack/:range([\\d]+-[\\d]+).pbf', function (req, res, next) {
  const fontstack = decodeURI(req.params.fontstack).split(',')
  const range = req.params.range
  const filename = path.join(filePath, fontstack[0], range + '.pbf')
  fs.readFile(filename, function (err, data) {
    if (err) {
      return res.status(404).json(err)
    }
    res.header('Content-type', 'application/x-protobuf')
    res.send(data)
  })
})

export default router
