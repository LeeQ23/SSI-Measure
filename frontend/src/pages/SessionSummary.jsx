import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:3001/api';

function SessionSummary() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { sessionId, totalOk: initialOk, totalNg: initialNg, setupData, inspectionType } = location.state || {};

  const [totalOk, setTotalOk] = useState(initialOk || 0);
  const [totalNg, setTotalNg] = useState(initialNg || 0);
  const [submitting, setSubmitting] = useState(false);

  if (!sessionId) {
      navigate('/');
      return null;
  }

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
        await fetch(`${API_URL}/sessions/finish`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                session_id: sessionId,
                final_total_ok: totalOk,
                final_total_ng: totalNg
            })
        });
        
        alert("Session saved and data forwarded!");
        navigate('/'); // Back to home
    } catch (err) {
        console.error("Failed to finish session:", err);
        alert("Failed to submit session data.");
    } finally {
        setSubmitting(false);
    }
  };

  return (
    <div className="summary-container">
      <h2>Session Summary</h2>
      
      <div className="summary-details">
          <p><strong>Product ID:</strong> {setupData?.product_id}</p>
          <p><strong>Operator:</strong> {setupData?.operator_name} ({setupData?.operator_nim})</p>
          <p><strong>Type:</strong> {inspectionType.toUpperCase()}</p>
          <p><strong>Criteria:</strong> {setupData?.criteria}</p>
      </div>

      <div className="edit-section">
          <h3>Verify Final Counts</h3>
          <p>You may adjust the final counts if a manual correction is needed before submitting.</p>
          
          <div className="edit-group box-ok">
              <label>Total OK</label>
              <input 
                  type="number" 
                  value={totalOk} 
                  onChange={(e) => setTotalOk(Number(e.target.value))}
              />
          </div>
          
          <div className="edit-group box-ng">
              <label>Total NG</label>
              <input 
                  type="number" 
                  value={totalNg} 
                  onChange={(e) => setTotalNg(Number(e.target.value))}
              />
          </div>
      </div>

      <div className="form-actions">
          <button className="btn-primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Confirm & Save Session'}
          </button>
      </div>
    </div>
  );
}

export default SessionSummary;
