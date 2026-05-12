const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { SerialPort, ReadlineParser } = require('serialport');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = 3001;
const BAUD_RATE = 115200;

// Set this environment variable before running if you want to use the real hardware
// Example (Windows): set COM_PORT=COM3 && node server.js
let serialPortPath = process.env.COM_PORT; 
let useMock = !serialPortPath;

let mockWeight = 0;
let mockInterval = null;

function startMockData() {
  console.log('No COM_PORT specified. Starting in MOCK mode (simulated weights).');
  console.log('To use hardware, run: set COM_PORT=COMx && npm start');
  mockInterval = setInterval(() => {
    // Simulate weight fluctuating around 500g
    mockWeight = 500 + (Math.random() * 20 - 10);
    io.emit('weightData', { weight: mockWeight.toFixed(2), timestamp: Date.now() });
  }, 100);
}

if (useMock) {
  startMockData();
} else {
  console.log(`Attempting to connect to hardware on port ${serialPortPath}...`);
  const port = new SerialPort({ path: serialPortPath, baudRate: BAUD_RATE });
  const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

  port.on('open', () => {
    console.log(`SUCCESS: Serial Port ${serialPortPath} opened at ${BAUD_RATE} baud.`);
  });

  port.on('error', (err) => {
    console.error(`ERROR: Failed to open serial port ${serialPortPath}. Error: ${err.message}`);
    console.log('Falling back to MOCK mode.');
    if (!mockInterval) startMockData();
  });

  parser.on('data', (data) => {
    if (data.startsWith('WEIGHT:')) {
      const weight = parseFloat(data.replace('WEIGHT:', '').trim());
      if (!isNaN(weight)) {
        io.emit('weightData', { weight, timestamp: Date.now() });
      }
    } else {
       console.log("Hardware Msg:", data);
    }
  });
}

// Simple API to list available COM ports on the system to help the user
app.get('/api/ports', async (req, res) => {
  try {
    const ports = await SerialPort.list();
    res.json(ports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

server.listen(PORT, () => {
  console.log(`Backend Server listening on http://localhost:${PORT}`);
});
