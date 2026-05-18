import Database from 'better-sqlite3'
import path from 'path'

const db = new Database(path.resolve('waqt.db'))

db.exec(`
  CREATE TABLE IF NOT EXISTS time_bank (
    id INTEGER PRIMARY KEY,
    date TEXT NOT NULL UNIQUE,
    base_minutes INTEGER NOT NULL DEFAULT 60,
    earned_minutes INTEGER NOT NULL DEFAULT 0,
    used_minutes REAL NOT NULL DEFAULT 0
  )
`)

db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY,
    base_minutes INTEGER NOT NULL DEFAULT 60,
    conversion_rate REAL NOT NULL DEFAULT 2
  )
`)

// insert default settings if not exists
const existing = db.prepare('SELECT * FROM settings WHERE id = 1').get()
if (!existing) {
  db.prepare(`
    INSERT INTO settings (id, base_minutes, conversion_rate) VALUES (1, 60, 2)
  `).run()
}

export default db