import { useState, useEffect } from 'react';
import { Settings, RefreshCw, Cpu, CheckCircle2, AlertCircle, PlayCircle } from 'lucide-react';

const API_URL = 'http://localhost:3001/api';

function Header() {
  const [showModal, setShowModal] = useState(false);
  const [ports, setPorts] = useState([]);
  const [currentPort, setCurrentPort] = useState('MOCK');
  const [selectedPort, setSelectedPort] = useState('MOCK');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [isMySqlConnected, setIsMySqlConnected] = useState(true);

  const fetchStatusAndPorts = async () => {
    setLoading(true);
    try {
      // Fetch status
      const statusRes = await fetch(`${API_URL}/status`);
      const statusData = await statusRes.json();
      if (statusData.currentPortPath) {
        setCurrentPort(statusData.currentPortPath);
        setSelectedPort(statusData.currentPortPath);
      }
      if (typeof statusData.isMySqlConnected === 'boolean') {
        setIsMySqlConnected(statusData.isMySqlConnected);
      }

      // Fetch available COM ports
      const portsRes = await fetch(`${API_URL}/ports`);
      const portsData = await portsRes.json();
      if (Array.isArray(portsData)) {
        setPorts(portsData);
      }
    } catch (err) {
      console.error('Failed to fetch hardware status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatusAndPorts();
    const interval = setInterval(fetchStatusAndPorts, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleConnectPort = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`${API_URL}/port`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: selectedPort })
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentPort(selectedPort);
        setMessage({ type: 'success', text: `Berhasil terhubung ke ${selectedPort}` });
      } else {
        setMessage({ type: 'error', text: data.error || 'Gagal terhubung ke port' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Tidak dapat menghubungi server backend' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header className="header">
        <div className="logo" style={{ cursor: 'pointer' }} onClick={() => window.location.href = '/'}>
          SSI Measure
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            className="hardware-config-btn"
            onClick={() => { setShowModal(true); fetchStatusAndPorts(); }}
          >
            <Cpu size={18} />
            <span>Hardware: <strong>{currentPort}</strong></span>
            <Settings size={16} style={{ marginLeft: '4px', opacity: 0.8 }} />
          </button>
        </div>
      </header>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><Cpu size={24} style={{ marginRight: '8px', color: '#3b82f6' }} /> Konfigurasi Hardware (ESP32)</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>

            <div className="modal-body">
              <p className="modal-desc">
                Pilih port serial COM yang terhubung ke alat pengukur (ESP32/Load Cell/Sensor) atau gunakan mode Simulasi (MOCK).
              </p>

              <div className="form-group">
                <label>Pilih Hardware / Port Serial (COM)</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <select 
                    value={selectedPort} 
                    onChange={(e) => setSelectedPort(e.target.value)}
                    className="port-select-dropdown"
                  >
                    <option value="MOCK">⚡ MOCK Mode (Simulasi Penimbangan & Dimensi)</option>
                    {ports.map((p) => (
                      <option key={p.path} value={p.path}>
                        🔌 {p.path} {p.manufacturer ? `(${p.manufacturer})` : ''}
                      </option>
                    ))}
                  </select>
                  <button 
                    className="btn-secondary" 
                    onClick={fetchStatusAndPorts} 
                    disabled={loading}
                    title="Pindai Ulang Port COM"
                    style={{ padding: '0.75rem 1rem' }}
                  >
                    <RefreshCw size={18} className={loading ? 'spin-icon' : ''} />
                  </button>
                </div>
              </div>

              {message && (
                <div className={`status-alert alert-${message.type}`}>
                  {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                  <span>{message.text}</span>
                </div>
              )}

              <div className="hardware-info-box">
                <div><strong>Status Port Aktif:</strong> {currentPort}</div>
                <div><strong>Kecepatan Baud:</strong> 115200 bps</div>
                <div><strong>Database MySQL:</strong> {isMySqlConnected ? '🟢 Terhubung (ssi_measure)' : '🟡 Sesi Lokal (In-Memory)'}</div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
              <button className="btn-primary" onClick={handleConnectPort} disabled={loading}>
                {loading ? 'Menghubungkan...' : 'Hubungkan Hardware'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;
