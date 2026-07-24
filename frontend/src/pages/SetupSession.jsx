import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:3001/api';

function SetupSession() {
  const location = useLocation();
  const navigate = useNavigate();
  const inspectionType = location.state?.inspectionType || 'weight';

  const [formData, setFormData] = useState({
    operator_name: '',
    operator_nim: '',
    product_id: '',
    criteria: ''
  });
  const [minWeight, setMinWeight] = useState('');
  const [maxWeight, setMaxWeight] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleStart = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    let finalCriteria = formData.criteria;
    if (inspectionType === 'weight') {
      finalCriteria = `${minWeight} - ${maxWeight} g`;
    }

    try {
      const response = await fetch(`${API_URL}/sessions/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          criteria: finalCriteria,
          inspection_type: inspectionType
        })
      });
      
      const data = await response.json();
      if (data.sessionId) {
        navigate('/inspect', { 
          state: { 
            sessionId: data.sessionId,
            inspectionType,
            setupData: { 
              ...formData, 
              criteria: finalCriteria,
              minWeight: parseFloat(minWeight),
              maxWeight: parseFloat(maxWeight)
            }
          }
        });
      }
    } catch (err) {
      console.error("Failed to start session:", err);
      alert("Error starting session. Is the database running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="setup-container">
      <h2>Session Setup ({inspectionType.toUpperCase()})</h2>
      <form onSubmit={handleStart} className="setup-form">
        <div className="form-group">
          <label>Operator Name</label>
          <input required name="operator_name" value={formData.operator_name} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Operator NIM</label>
          <input required name="operator_nim" value={formData.operator_nim} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Product ID</label>
          <input required name="product_id" value={formData.product_id} onChange={handleChange} />
        </div>
        {inspectionType === 'weight' ? (
          <div className="form-group" style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label>Min Weight (g)</label>
              <input required type="number" step="0.1" value={minWeight} onChange={(e) => setMinWeight(e.target.value)} />
            </div>
            <div style={{ flex: 1 }}>
              <label>Max Weight (g)</label>
              <input required type="number" step="0.1" value={maxWeight} onChange={(e) => setMaxWeight(e.target.value)} />
            </div>
          </div>
        ) : (
          <div className="form-group">
            <label>Criteria (e.g., {'>'} 5mm)</label>
            <input required name="criteria" value={formData.criteria} onChange={handleChange} />
          </div>
        )}
        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={() => navigate('/')}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={loading}>Start Inspection</button>
        </div>
      </form>
    </div>
  );
}

export default SetupSession;
