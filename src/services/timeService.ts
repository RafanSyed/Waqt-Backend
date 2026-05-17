import db from './db.js'

function today() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' })
}

export function getRemaining() {
  const row = getOrCreateToday()
  const total = row.base_minutes + row.earned_minutes
  const remaining = total - row.used_minutes
  return {
    remaining: Math.max(0, remaining),
    total,
    used: row.used_minutes,
    date: row.date
  }
}

export function addMinutes(minutes: number) {
  const date = today()
  getOrCreateToday()
  db.prepare(`
    UPDATE time_bank SET earned_minutes = earned_minutes + ? WHERE date = ?
  `).run(minutes, date)
  return getRemaining()
}

export function deductSeconds(seconds: number) {
  const date = today()
  getOrCreateToday()
  db.prepare(`
    UPDATE time_bank SET used_minutes = used_minutes + ? WHERE date = ?
  `).run(seconds / 60, date)
  return getRemaining()
}

export function getSettings() {
  return db.prepare('SELECT * FROM settings WHERE id = 1').get() as any
}

export function updateSettings(baseMinutes: number, conversionRate: number) {
  db.prepare(`
    UPDATE settings SET base_minutes = ?, conversion_rate = ? WHERE id = 1
  `).run(baseMinutes, conversionRate)

  // also update today's base minutes immediately
  const date = today()
  getOrCreateToday()
  db.prepare(`
    UPDATE time_bank SET base_minutes = ? WHERE date = ?
  `).run(baseMinutes, date)

  return getSettings()
}

// update getOrCreateToday to use settings base_minutes
function getOrCreateToday() {
  const date = today()
  const row = db.prepare('SELECT * FROM time_bank WHERE date = ?').get(date) as any

  if (!row) {
    const settings = getSettings()
    db.prepare(`
      INSERT INTO time_bank (date, base_minutes, earned_minutes, used_minutes)
      VALUES (?, ?, 0, 0)
    `).run(date, settings.base_minutes)
    return db.prepare('SELECT * FROM time_bank WHERE date = ?').get(date) as any
  }

  return row
}

// update addMinutes to use conversion rate
export function addMinutesFromReading(readingMinutes: number) {
  const settings = getSettings()
  const watchMinutes = readingMinutes * settings.conversion_rate
  return addMinutes(watchMinutes)
}