import { Router } from 'express'

import cvr from './cvr'

const router = Router()

// Add USERS Routes
router.use('/cvr', cvr)

export default router
