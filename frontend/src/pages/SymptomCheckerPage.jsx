// src/pages/SymptomCheckerPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyzeSymptoms } from '../api/symptomAPI';
import './Pages.css';

const COMMON_SYMPTOMS = [
  'itching', 'redness', 'rash', 'dryness', 'swelling',
  'pain', 'blistering', 'scaling', 'hives', 'burning',
  'pimples', 'blackheads', 'oily skin', 'peeling', 'bumps',
  'white patches', 'dark spots', 'inflammation', 'crusting', 'oozing',
];

const SymptomCheckerPage = () => {
  const navigate = useNavigate();
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [customSymptom, setCustomSymptom] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const toggleSymptom = (symptom) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  };

  const addCustomSymptom = () => {
    const trimmed = customSymptom.trim().toLowerCase();
    if (trimmed && !selectedSymptoms.includes(trimmed)) {
      setSelectedSymptoms((prev) => [...prev, trimmed]);
      setCustomSymptom('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') addCustomSymptom();
  };

  const handleAnalyze = async () => {
    if (selectedSymptoms.length === 0) {
      setError('Please select at least one symptom.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const result = await analyzeSymptoms(selectedSymptoms);
      localStorage.setItem('symptomResult', JSON.stringify(result));
      localStorage.setItem('latestResult', JSON.stringify(result));
      navigate('/results/symptoms');
    } catch (err) {
      console.error('❌ Symptom analysis failed:', err);
      setError(err.message || 'Analysis failed. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-main">
      <div className="page-header">
        <h1 className="page-title">🤔 Symptom Checker</h1>
        <p className="page-description">
          Select your skin symptoms for an AI-powered risk assessment and recommendations.
        </p>
      </div>

      {error && (
        <div style={{
          background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px',
          padding: '12px 16px', marginBottom: '20px', color: '#b91c1c',
        }}>
          ❌ {error}
        </div>
      )}

      <div className="page-content">
        {/* Common symptoms grid */}
        <div style={{ marginBottom: '28px' }}>
          <h3 style={{ fontSize: '.95rem', color: '#374151', marginBottom: '14px', fontWeight: '600' }}>
            Select your symptoms:
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {COMMON_SYMPTOMS.map((symptom) => {
              const selected = selectedSymptoms.includes(symptom);
              return (
                <button
                  key={symptom}
                  onClick={() => toggleSymptom(symptom)}
                  style={{
                    padding: '8px 16px', borderRadius: '100px', border: '1.5px solid',
                    borderColor: selected ? '#5c7e5f' : '#d1d5db',
                    background: selected ? '#5c7e5f' : 'white',
                    color: selected ? 'white' : '#374151',
                    fontSize: '.85rem', cursor: 'pointer', fontWeight: selected ? '600' : '400',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {selected ? '✓ ' : ''}{symptom}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom symptom input */}
        <div style={{ marginBottom: '28px' }}>
          <h3 style={{ fontSize: '.95rem', color: '#374151', marginBottom: '10px', fontWeight: '600' }}>
            Add a custom symptom:
          </h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              value={customSymptom}
              onChange={(e) => setCustomSymptom(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a symptom and press Enter or Add"
              style={{
                flex: 1, padding: '10px 14px', borderRadius: '8px',
                border: '1.5px solid #d1d5db', fontSize: '.9rem',
                outline: 'none',
              }}
            />
            <button
              onClick={addCustomSymptom}
              style={{
                padding: '10px 18px', background: '#5c7e5f', color: 'white',
                border: 'none', borderRadius: '8px', cursor: 'pointer',
                fontSize: '.9rem', fontWeight: '500',
              }}
            >
              Add
            </button>
          </div>
        </div>

        {/* Selected symptoms display */}
        {selectedSymptoms.length > 0 && (
          <div style={{ marginBottom: '24px', padding: '16px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
            <h4 style={{ fontSize: '.85rem', color: '#166534', marginBottom: '10px' }}>
              Selected ({selectedSymptoms.length}):
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {selectedSymptoms.map((s) => (
                <span
                  key={s}
                  style={{
                    padding: '4px 12px', background: 'white', border: '1px solid #86efac',
                    borderRadius: '100px', fontSize: '.82rem', color: '#166534',
                    display: 'flex', alignItems: 'center', gap: '6px',
                  }}
                >
                  {s}
                  <button
                    onClick={() => toggleSymptom(s)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: '#dc2626', fontSize: '.9rem', padding: 0, lineHeight: 1,
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Analyze button */}
        <button
          onClick={handleAnalyze}
          disabled={loading || selectedSymptoms.length === 0}
          className="btn btn-primary"
          style={{
            width: '100%', padding: '14px', fontSize: '1rem',
            opacity: loading || selectedSymptoms.length === 0 ? 0.6 : 1,
            cursor: loading || selectedSymptoms.length === 0 ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? '⏳ Analyzing...' : `🔍 Analyze ${selectedSymptoms.length} Symptom${selectedSymptoms.length !== 1 ? 's' : ''}`}
        </button>
      </div>
    </main>
  );
};

export default SymptomCheckerPage;