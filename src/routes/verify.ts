import { Router, Request, Response } from 'express'
import { getAyah } from '../services/quranService.js'
import { compareAyah } from '../services/comparisonService.js'

const router = Router()

router.post('/', async (req: Request, res: Response) => {
  const { surah, ayah, transcript } = req.body

  if (!surah || !ayah || !transcript) {
    res.status(400).json({ error: 'Missing surah, ayah, or transcript' })
    return
  }

  try {
    const ayahData = await getAyah(surah, ayah)
    const result = compareAyah(transcript, ayahData.arabic)

    res.json({
      match: result.match,
      similarity: result.similarity,
      transcribed: transcript,
      actual: ayahData.arabic,
      surah: ayahData.englishName,
      ayah
    })
  } catch (err) {
    res.status(500).json({ error: 'Failed to verify recitation' })
  }
})

router.post('/range', async (req: Request, res: Response) => {
  const { surah, startAyah, endAyah, transcript } = req.body

  if (!surah || !startAyah || !endAyah || !transcript) {
    res.status(400).json({ error: 'Missing fields' })
    return
  }

  try {
    // fetch all ayahs in range
    const fetchPromises = []
    for (let i = startAyah; i <= endAyah; i++) {
      fetchPromises.push(getAyah(surah, i))
    }
    const ayahs = await Promise.all(fetchPromises)
    const fullArabic = ayahs.map(a => a.arabic).join(' ')

    const result = compareAyah(transcript, fullArabic)

    res.json({
      match: result.match,
      similarity: result.similarity,
      ayahCount: ayahs.length,
      transcribed: transcript,
      actual: fullArabic
    })
  } catch (err) {
    res.status(500).json({ error: 'Failed to verify range' })
  }
})

export default router