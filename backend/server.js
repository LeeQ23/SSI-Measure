const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const { Server } = require('socket.io');
const { SerialPort, ReadlineParser } = require('serialport');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

const PORT = process.env.PORT || 3001;
const BAUD_RATE = 115200;

// Serve static frontend build files
const distPath = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// Database connection & Initialization
const appDataPath = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share");
const dbDir = path.join(appDataPath, 'SSI-Measure');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}
const dbPath = path.join(dbDir, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('ERROR: Could not connect to SQLite database', err);
  else {
    console.log(`SUCCESS: SQLite Database connected at ${dbPath}`);
    initializeDatabase();
  }
});

function dbRun(query, params = []) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      if (err) reject(err);
      else resolve(this); // this.lastID, this.changes
    });
  });
}

function dbAll(query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function initializeDatabase() {
  try {
    await dbRun(`
      CREATE TABLE IF NOT EXISTS inspection_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        operator_name VARCHAR(100),
        operator_nim VARCHAR(50),
        product_id VARCHAR(50),
        inspection_type VARCHAR(50),
        criteria VARCHAR(100),
        start_time DATETIME,
        end_time DATETIME,
        total_ok INT DEFAULT 0,
        total_ng INT DEFAULT 0,
        status VARCHAR(20) DEFAULT 'active'
      )
    `);
    
    await dbRun(`
      CREATE TABLE IF NOT EXISTS inspection_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id INT,
        timestamp DATETIME,
        status VARCHAR(10),
        measured_value DECIMAL(10, 3),
        FOREIGN KEY (session_id) REFERENCES inspection_sessions(id)
      )
    `);
  } catch (err) {
    console.error('Failed to initialize SQLite database tables:', err);
  }
}

let activePort = null;
let mockInterval = null;
let currentPortPath = 'MOCK';

function stopCurrentDataStream() {
  if (mockInterval) {
    clearInterval(mockInterval);
    mockInterval = null;
  }
  if (activePort) {
    if (activePort.isOpen) activePort.close();
    activePort = null;
  }
}

function startMockData() {
  stopCurrentDataStream();
  currentPortPath = 'MOCK';
  console.log('Starting MOCK mode.');
  io.emit('portStatus', { status: 'mock', path: 'MOCK' });
  
  mockInterval = setInterval(() => {
    if (Math.random() > 0.5) {
        const mockWeight = 500 + (Math.random() * 20 - 10);
        io.emit('weightData', { weight: mockWeight.toFixed(3), timestamp: Date.now() });
    } else {
        const states = ['OVER', 'UNDER', 'OK'];
        const state = states[Math.floor(Math.random() * states.length)];
        io.emit('dimensionData', { state, timestamp: Date.now() });
    }
  }, 1000);
}

function connectToPort(path) {
  if (path === 'MOCK') {
    startMockData();
    return;
  }

  stopCurrentDataStream();
  const cleanPath = path.trim();
  console.log(`Attempting to connect to hardware on port ${cleanPath}...`);
  
  const port = new SerialPort({ path: cleanPath, baudRate: BAUD_RATE });
  const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

  port.on('open', () => {
    activePort = port;
    currentPortPath = path;
    console.log(`SUCCESS: Serial Port ${path} opened.`);
    io.emit('portStatus', { status: 'connected', path: path });
  });

  port.on('error', (err) => {
    console.error(`ERROR: Serial port ${path}. ${err.message}`);
    io.emit('portStatus', { status: 'error', path: path, error: err.message });
    startMockData();
  });

  parser.on('data', (data) => {
    const trimmed = data.trim();
    if (trimmed.startsWith('WEIGHT:')) {
      const weight = parseFloat(trimmed.replace('WEIGHT:', ''));
      if (!isNaN(weight)) io.emit('weightData', { weight, timestamp: Date.now() });
    } else if (trimmed.startsWith('DIMENSION:')) {
      const state = trimmed.replace('DIMENSION:', '');
      io.emit('dimensionData', { state, timestamp: Date.now() });
    }
  });
}

if (process.env.COM_PORT) {
  connectToPort(process.env.COM_PORT);
} else {
  startMockData();
}

// --- REST API ENDPOINTS ---

app.get('/api/ports', async (req, res) => {
  try {
    const ports = await SerialPort.list();
    res.json(ports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/port', (req, res) => {
  const { path } = req.body;
  if (!path) return res.status(400).json({ error: 'Port path required' });
  connectToPort(path);
  res.json({ message: `Connecting to ${path}` });
});

app.get('/api/status', (req, res) => {
    // Return true for isMySqlConnected to satisfy frontend legacy logic (SQLite is always on)
    res.json({ currentPortPath, isMySqlConnected: true });
});

// --- SESSION API ---

// Start Session
app.post('/api/sessions/start', async (req, res) => {
    const { operator_name, operator_nim, product_id, inspection_type, criteria } = req.body;
    try {
        const result = await dbRun(
            `INSERT INTO inspection_sessions 
            (operator_name, operator_nim, product_id, inspection_type, criteria, start_time) 
            VALUES (?, ?, ?, ?, ?, datetime('now', 'localtime'))`,
            [operator_name, operator_nim, product_id, inspection_type, criteria]
        );
        res.json({ sessionId: result.lastID });
    } catch (err) {
        console.error('SQLite Insert Error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Log item
app.post('/api/sessions/log', async (req, res) => {
    const { session_id, status, measured_value } = req.body;
    try {
        await dbRun(
            `INSERT INTO inspection_logs (session_id, timestamp, status, measured_value) 
            VALUES (?, datetime('now', 'localtime'), ?, ?)`,
            [session_id, status, measured_value || null]
        );
        const col = status === 'OK' ? 'total_ok' : 'total_ng';
        await dbRun(`UPDATE inspection_sessions SET ${col} = ${col} + 1 WHERE id = ?`, [session_id]);
        res.json({ success: true });
    } catch (err) {
        console.error('SQLite Log Error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Finish Session
app.post('/api/sessions/finish', async (req, res) => {
    const { session_id, final_total_ok, final_total_ng } = req.body;
    try {
        await dbRun(
            `UPDATE inspection_sessions 
             SET end_time = datetime('now', 'localtime'), status = 'completed', total_ok = ?, total_ng = ? 
             WHERE id = ?`,
            [final_total_ok, final_total_ng, session_id]
        );

        const rows = await dbAll(`SELECT * FROM inspection_sessions WHERE id = ?`, [session_id]);
        const sessionData = rows[0];

        try {
            await axios.post('http://localhost:5003/api/inspections', sessionData);
            console.log('Successfully forwarded data to external server.');
        } catch (forwardErr) {
            console.warn('Data forwarding disabled or unreachable.');
        }

        res.json({ success: true, session: sessionData });
    } catch (err) {
        console.error('SQLite Finish Error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

io.on('connection', (socket) => {
  socket.emit('portStatus', { 
    status: currentPortPath === 'MOCK' ? 'mock' : (activePort && activePort.isOpen ? 'connected' : 'error'), 
    path: currentPortPath 
  });
});

// Wildcard SPA route for frontend React router
app.get('*', (req, res) => {
  if (fs.existsSync(path.join(distPath, 'index.html'))) {
    res.sendFile(path.join(distPath, 'index.html'));
  } else {
    res.status(404).send('SSI Measure Frontend assets not found.');
  }
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.warn(`[WARN] Port ${PORT} already in use. Reusing existing server instance.`);
  } else {
    console.error('[ERROR] Server error:', err);
  }
});

server.listen(PORT, () => {
  console.log(`Backend Server listening on http://localhost:${PORT}`);
});
