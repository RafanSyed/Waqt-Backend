import { Router, Request, Response } from 'express'
import { getPage } from '../services/quranService.js'
import { compareTranscript } from '../services/comparisonService.js'
import { addMinutesFromReading } from '../services/timeService.js'

const router = Router()

router.post('/', async (req: Request, res: Response) => {
  const { page, transcript, speechSeconds } = req.body

  if (
    !page ||
    !transcript ||
    typeof speechSeconds !== 'number'
  ) {
    res.status(400).json({
      error: 'Missing page, transcript, or speechSeconds'
    })
    return
  }

  try {
    // Fetch full Quran page
    const pageData = await getPage(page)

    // Combine all ayahs into one comparison string
    const fullPageText = pageData.ayahs
      .map(a => a.text)
      .join(' ')

    // Similarity verification
    const comparison = compareTranscript(
      transcript,
      fullPageText
    )

    /**
     * TIME VERIFICATION
     *
     * Goal:
     * Prevent fake uploads or instant recordings.
     *
     * Average Quran page:
     * ~3-6 minutes depending on pace.
     */

    const MIN_SECONDS = 50 // 3 mins
    const MAX_SECONDS = 480 // 8 mins

    const validTime =
      speechSeconds >= MIN_SECONDS &&
      speechSeconds <= MAX_SECONDS

    // Final verification
    const verified =
      comparison.match && validTime

    let minutesEarned = 0

    if (verified) {
      minutesEarned = speechSeconds / 60
      await addMinutesFromReading(minutesEarned)
    }

    res.json({
      verified,

      reason: !comparison.match
        ? 'Transcript similarity too low'
        : !validTime
        ? 'Recording duration invalid for a Quran page'
        : 'Success',

      similarity: comparison.similarity,

      page: pageData.page,

      surahs: pageData.surahs,

      ayahCount: pageData.ayahs.length,

      speechSeconds,

      minutesEarned: parseFloat(
        minutesEarned.toFixed(2)
      ),

      thresholds: {
        minSeconds: MIN_SECONDS,
        maxSeconds: MAX_SECONDS
      }
    })
  } catch (err) {
    console.error(err)

    res.status(500).json({
      error: 'Failed to verify Quran page'
    })
  }
})

export default router