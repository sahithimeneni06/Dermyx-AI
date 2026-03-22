import React from 'react';
import './ImageAnalysis.css';

const ModeToggle = ({ mode, onModeChange }) => {
  return (
    <div className="mode-toggle">
      <button 
        className={`mode-btn ${mode === 'disease' ? 'active' : ''}`}
        onClick={() => onModeChange('disease')}
      >
        Skin Disease
      </button>
      <button 
        className={`mode-btn ${mode === 'allergy' ? 'active' : ''}`}
        onClick={() => onModeChange('allergy')}
      >
        Allergy Detection
      </button>
    </div>
  );
};

export default ModeToggle;