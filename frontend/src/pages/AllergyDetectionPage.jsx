// src/pages/AllergyDetectionPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ImageAnalysis from '../components/ImageAnalysis/ImageAnalysis';
import './Pages.css';

const AllergyDetectionPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleResults = (result) => {
    console.log('🌿 Allergy detection results received:', result);
    setError(null);

    try {
      // Tag result as allergy analysis
      const allergyResult = { ...result, analysis_type: 'allergy' };
      localStorage.setItem('allergyResult', JSON.stringify(allergyResult));
      localStorage.setItem('latestResult', JSON.stringify(allergyResult));
      console.log('💾 Allergy result stored');
      setLoading(true);
      navigate('/results/allergy');
    } catch (err) {
      console.error('❌ Error saving results:', err);
      setError('Error saving results: ' + err.message);
    }
  };

  const handleError = (err) => {
    setError(err.message || 'Analysis failed. Please try again.');
    setLoading(false);
  };

  return (
    <main className="page-main">
      <div className="page-header">
        <h1 className="page-title">🌿 Allergy Detection</h1>
        <p className="page-description">
          Upload a photo of your skin reaction for AI-powered allergy analysis.
        </p>
        <p className="page-description" style={{ fontSize: '.85rem', color: '#f39c12' }}>
          Detects: Contact Dermatitis, Urticaria (Hives), Fungal Infections, General Rash, and other allergic reactions
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
        <ImageAnalysis onResults={handleResults} onError={handleError} />
      </div>

      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner" />
          <p>Analyzing for allergic reactions...</p>
        </div>
      )}
    </main>
  );
};

export default AllergyDetectionPage;