import { Router } from 'express'
import fs from 'fs'
import path from 'path'

const router = Router()
const filePath = process.env.STYLES || path.join(__dirname, '../../styles')
router.get('/:style/:sprite.:format', function (req, res, next) {
  const filename = path.join(filePath, req.params.style, req.params.sprite + '.' + req.params.format)
  fs.readFile(filename, function (err, data) {
    if (err) {
      return res.status(404).json(err)
    }
    if (req.params.format === 'json') res.header('Content-type', 'application/json')
    if (req.params.format === 'png') res.header('Content-type', 'image/png')
    res.send(data)
  })
})

export default router
