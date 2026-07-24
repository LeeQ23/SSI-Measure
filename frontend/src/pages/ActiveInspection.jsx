import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

const SOCKET_SERVER_URL = 'http://localhost:3001';

function ActiveInspection() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { sessionId, inspectionType, setupData } = location.state || {};
  
  const [isConnected, setIsConnected] = useState(false);
  const [rawWeight, setRawWeight] = useState(0);
  const [tareOffset, setTareOffset] = useState(0);
  const [dimensionState, setDimensionState] = useState('WAITING'); // 'OVER', 'UNDER', 'OK', 'WAITING'
  const [currentMin, setCurrentMin] = useState(setupData?.minWeight || 0);
  const [currentMax, setCurrentMax] = useState(setupData?.maxWeight || 0);
  
  const [totalOk, setTotalOk] = useState(0);
  const [totalNg, setTotalNg] = useState(0);
  const [hasLoggedCurrentItem, setHasLoggedCurrentItem] = useState(false);
  
  const [calibParams, setCalibParams] = useState(() => {
      const saved = localStorage.getItem('ssi_cal_params');
      if (saved) {
          try { return JSON.parse(saved); } catch (e) { }
      }
      return { slope: 1.0, offset: 0.0 };
  });
  const [showCalibration, setShowCalibration] = useState(false);
  const [masterWeight, setMasterWeight] = useState('');
  
  const [minPoint, setMinPoint] = useState(null);
  const [maxPoint, setMaxPoint] = useState(null);
  
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
            setRawWeight(w);
        });
    } else {
        socket.on('dimensionData', (data) => {
            setDimensionState(data.state);
        });
    }

    return () => socket.disconnect();
  }, [sessionId, inspectionType, navigate]);
  const calibWeight = (rawWeight * calibParams.slope) + calibParams.offset;
  const displayWeight = calibWeight - tareOffset;
  const finalWeight = Math.abs(displayWeight) < 0.5 ? 0 : displayWeight;

  const handleSetMin = () => {
      const known = parseFloat(masterWeight);
      if (!isNaN(known)) {
          setMinPoint({ raw: rawWeight, known });
      }
  };

  const handleSetMax = () => {
      const known = parseFloat(masterWeight);
      if (!isNaN(known)) {
          setMaxPoint({ raw: rawWeight, known });
      }
  };

  const applyTwoPointCalibration = () => {
      if (minPoint && maxPoint && maxPoint.raw !== minPoint.raw) {
          const slope = (maxPoint.known - minPoint.known) / (maxPoint.raw - minPoint.raw);
          const offset = minPoint.known - (slope * minPoint.raw);
          const newParams = { slope, offset };
          setCalibParams(newParams);
          localStorage.setItem('ssi_cal_params', JSON.stringify(newParams));
          setShowCalibration(false);
          setMinPoint(null);
          setMaxPoint(null);
          setMasterWeight('');
      }
  };

  let currentStatus = 'WAITING';
  if (inspectionType === 'weight') {
      if (finalWeight === 0) {
          currentStatus = 'WAITING';
      } else if (finalWeight >= currentMin && finalWeight <= currentMax) {
          currentStatus = 'OK';
      } else {
          currentStatus = 'NG';
      }
  } else {
      if (dimensionState === 'WAITING') {
          currentStatus = 'WAITING';
      } else if (dimensionState === 'OK') {
          currentStatus = 'OK';
      } else {
          currentStatus = 'NG';
      }
  }

  useEffect(() => {
      if (currentStatus === 'WAITING') {
          if (hasLoggedCurrentItem) setHasLoggedCurrentItem(false);
          return;
      }
      if (hasLoggedCurrentItem) return;

      if (currentStatus === 'OK') {
          // Instantly count OK when it hits the criteria
          handleLog('OK');
          setHasLoggedCurrentItem(true);
      } else if (currentStatus === 'NG') {
          // Wait 2 full seconds before logging NG to ensure the weight settled
          const timer = setTimeout(() => {
              handleLog('NG');
              setHasLoggedCurrentItem(true);
          }, 2000);
          return () => clearTimeout(timer);
      }
  }, [currentStatus, hasLoggedCurrentItem]);

  const handleLog = async (status) => {
    // Determine the measured value based on type
    const measuredValue = inspectionType === 'weight' ? `${finalWeight.toFixed(3)}g` : dimensionState;
    
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
    <>
    <div className={`fullscreen-bg bg-${currentStatus.toLowerCase()}`} />
    <div className="active-inspection-container" style={{ position: 'relative', zIndex: 1 }}>
      <div className="inspection-header glass-panel">
        <div>
            <h2>{inspectionType.toUpperCase()} INSPECTION</h2>
            <p>Product: {setupData?.product_id} | Operator: {setupData?.operator_name}</p>
        </div>
        <div className={`status-badge ${isConnected ? 'connected' : 'disconnected'}`}>
            <div className="status-dot"></div>
            {isConnected ? 'LIVE' : 'OFFLINE'}
        </div>
      </div>

      <div className="live-data-section glass-panel">
        {inspectionType === 'weight' ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className="massive-display weight minimalist">
                    {finalWeight.toFixed(3)}<span className="unit">g</span>
                </div>
                
                {currentStatus !== 'WAITING' && (
                    <div className="status-big-text">
                        {currentStatus}
                    </div>
                )}

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
                    <button className="btn-secondary" style={{ padding: '0.5rem 1.5rem', fontSize: '1rem', borderRadius: '0.75rem' }} onClick={() => setTareOffset(calibWeight)}>Reset to 0</button>
                    <button className="btn-secondary" style={{ padding: '0.5rem 1.5rem', fontSize: '1rem', borderRadius: '0.75rem', background: showCalibration ? '#3b82f6' : 'rgba(255,255,255,0.1)' }} onClick={() => setShowCalibration(!showCalibration)}>Calibrate</button>
                </div>

                {showCalibration && (
                    <div className="interactive-target-glass" style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem', borderRadius: '1rem', background: 'rgba(0,0,0,0.5)' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                            {[1, 2, 5, 10, 20, 50].map(w => (
                                <button key={w} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '1rem' }} onClick={() => setMasterWeight(w.toString())}>{w}g</button>
                            ))}
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{color: '#aaa', fontWeight: 'bold'}}>Known Weight:</span>
                            <input 
                                type="number" 
                                value={masterWeight} 
                                onChange={(e) => setMasterWeight(e.target.value)}
                                placeholder="e.g. 50"
                                style={{ width: '100px' }}
                            />
                            <button className="btn-primary" onClick={handleSetMin} style={{ padding: '0.5rem 1rem', background: minPoint ? '#10b981' : '#3b82f6' }}>{minPoint ? 'Min Set' : 'Set Min'}</button>
                            <button className="btn-primary" onClick={handleSetMax} style={{ padding: '0.5rem 1rem', background: maxPoint ? '#10b981' : '#3b82f6' }}>{maxPoint ? 'Max Set' : 'Set Max'}</button>
                            {(minPoint && maxPoint) && (
                                <button className="btn-primary" onClick={applyTwoPointCalibration} style={{ padding: '0.5rem 1.5rem', background: '#eab308', color: '#000' }}>Apply Calibration</button>
                            )}
                        </div>
                        <div style={{ color: '#888', fontSize: '0.85rem', textAlign: 'center', marginTop: '0.5rem' }}>
                            Current Calibration &mdash; Slope: <span style={{color: '#fff'}}>{calibParams.slope.toFixed(4)}</span> | Offset: <span style={{color: '#fff'}}>{calibParams.offset.toFixed(3)}</span>
                        </div>
                    </div>
                )}
                
                <div className="interactive-target-glass" style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem', alignItems: 'center', padding: '1.5rem', borderRadius: '1rem' }}>
                    <span style={{color: '#aaa', fontWeight: 'bold'}}>Interactive Target:</span>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        Min
                        <input 
                            type="number" 
                            step="0.001" 
                            value={currentMin} 
                            onChange={(e) => setCurrentMin(parseFloat(e.target.value) || 0)}
                            style={{ width: '90px' }}
                        />
                    </label>
                    <span style={{color: '#aaa'}}>{'<'}</span>
                    <span style={{color: '#fff', fontWeight: 'bold', letterSpacing: '1px'}}>LIVE WEIGHT</span>
                    <span style={{color: '#aaa'}}>{'<'}</span>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        Max
                        <input 
                            type="number" 
                            step="0.001" 
                            value={currentMax} 
                            onChange={(e) => setCurrentMax(parseFloat(e.target.value) || 0)}
                            style={{ width: '90px' }}
                        />
                    </label>
                </div>
            </div>
        ) : (
            <div className={`massive-display dimension minimalist`}>
                {dimensionState}
            </div>
        )}
      </div>

      <div className="counters-section">
        <div className="counter box-ok glass-panel">
            <span className="label">Total OK</span>
            <input 
                type="number" 
                className="value-input"
                value={totalOk} 
                onChange={(e) => setTotalOk(parseInt(e.target.value) || 0)} 
            />
        </div>
        <div className="counter box-ng glass-panel">
            <span className="label">Total NG</span>
            <input 
                type="number" 
                className="value-input"
                value={totalNg} 
                onChange={(e) => setTotalNg(parseInt(e.target.value) || 0)} 
            />
        </div>
      </div>

      <div className="finish-section">
        <button className="btn-secondary btn-finish" onClick={handleFinish}>Finish Session</button>
      </div>
    </div>
    </>
  );
}

export default ActiveInspection;
