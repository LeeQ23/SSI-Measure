import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import SetupSession from './pages/SetupSession';
import ActiveInspection from './pages/ActiveInspection';
import SessionSummary from './pages/SessionSummary';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <header className="header">
          <div className="logo">SSI Measure / Smart Inspection</div>
        </header>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/setup" element={<SetupSession />} />
            <Route path="/inspect" element={<ActiveInspection />} />
            <Route path="/summary" element={<SessionSummary />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
