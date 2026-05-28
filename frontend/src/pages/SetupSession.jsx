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
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleStart = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/sessions/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          inspection_type: inspectionType
        })
      });
      
      const data = await response.json();
      if (data.sessionId) {
        navigate('/inspect', { 
          state: { 
            sessionId: data.sessionId,
            inspectionType,
            setupData: formData
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
        <div className="form-group">
          <label>Criteria ({inspectionType === 'weight' ? 'e.g., 500g +- 20g' : 'e.g., > 5mm'})</label>
          <input required name="criteria" value={formData.criteria} onChange={handleChange} />
        </div>
        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={() => navigate('/')}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={loading}>Start Inspection</button>
        </div>
      </form>
    </div>
  );
}

export default SetupSession;
