import { Router } from 'express'
import fs from 'fs'
import path from 'path'

const router = Router()
const filePath = process.env.MBTILES || path.join(__dirname, '../../mbtiles')
router.get('/', function (req, res, next) {
  fs.readdir(path.join(filePath), (err, files) => {
    if (err) {
      return res.status(500).json(err)
    }
    const result = files.filter(file => {
      return path.extname(file) === '.mbtiles'
    }).map(file => path.basename(file, path.extname(file)))
    res.json(result)
  })
})

export default router
