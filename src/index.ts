import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import verifyRoute from './routes/verify.js'
import timeRoute from './routes/time.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ status: 'ok', app: 'Waqt API' })
})

app.use('/verify', verifyRoute)
app.use('/time', timeRoute)

app.listen(PORT, () => {
  console.log(`Waqt API running on port ${PORT}`)
})