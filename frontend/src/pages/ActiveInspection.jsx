import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

const SOCKET_SERVER_URL = 'http://localhost:3001';

function ActiveInspection() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { sessionId, inspectionType, setupData } = location.state || {};
  
  const [isConnected, setIsConnected] = useState(false);
  const [weight, setWeight] = useState(0);
  const [dimensionState, setDimensionState] = useState('WAITING'); // 'OVER', 'UNDER', 'OK', 'WAITING'
  
  const [totalOk, setTotalOk] = useState(0);
  const [totalNg, setTotalNg] = useState(0);
  
  useEffect(() => {
    if (!sessionId) {
      navigate('/');
      return;
    }

    const socket = io(SOCKET_SERVER_URL);

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    if (inspectionType === 'weight') {
        socket.on('weightData', (data) => {
            const w = parseFloat(data.weight);
            setWeight(Math.abs(w) < 0.5 ? 0 : w);
        });
    } else {
        socket.on('dimensionData', (data) => {
            setDimensionState(data.state);
        });
    }

    return () => socket.disconnect();
  }, [sessionId, inspectionType, navigate]);

  const handleLog = async (status) => {
    // Determine the measured value based on type
    const measuredValue = inspectionType === 'weight' ? `${weight}g` : dimensionState;
    
    try {
        await fetch(`${SOCKET_SERVER_URL}/api/sessions/log`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                session_id: sessionId,
                status,
                measured_value: measuredValue
            })
        });
        
        if (status === 'OK') setTotalOk(prev => prev + 1);
        if (status === 'NG') setTotalNg(prev => prev + 1);
        
    } catch (err) {
        console.error("Failed to log:", err);
    }
  };

  const handleFinish = () => {
    navigate('/summary', {
        state: { sessionId, totalOk, totalNg, setupData, inspectionType }
    });
  };

  return (
    <div className="active-inspection-container">
      <div className="inspection-header">
        <div>
            <h2>{inspectionType.toUpperCase()} INSPECTION</h2>
            <p>Product: {setupData?.product_id} | Operator: {setupData?.operator_name}</p>
        </div>
        <div className={`status-badge ${isConnected ? 'connected' : 'disconnected'}`}>
            <div className="status-dot"></div>
            {isConnected ? 'LIVE' : 'OFFLINE'}
        </div>
      </div>

      <div className="live-data-section">
        {inspectionType === 'weight' ? (
            <div className="massive-display weight">
                {weight.toFixed(1)}<span className="unit">g</span>
            </div>
        ) : (
            <div className={`massive-display dimension state-${dimensionState}`}>
                {dimensionState}
            </div>
        )}
      </div>

      <div className="action-section">
        <button className="btn-huge btn-ng" onClick={() => handleLog('NG')}>NG</button>
        <button className="btn-huge btn-ok" onClick={() => handleLog('OK')}>OK</button>
      </div>

      <div className="counters-section">
        <div className="counter box-ok">
            <span className="label">Total OK</span>
            <span className="value">{totalOk}</span>
        </div>
        <div className="counter box-ng">
            <span className="label">Total NG</span>
            <span className="value">{totalNg}</span>
        </div>
      </div>

      <div className="finish-section">
        <button className="btn-secondary btn-finish" onClick={handleFinish}>Finish Session</button>
      </div>
    </div>
  );
}

export default ActiveInspection;
