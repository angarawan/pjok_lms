import express from 'express';
import path from 'path';
import fs from 'fs';

const PORT = 3000;
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'lms_database.json');

// Ensure data directory exists safely
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (e) {
  console.warn('[Server] Could not create data directory:', e);
}

// In-memory cache of central database
let centralDb: any = null;
let dbVersion = 1;
let lastUpdatedAt = new Date().toISOString();

// Load existing database from file if available
try {
  if (fs.existsSync(DB_FILE)) {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    if (raw && raw.trim()) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        centralDb = parsed.data || parsed;
        dbVersion = parsed.version || 1;
        lastUpdatedAt = parsed.lastUpdatedAt || new Date().toISOString();
        console.log(`[Server] Loaded database from disk. Version: ${dbVersion}`);
      }
    }
  }
} catch (err) {
  console.error('[Server] Error loading database file:', err);
}

// Helper to persist database to disk
const saveDatabaseToDisk = (dbData: any, version: number, timestamp: string) => {
  try {
    const payload = JSON.stringify({
      version,
      lastUpdatedAt: timestamp,
      data: dbData
    }, null, 2);
    fs.writeFileSync(DB_FILE, payload, 'utf-8');
  } catch (e) {
    console.error('[Server] Failed to write database to disk:', e);
  }
};

async function startServer() {
  const app = express();

  // Middleware for parsing JSON with generous limit for school data
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // CORS headers for flexible cross-device access (laptop, HP, tablet)
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // --- API ROUTES ---

  // Health check endpoint (critical for Cloud Run container health checks)
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      version: dbVersion,
      lastUpdatedAt,
      timestamp: new Date().toISOString()
    });
  });

  // Lightweight version check for high-frequency client polling
  app.get('/api/db/version', (req, res) => {
    res.json({
      version: dbVersion,
      lastUpdatedAt,
      hasData: centralDb !== null
    });
  });

  // Get full central database
  app.get('/api/db', (req, res) => {
    res.json({
      success: true,
      version: dbVersion,
      lastUpdatedAt,
      data: centralDb
    });
  });

  // Save/Update central database from any device (Laptop or HP)
  app.post('/api/db', (req, res) => {
    try {
      const { data } = req.body;
      if (!data || typeof data !== 'object') {
        return res.status(400).json({ success: false, message: 'Data tidak valid' });
      }

      centralDb = data;
      dbVersion += 1;
      lastUpdatedAt = new Date().toISOString();

      // Asynchronously save to file
      saveDatabaseToDisk(centralDb, dbVersion, lastUpdatedAt);

      res.json({
        success: true,
        version: dbVersion,
        lastUpdatedAt,
        message: 'Database berhasil diperbarui dan disinkronkan.'
      });
    } catch (err: any) {
      console.error('[Server] Error updating database:', err);
      res.status(500).json({ success: false, message: err?.message || 'Gagal menyimpan database' });
    }
  });

  // Reset central database
  app.post('/api/db/reset', (req, res) => {
    try {
      centralDb = null;
      dbVersion += 1;
      lastUpdatedAt = new Date().toISOString();
      if (fs.existsSync(DB_FILE)) {
        fs.unlinkSync(DB_FILE);
      }
      res.json({
        success: true,
        version: dbVersion,
        lastUpdatedAt,
        message: 'Database central telah direset.'
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err?.message || 'Gagal mereset database' });
    }
  });

  // --- VITE MIDDLEWARE (Development) vs STATIC SERVE (Production) ---
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send('LMS PJOK - Build dist not found');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[LMS PJOK] Full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Server] Fatal startup error:', err);
  process.exit(1);
});
