// server.js — KAVE: static pages, submit API, live stats over Socket.io, PIN-guarded admin.
// Pages: /  (phone form)   /screen  (big screen)   /admin  (PIN: ADMIN_PIN)
const path = require('path');
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const QRCode = require('qrcode');
const db = require('./db');
const { JOBS, normalize, BY_EN } = require('./jobs');

const PORT = process.env.PORT || 3000;
const PIN = (process.env.ADMIN_PIN || '1234').trim();
if (!process.env.ADMIN_PIN) console.warn('[warn] ADMIN_PIN not set, using 1234');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.set('trust proxy', true); // Render terminates TLS; makes req.protocol https for the QR URL
app.use(express.json({ limit: '20kb' }));

// ponytail: display state lives in memory; resets to defaults on restart.
const state = { qrVisible: true, mode: 'auto' }; // mode: auto | now | future

function readCookie(req, name) {
  for (const part of (req.headers.cookie || '').split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return decodeURIComponent(v.join('='));
  }
  return null;
}
function requirePin(req, res, next) {
  if (req.query.pin !== undefined && req.query.pin === PIN) {
    res.setHeader('Set-Cookie', `pin=${encodeURIComponent(PIN)}; Path=/; SameSite=Lax; Max-Age=31536000`);
    return res.redirect(req.path);
  }
  if (readCookie(req, 'pin') === PIN) return next();
  if (req.originalUrl.startsWith('/api/')) return res.status(401).json({ error: 'PIN' });
  res.status(401).send(`<!doctype html><meta name=viewport content="width=device-width,initial-scale=1">
    <body style="font-family:system-ui;display:grid;place-items:center;height:100vh;margin:0;background:#0b1020;color:#eee">
    <form method=GET style="text-align:center"><h2>Admin PIN</h2>
    <input name=pin type=password inputmode=numeric autofocus style="font-size:2rem;width:8ch;text-align:center">
    <br><br><button style="font-size:1.2rem;padding:.5rem 2rem">Enter</button></form></body>`);
}

const PUB = path.join(__dirname, 'public');
app.get('/health', (_req, res) => res.send('ok'));
app.get('/', (_req, res) => res.sendFile(path.join(PUB, 'index.html')));
app.get('/screen', (_req, res) => res.sendFile(path.join(PUB, 'screen.html')));
app.get('/admin', requirePin, (_req, res) => res.sendFile(path.join(PUB, 'admin.html')));
app.get('/jobs.json', (_req, res) => res.json(JOBS));
app.use(express.static(PUB, { index: false }));

const publicUrl = (req) => (process.env.PUBLIC_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '') + '/';
app.get('/qr.svg', async (req, res) => {
  const svg = await QRCode.toString(publicUrl(req), { type: 'svg', margin: 1, color: { dark: '#0b1020', light: '#ffffff' } });
  res.type('image/svg+xml').send(svg);
});
app.get('/api/url', (req, res) => res.json({ url: publicUrl(req) }));

async function fullStats() {
  const s = await db.stats();
  const label = (r) => ({ key: r.key, en: r.key, ko: BY_EN.get(r.key)?.ko || null, count: r.count });
  return { total: s.total, now: s.now.map(label), future: s.future.map(label) };
}
async function broadcast() { io.emit('stats', await fullStats()); }

const str = (v, max) => String(v ?? '').trim().slice(0, max);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

app.post('/api/submit', async (req, res) => {
  const b = req.body || {};
  const first = str(b.first_name, 60), last = str(b.last_name, 60), email = str(b.email, 120);
  const errors = [];
  if (!first) errors.push('first_name');
  if (!last) errors.push('last_name');
  if (!EMAIL_RE.test(email)) errors.push('email');
  if (errors.length) return res.status(400).json({ error: 'invalid', fields: errors });
  const current = str(b.current_job, 80), future = str(b.future_job, 80);
  try {
    const id = await db.insertSubmission({
      korean_name: str(b.korean_name, 40) || null,
      first_name: first, last_name: last, full_name: `${first} ${last}`, email,
      current_job: current || null, current_key: normalize(current),
      future_job: future || null, future_key: normalize(future),
    });
    res.json({ ok: true, id });
    broadcast().catch((e) => console.error('broadcast', e));
  } catch (e) {
    console.error('submit', e);
    res.status(500).json({ error: 'server' });
  }
});

app.get('/api/stats', async (_req, res) => res.json(await fullStats()));
app.get('/api/state', (_req, res) => res.json(state));
app.post('/api/admin/state', requirePin, (req, res) => {
  const b = req.body || {};
  if (typeof b.qrVisible === 'boolean') state.qrVisible = b.qrVisible;
  if (['auto', 'now', 'future'].includes(b.mode)) state.mode = b.mode;
  io.emit('state', state);
  res.json(state);
});

io.on('connection', async (socket) => {
  socket.emit('state', state);
  try { socket.emit('stats', await fullStats()); } catch (e) { console.error(e); }
});

db.init().then(() => server.listen(PORT, () => console.log(`KAVE on http://localhost:${PORT}`)))
  .catch((e) => { console.error('db init failed', e); process.exit(1); });
