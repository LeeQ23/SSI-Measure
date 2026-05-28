import { useNavigate } from 'react-router-dom';
import { Scale, Ruler } from 'lucide-react';

function Home() {
  const navigate = useNavigate();

  const handleSelect = (type) => {
    navigate('/setup', { state: { inspectionType: type } });
  };

  return (
    <div className="home-container">
      <h1>Select Inspection Mode</h1>
      <div className="mode-cards">
        <div className="mode-card" onClick={() => handleSelect('weight')}>
          <Scale size={64} className="icon" />
          <h2>Weight Inspection</h2>
          <p>Inspect item weight using HX711 Load Cell</p>
        </div>
        <div className="mode-card" onClick={() => handleSelect('dimension')}>
          <Ruler size={64} className="icon" />
          <h2>Dimension / Thickness</h2>
          <p>Inspect thickness using multi-pin logic</p>
        </div>
      </div>
    </div>
  );
}

export default Home;
