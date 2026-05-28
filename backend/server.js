const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { SerialPort, ReadlineParser } = require('serialport');
const cors = require('cors');
const mysql = require('mysql2/promise');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

const PORT = 3001;
const BAUD_RATE = 115200;

// Database connection
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '', // default XAMPP password
  database: 'ssi_measure',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

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
    // Alternate between weight mock and dimension mock randomly for testing
    if (Math.random() > 0.5) {
        const mockWeight = 500 + (Math.random() * 20 - 10);
        io.emit('weightData', { weight: mockWeight.toFixed(2), timestamp: Date.now() });
    } else {
        const states = ['OVER', 'UNDER', 'OK'];
        const state = states[Math.floor(Math.random() * states.length)];
        io.emit('dimensionData', { state, timestamp: Date.now() });
    }
  }, 1000); // 1s interval for mock so it's readable
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
      const state = trimmed.replace('DIMENSION:', ''); // OVER, UNDER, OK
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
    res.json({ currentPortPath });
});

// --- SESSION API ---

// Start Session
app.post('/api/sessions/start', async (req, res) => {
    const { operator_name, operator_nim, product_id, inspection_type, criteria } = req.body;
    try {
        const [result] = await pool.execute(
            `INSERT INTO inspection_sessions 
            (operator_name, operator_nim, product_id, inspection_type, criteria, start_time) 
            VALUES (?, ?, ?, ?, ?, NOW())`,
            [operator_name, operator_nim, product_id, inspection_type, criteria]
        );
        res.json({ sessionId: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Log item
app.post('/api/sessions/log', async (req, res) => {
    const { session_id, status, measured_value } = req.body;
    try {
        await pool.execute(
            `INSERT INTO inspection_logs (session_id, timestamp, status, measured_value) 
            VALUES (?, NOW(), ?, ?)`,
            [session_id, status, measured_value || null]
        );
        // Also update the session total
        const col = status === 'OK' ? 'total_ok' : 'total_ng';
        await pool.execute(`UPDATE inspection_sessions SET ${col} = ${col} + 1 WHERE id = ?`, [session_id]);
        
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Finish Session
app.post('/api/sessions/finish', async (req, res) => {
    const { session_id, final_total_ok, final_total_ng } = req.body;
    try {
        await pool.execute(
            `UPDATE inspection_sessions 
             SET end_time = NOW(), status = 'completed', total_ok = ?, total_ng = ? 
             WHERE id = ?`,
            [final_total_ok, final_total_ng, session_id]
        );

        // Fetch complete session data to send to external server
        const [rows] = await pool.execute(`SELECT * FROM inspection_sessions WHERE id = ?`, [session_id]);
        const sessionData = rows[0];

        // Attempt to forward to 192.168.1.200:3000
        try {
            await axios.post('http://192.168.1.200:3000/api/inspections', sessionData);
            console.log('Successfully forwarded data to external server.');
        } catch (forwardErr) {
            console.error('Failed to forward data to external server:', forwardErr.message);
            // We do not throw here because the local save was successful
        }

        res.json({ success: true, session: sessionData });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

io.on('connection', (socket) => {
  socket.emit('portStatus', { 
    status: currentPortPath === 'MOCK' ? 'mock' : (activePort && activePort.isOpen ? 'connected' : 'error'), 
    path: currentPortPath 
  });
});

server.listen(PORT, () => {
  console.log(`Backend Server listening on http://localhost:${PORT}`);
});
