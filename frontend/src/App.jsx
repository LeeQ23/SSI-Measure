import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import './App.css';

// Connect to the Node.js backend
// Assuming backend is running on the same machine on port 3001
const SOCKET_SERVER_URL = 'http://localhost:3001';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [weight, setWeight] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  
  // Criteria States
  const [minWeight, setMinWeight] = useState(480);
  const [maxWeight, setMaxWeight] = useState(520);
  
  // Connect to WebSocket on mount
  useEffect(() => {
    const socket = io(SOCKET_SERVER_URL);

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to Backend!');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from Backend');
    });

    socket.on('weightData', (data) => {
      setWeight(parseFloat(data.weight));
      setLastUpdate(data.timestamp);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Determine current status
  const getStatus = () => {
    // If weight is essentially 0 (or empty scale), show warning/idle state
    if (weight < 5) return 'warning'; 
    
    if (weight >= minWeight && weight <= maxWeight) {
      return 'pass';
    }
    return 'fail';
  };

  const status = getStatus();

  return (
    <div className="app-container">
      <header className="header">
        <div className="logo">SSI Measure</div>
        <div className={`status-badge ${isConnected ? 'connected' : 'disconnected'}`}>
          <div className="status-dot"></div>
          {isConnected ? 'LIVE FEED ACTIVE' : 'NO CONNECTION'}
        </div>
      </header>

      <main className="main-content">
        {/* Left: Massive Visual Display */}
        <div className={`display-section status-${status}`}>
          <div className="weight-display">
            {weight.toFixed(1)}<span className="unit">g</span>
          </div>
          
          <div className="status-text">
            {status === 'warning' ? 'WAITING FOR ITEM' : status === 'pass' ? 'PASS' : 'FAIL'}
          </div>
        </div>

        {/* Right: Controls Panel */}
        <div className="controls-section">
          <div className="controls-header">
            <h2>Inspection Criteria</h2>
            <p>Set the acceptable weight range for the current batch of items.</p>
          </div>

          <div className="control-group">
            <label>Acceptable Range (Min - Max)</label>
            <div className="input-row">
              <div className="input-wrapper">
                <input 
                  type="number" 
                  value={minWeight} 
                  onChange={(e) => setMinWeight(Number(e.target.value))}
                  placeholder="Min"
                />
                <span className="input-unit">g</span>
              </div>
              <div className="input-wrapper">
                <input 
                  type="number" 
                  value={maxWeight} 
                  onChange={(e) => setMaxWeight(Number(e.target.value))}
                  placeholder="Max"
                />
                <span className="input-unit">g</span>
              </div>
            </div>
          </div>

          <div className="info-panel">
            <div className="info-row">
              <span className="info-label">Current Deviation</span>
              <span className="info-value">
                {weight > 5 ? (weight - ((minWeight + maxWeight) / 2)).toFixed(1) + ' g' : '-'}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Last Updated</span>
              <span className="info-value">{new Date(lastUpdate).toLocaleTimeString()}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Backend Status</span>
              <span className="info-value" style={{ color: isConnected ? 'var(--color-pass)' : 'var(--color-fail)' }}>
                {isConnected ? 'Connected' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
