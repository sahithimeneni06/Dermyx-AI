// src/pages/DiseaseDetectionPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ImageAnalysis from '../components/ImageAnalysis/ImageAnalysis';
import './Pages.css';

const DiseaseDetectionPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleResults = (result) => {
    console.log('📊 Disease detection results received:', result);
    setError(null);

    try {
      localStorage.setItem('diseaseResult', JSON.stringify(result));
      // Also save as latest for fallback
      localStorage.setItem('latestResult', JSON.stringify(result));
      console.log('💾 Result stored in localStorage');
      setLoading(true);
      navigate('/results/disease');
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
        <h1 className="page-title">🔬 Skin Disease Detection</h1>
        <p className="page-description">
          Upload a clear photo for instant AI-powered analysis of skin conditions.
        </p>
        <p className="page-description" style={{ fontSize: '.85rem', color: '#c4694f' }}>
          Detects: Acne, Eczema, Melanoma, Vitiligo, Contact Dermatitis, Urticaria, Fungal Infection, Rash, and Normal skin
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
          <p>Processing results...</p>
        </div>
      )}
    </main>
  );
};

export default DiseaseDetectionPage;