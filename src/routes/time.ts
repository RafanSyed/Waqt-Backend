import { Router, Request, Response } from 'express'
import { getRemaining, addMinutesFromReading, deductSeconds } from '../services/timeService.js'
import db from '../services/db.js'
//handle time related routes
const router = Router()

// GET /time/remaining
router.get('/remaining', (req: Request, res: Response) => {
  res.json(getRemaining())
})

// POST /time/add  body: { minutes: 10 } (reading minutes, not watch minutes)
router.post('/add', (req: Request, res: Response) => {
  const { minutes } = req.body
  if (!minutes || minutes <= 0) {
    res.status(400).json({ error: 'Invalid minutes' })
    return
  }
  res.json(addMinutesFromReading(minutes))
})

// POST /time/deduct  body: { seconds: 30 }
router.post('/deduct', (req: Request, res: Response) => {
  const { seconds } = req.body
  if (!seconds || seconds <= 0) {
    res.status(400).json({ error: 'Invalid seconds' })
    return
  }
  const result = deductSeconds(seconds)
  res.json({
    ...result,
    blocked: result.remaining <= 0
  })
})

router.post('/reset', (req, res) => {
  const date = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' })
  db.prepare('DELETE FROM time_bank WHERE date = ?').run(date)
  res.json({ message: 'reset done' })
})

export default router