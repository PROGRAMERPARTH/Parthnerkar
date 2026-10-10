/* ============================================
   server.js — Express server for Portfolio Builder
   Serves the production build on localhost
   ============================================ */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
import crypto from 'crypto';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const isDevelopment = process.argv.includes('--dev');
const PORT = process.env.PORT || (isDevelopment ? 5173 : 3000);
const useSecureCookies = process.env.NODE_ENV === 'production' && !isDevelopment;
const SESSION_COOKIE = 'portfolio_admin_session';
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 10 * 60 * 1000;
const sessions = new Map();
const loginAttempts = new Map();

// ---------- Middleware ----------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.disable('x-powered-by');

app.use((req, res, next) => {
  res.set({
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
  });
  next();
});

function getCookie(req, name) {
  const cookies = req.headers.cookie || '';
  const prefix = `${name}=`;
  const entry = cookies.split(';').map((item) => item.trim()).find((item) => item.startsWith(prefix));
  return entry ? decodeURIComponent(entry.slice(prefix.length)) : null;
}

function getSession(req) {
  const token = getCookie(req, SESSION_COOKIE);
  if (!token) return null;

  const session = sessions.get(token);
  if (!session || session.expiresAt <= Date.now()) {
    sessions.delete(token);
    return null;
  }
  return session;
}

function getClientKey(req) {
  return req.ip || req.socket.remoteAddress || 'unknown';
}

function canAttemptLogin(req) {
  const key = getClientKey(req);
  const attempts = loginAttempts.get(key);
  if (!attempts || attempts.resetAt <= Date.now()) {
    loginAttempts.delete(key);
    return true;
  }
  return attempts.count < MAX_LOGIN_ATTEMPTS;
}

function recordFailedLogin(req) {
  const key = getClientKey(req);
  const current = loginAttempts.get(key);
  if (!current || current.resetAt <= Date.now()) {
    loginAttempts.set(key, { count: 1, resetAt: Date.now() + LOGIN_WINDOW_MS });
    return;
  }
  current.count += 1;
}

function passwordMatches(password) {
  // ADMIN_PASSWORD stays server-side. VITE_ADMIN_PASSWORD is read only as a
  // backwards-compatible server fallback and is never sent to the client.
  const configuredPassword = process.env.ADMIN_PASSWORD || process.env.VITE_ADMIN_PASSWORD;
  if (!configuredPassword || typeof password !== 'string') return false;

  const expected = Buffer.from(configuredPassword);
  const received = Buffer.from(password);
  return expected.length === received.length && crypto.timingSafeEqual(expected, received);
}

app.get('/api/auth/session', (req, res) => {
  res.json({ authenticated: Boolean(getSession(req)) });
});

app.post('/api/auth/login', (req, res) => {
  if (!process.env.ADMIN_PASSWORD && !process.env.VITE_ADMIN_PASSWORD) {
    return res.status(503).json({ error: 'Admin authentication is not configured on the server.' });
  }
  if (!canAttemptLogin(req)) {
    return res.status(429).json({ error: 'Too many attempts. Please try again later.' });
  }
  if (!passwordMatches(req.body?.password)) {
    recordFailedLogin(req);
    return res.status(401).json({ error: 'Incorrect password.' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, { expiresAt: Date.now() + SESSION_TTL_MS });
  loginAttempts.delete(getClientKey(req));
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: useSecureCookies,
    maxAge: SESSION_TTL_MS,
    path: '/',
  });
  return res.json({ authenticated: true });
});

app.post('/api/auth/logout', (req, res) => {
  const token = getCookie(req, SESSION_COOKIE);
  if (token) sessions.delete(token);
  res.clearCookie(SESSION_COOKIE, { httpOnly: true, sameSite: 'strict', secure: useSecureCookies, path: '/' });
  res.status(204).end();
});

// ---------- Serve static files from Vite build ----------
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Portfolio Builder server is running!',
    timestamp: new Date().toISOString(),
  });
});

// ---------- Server Database Configuration ----------
const DB_FILE = path.join(__dirname, 'data', 'database.json');

function readDatabase() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initial = { skills: [], projects: [], certificates: [] };
      fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf8');
      return initial;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    const data = JSON.parse(raw);
    return {
      skills: Array.isArray(data.skills) ? data.skills : [],
      projects: Array.isArray(data.projects) ? data.projects : [],
      certificates: Array.isArray(data.certificates) ? data.certificates : [],
    };
  } catch (err) {
    console.error('Error reading database file:', err);
    return { skills: [], projects: [], certificates: [] };
  }
}

function writeDatabase(data) {
  try {
    fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
    const tmpFile = `${DB_FILE}.${Date.now()}.tmp`;
    const payload = JSON.stringify(
      {
        skills: Array.isArray(data.skills) ? data.skills : [],
        projects: Array.isArray(data.projects) ? data.projects : [],
        certificates: Array.isArray(data.certificates) ? data.certificates : [],
      },
      null,
      2
    );
    fs.writeFileSync(tmpFile, payload, 'utf8');
    fs.renameSync(tmpFile, DB_FILE);
    return true;
  } catch (err) {
    console.error('Error writing database file:', err);
    return false;
  }
}

function requireAdmin(req, res, next) {
  const session = getSession(req);
  if (session) return next();

  const directPassword = req.headers['x-admin-password'] || req.body?.adminPassword;
  if (directPassword && passwordMatches(directPassword)) {
    return next();
  }

  return res.status(401).json({ error: 'Authentication required to modify portfolio data.' });
}

// Public endpoint: Fetch all portfolio data for any visitor
app.get('/api/data', (req, res) => {
  const db = readDatabase();
  res.json(db);
});

// ---------- Skills CRUD Endpoints ----------
app.post('/api/skills', requireAdmin, (req, res) => {
  const { name, category, proficiency } = req.body;
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Skill name is required.' });
  }
  const db = readDatabase();
  const newSkill = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    name: name.trim(),
    category: category || 'General',
    proficiency: Number(proficiency) || 80,
  };
  db.skills.push(newSkill);
  writeDatabase(db);
  res.status(201).json(newSkill);
});

app.put('/api/skills/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const db = readDatabase();
  const index = db.skills.findIndex((s) => String(s.id) === String(id));
  if (index === -1) {
    return res.status(404).json({ error: 'Skill not found.' });
  }
  db.skills[index] = {
    ...db.skills[index],
    name: req.body.name ? req.body.name.trim() : db.skills[index].name,
    category: req.body.category || db.skills[index].category,
    proficiency: req.body.proficiency !== undefined ? Number(req.body.proficiency) : db.skills[index].proficiency,
  };
  writeDatabase(db);
  res.json(db.skills[index]);
});

app.delete('/api/skills/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const db = readDatabase();
  db.skills = db.skills.filter((s) => String(s.id) !== String(id));
  writeDatabase(db);
  res.json({ success: true });
});

// ---------- Projects CRUD Endpoints ----------
app.post('/api/projects', requireAdmin, (req, res) => {
  const { title, description, techStack, githubUrl, liveUrl } = req.body;
  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'Project title is required.' });
  }
  const db = readDatabase();
  const newProject = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    title: title.trim(),
    description: description ? description.trim() : '',
    techStack: techStack ? techStack.trim() : '',
    githubUrl: githubUrl ? githubUrl.trim() : '',
    liveUrl: liveUrl ? liveUrl.trim() : '',
  };
  db.projects.push(newProject);
  writeDatabase(db);
  res.status(201).json(newProject);
});

app.put('/api/projects/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const db = readDatabase();
  const index = db.projects.findIndex((p) => String(p.id) === String(id));
  if (index === -1) {
    return res.status(404).json({ error: 'Project not found.' });
  }
  db.projects[index] = {
    ...db.projects[index],
    ...req.body,
    id: db.projects[index].id,
  };
  writeDatabase(db);
  res.json(db.projects[index]);
});

app.delete('/api/projects/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const db = readDatabase();
  db.projects = db.projects.filter((p) => String(p.id) !== String(id));
  writeDatabase(db);
  res.json({ success: true });
});

// ---------- Certificates CRUD Endpoints ----------
app.post('/api/certificates', requireAdmin, (req, res) => {
  const { title, issuer, date, fileUrl, description } = req.body;
  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'Certificate title is required.' });
  }
  const db = readDatabase();
  const newCert = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    title: title.trim(),
    issuer: issuer ? issuer.trim() : '',
    date: date || '',
    fileUrl: fileUrl ? fileUrl.trim() : '',
    description: description ? description.trim() : '',
  };
  db.certificates.push(newCert);
  writeDatabase(db);
  res.status(201).json(newCert);
});

app.put('/api/certificates/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const db = readDatabase();
  const index = db.certificates.findIndex((c) => String(c.id) === String(id));
  if (index === -1) {
    return res.status(404).json({ error: 'Certificate not found.' });
  }
  db.certificates[index] = {
    ...db.certificates[index],
    ...req.body,
    id: db.certificates[index].id,
  };
  writeDatabase(db);
  res.json(db.certificates[index]);
});

app.delete('/api/certificates/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const db = readDatabase();
  db.certificates = db.certificates.filter((c) => String(c.id) !== String(id));
  writeDatabase(db);
  res.json({ success: true });
});

// API routes must never fall through to the SPA document.
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API route not found.' });
});

if (isDevelopment) {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
  app.use(vite.middlewares);
} else {
  // ---------- Serve static files from Vite build ----------
  app.use(express.static(path.join(__dirname, 'dist')));

  // ---------- Catch-all: serve index.html for SPA routing ----------
  app.get('/{*path}', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

// Keep malformed requests and unexpected server errors from exposing Express
// development stack traces to API callers.
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && 'body' in error) {
    return res.status(400).json({ error: 'Invalid JSON payload.' });
  }
  console.error(error);
  return res.status(500).json({ error: 'Internal server error.' });
});

// ---------- Start server ----------
app.listen(PORT, () => {
  console.log(`\n🚀 Portfolio Builder is live!`);
  console.log(`   Local:   http://localhost:${PORT}`);
  console.log(`   Health:  http://localhost:${PORT}/api/health\n`);
});
