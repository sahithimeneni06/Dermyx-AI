// src/pages/DiseaseDetectionPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ImageAnalysis from '../components/ImageAnalysis/ImageAnalysis';
import './Pages.css';

const DiseaseDetectionPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Show doctor prompt after results are saved
  const showDoctorPrompt = (condition, conditionInfo) => {
    // Use setTimeout to ensure navigation is complete before showing prompt
    setTimeout(() => {
      const shouldFindDoctors = window.confirm(
        `${conditionInfo.display_name} detected.\n\nRisk Level: ${conditionInfo.risk_level}\n\nWould you like to find nearby skin specialists?`
      );
      
      if (shouldFindDoctors) {
        navigate('/nearby-doctors', {
          state: {
            detectedCondition: condition,
            conditionInfo: conditionInfo,
            fromPage: 'disease'
          }
        });
      }
    }, 100);
  };

  // Single unified handler for results
  const handleResults = (result) => {
    console.log('📊 Disease detection results received:', result);
    setError(null);

    try {
      // Check if result has the expected structure
      if (!result || !result.condition) {
        throw new Error('Invalid result structure');
      }

      // Store in localStorage
      localStorage.setItem('diseaseResult', JSON.stringify(result));
      localStorage.setItem('latestResult', JSON.stringify(result));
      console.log('💾 Result stored in localStorage');

      // Navigate to results page
      navigate('/results/disease', { 
        state: { 
          result: result,
          fromDetection: true
        }
      });

      // Check if we should show doctor prompt (for non-normal conditions)
      const condition = result.condition;
      const conditionInfo = {
        display_name: result.display_name || result.condition.replace(/_/g, ' '),
        risk_level: result.recommendations?.risk_level || result.risk_assessment?.level || 'MODERATE',
        requires_doctor: result.recommendations?.requires_doctor || result.risk_assessment?.requires_doctor || false,
        confidence: result.confidence
      };
      
      // Show prompt only for actual skin conditions (not normal)
      if (condition !== 'normal' && condition !== 'unknown') {
        showDoctorPrompt(condition, conditionInfo);
      }
      
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
          Detects: Acne, Eczema, Melanoma, Vitiligo, Contact Dermatitis, Urticaria, Fungal Infection, Rash, and Normal skin
        </p>
      </div>

      {error && (
        <div style={{
          background: '#fee2e2', 
          border: '1px solid #fca5a5', 
          borderRadius: '8px',
          padding: '12px 16px', 
          marginBottom: '20px', 
          color: '#b91c1c',
        }}>
          ❌ {error}
        </div>
      )}

      <div className="page-content">
        <ImageAnalysis 
          onResults={handleResults} 
          onError={handleError} 
        />
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