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

export default db