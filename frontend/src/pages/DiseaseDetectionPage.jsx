// src/pages/DiseaseDetectionPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ImageAnalysis from '../components/ImageAnalysis/ImageAnalysis';
import './Pages.css';

const DISPLAY_NAMES = {
  acne: 'Acne',
  eczema_like: 'Eczema / Dermatitis',
  fungal: 'Fungal Infection',
  melanoma: 'Melanoma (Skin Cancer)',
  vitiligo: 'Vitiligo',
  normal: 'Normal Skin',
};

const getDisplayName = (condition) =>
  DISPLAY_NAMES[condition] ||
  condition.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const DiseaseDetectionPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleResults = (result) => {
    console.log('📊 Disease detection results received:', result);
    setError(null);

    try {
      if (!result) throw new Error('Invalid result structure');

      // Always derive condition from prediction field — never trust display_name from backend
      const condition = result.prediction || result.condition || 'unknown';
      const confidence = result.confidence || 0;

      // Always derive display name from condition — backend's display_name is unreliable
      const displayName = getDisplayName(condition);

      let riskLevel = 'MODERATE';
      let requiresDoctor = false;
      if (condition === 'melanoma') {
        riskLevel = 'HIGH';
        requiresDoctor = true;
      } else if (condition === 'normal') {
        riskLevel = 'LOW';
        requiresDoctor = false;
      }

      // Store with corrected display_name (derived from condition, not from backend)
      const storedResult = {
        prediction: condition,
        condition: condition,
        confidence: confidence,
        display_name: displayName,
        risk_level: riskLevel,
        requires_doctor: requiresDoctor,
        top3: result.top3 || [],
        all_probabilities: result.all_probabilities || {},
        recommendations: result.recommendations || {},
        model_used: result.model_used || 'efficientnetb0_6class',
      };

      localStorage.setItem('diseaseResult', JSON.stringify(storedResult));
      localStorage.setItem('latestResult', JSON.stringify(storedResult));
      console.log('💾 Result stored in localStorage:', storedResult);

      navigate('/results/disease', {
        state: { result: storedResult, fromDetection: true },
      });

      setLoading(false);
    } catch (err) {
      console.error('❌ Error saving results:', err);
      setError('Error saving results: ' + err.message);
      setLoading(false);
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
        <p className="page-description" style={{ fontSize: '.85rem', color: '#5c7e5f' }}>
          Detects: Acne, Eczema, Melanoma, Vitiligo, Fungal Infection, and Normal skin
        </p>
      </div>

      {error && (
        <div
          style={{
            background: '#fee2e2',
            border: '1px solid #fca5a5',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '20px',
            color: '#b91c1c',
          }}
        >
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