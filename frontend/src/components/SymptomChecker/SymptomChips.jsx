import React from 'react';
import './SymptomChecker.css';

const SymptomChips = ({ symptoms, selected, onToggle }) => {
  return (
    <div className="chip-grid">
      {symptoms.map(symptom => (
        <button
          key={symptom}
          className={`chip ${selected.includes(symptom) ? 'on' : ''}`}
          onClick={() => onToggle(symptom)}
        >
          {symptom}
        </button>
      ))}
    </div>
  );
};

export default SymptomChips;