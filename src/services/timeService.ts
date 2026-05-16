import db from './db.js'

function today() {
  return new Date().toISOString().split('T')[0]
}

function getOrCreateToday() {
  const date = today()
  const row = db.prepare('SELECT * FROM time_bank WHERE date = ?').get(date) as any

  if (!row) {
    db.prepare(`
      INSERT INTO time_bank (date, base_minutes, earned_minutes, used_minutes)
      VALUES (?, 60, 0, 0)
    `).run(date)
    return db.prepare('SELECT * FROM time_bank WHERE date = ?').get(date) as any
  }

  return row
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