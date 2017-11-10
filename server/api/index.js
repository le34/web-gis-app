import { Router } from 'express'

import files from './files'
import tiles from './tiles'
import fonts from './fonts'
import styles from './styles'
import style from './style'
import sprites from './sprites'

const router = Router()

// Add USERS Routes
router.use('/files', files)
router.use('/tiles', tiles)
router.use('/fonts', fonts)
router.use('/styles', styles)
router.use('/style', style)
router.use('/sprites', sprites)

export default router
