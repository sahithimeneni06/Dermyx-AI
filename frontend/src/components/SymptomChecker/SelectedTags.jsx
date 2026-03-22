import React from 'react';
import './SymptomChecker.css';

const SelectedTags = ({ symptoms, onRemove }) => {
  if (symptoms.length === 0) return null;

  return (
    <div className="tags-wrap">
      {symptoms.map(symptom => (
        <span key={symptom} className="tag-pill">
          {symptom}
          <button className="tag-x" onClick={() => onRemove(symptom)}>
            ✕
          </button>
        </span>
      ))}
    </div>
  );
};

export default SelectedTags;