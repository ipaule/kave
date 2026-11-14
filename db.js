// db.js — Turso (hosted SQLite) in production, local file in development.
//   TURSO_URL set   -> libsql://...  (needs TURSO_TOKEN)
//   TURSO_URL empty -> file:local.db
const { createClient } = require('@libsql/client');

const clean = (v) => String(v || '').split('\n')[0].trim();
const db = createClient({
  url: clean(process.env.TURSO_URL) || 'file:local.db',
  authToken: clean(process.env.TURSO_TOKEN) || undefined,
});

const SCHEMA = `
CREATE TABLE IF NOT EXISTS submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  korean_name TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  current_job TEXT,
  current_key TEXT,
  future_job TEXT,
  future_key TEXT,
  created_at INTEGER NOT NULL
);`;

async function init() { await db.executeMultiple(SCHEMA); }

async function insertSubmission(s) {
  const r = await db.execute({
    sql: `INSERT INTO submissions (korean_name, first_name, last_name, full_name, email,
          current_job, current_key, future_job, future_key, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [s.korean_name, s.first_name, s.last_name, s.full_name, s.email,
      s.current_job, s.current_key, s.future_job, s.future_key, Date.now()],
  });
  return Number(r.lastInsertRowid);
}

// {total, now:[{key,count}], future:[{key,count}]}
async function stats() {
  const [t, n, f] = await db.batch([
    'SELECT COUNT(*) AS c FROM submissions',
    "SELECT current_key AS key, COUNT(*) AS count FROM submissions WHERE current_key IS NOT NULL AND current_key <> '' GROUP BY current_key ORDER BY count DESC",
    "SELECT future_key AS key, COUNT(*) AS count FROM submissions WHERE future_key IS NOT NULL AND future_key <> '' GROUP BY future_key ORDER BY count DESC",
  ], 'read');
  const map = (rs) => rs.rows.map((r) => ({ key: r.key, count: Number(r.count) }));
  return { total: Number(t.rows[0].c), now: map(n), future: map(f) };
}

module.exports = { init, insertSubmission, stats };
