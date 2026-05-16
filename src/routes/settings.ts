import { Router, Request, Response } from 'express'
import { getSettings, updateSettings } from '../services/timeService.js'

const router = Router()

// GET /settings
router.get('/', (req: Request, res: Response) => {
  res.json(getSettings())
})

// POST /settings  body: { baseMinutes: 60, conversionRate: 10 }
router.post('/', (req: Request, res: Response) => {
  const { baseMinutes, conversionRate } = req.body

  if (!baseMinutes || !conversionRate || baseMinutes <= 0 || conversionRate <= 0) {
    res.status(400).json({ error: 'Invalid settings' })
    return
  }

  res.json(updateSettings(baseMinutes, conversionRate))
})

export default router