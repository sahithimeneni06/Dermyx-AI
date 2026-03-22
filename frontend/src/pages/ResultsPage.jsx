// src/pages/ResultsPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ResultCard from '../components/Results/ResultCard';
import './Pages.css';

// Map URL param → localStorage key
const STORAGE_KEY_MAP = {
  disease: 'diseaseResult',
  allergy: 'allergyResult',
  symptoms: 'symptomResult',
  'skin-tone': 'skinToneResult',
  product: 'productResult',
};

const PAGE_META = {
  disease: { title: 'Disease Detection Results', icon: '🔬' },
  allergy: { title: 'Allergy Detection Results', icon: '🌿' },
  symptoms: { title: 'Symptom Analysis Results', icon: '🤔' },
  'skin-tone': { title: 'Skin Tone Analysis Results', icon: '🎨' },
  product: { title: 'Product Ingredient Analysis', icon: '🧴' },
};

const ResultsPage = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storageKey = STORAGE_KEY_MAP[type] || `${type}Result`;
    console.log(`📊 [ResultsPage] type="${type}" → key="${storageKey}"`);
    console.log('📋 All localStorage keys:', Object.keys(localStorage));
    
    // 🔥 Check if we should force reload from API (optional)
    const shouldRefresh = new URLSearchParams(window.location.search).get('refresh') === 'true';
    if (shouldRefresh) {
      console.log('🔄 Refresh flag detected, clearing cache...');
      localStorage.removeItem(storageKey);
      // Remove the refresh param from URL
      window.history.replaceState({}, '', window.location.pathname);
    }

    try {
      // Try mapped key first
      const raw = localStorage.getItem(storageKey);
      console.log(`📦 Raw data from key "${storageKey}":`, raw ? `${raw.substring(0, 200)}...` : 'null');
      
      if (raw) {
        try {
          const parsedResult = JSON.parse(raw);
          console.log('✅ Parsed result:', parsedResult);
          console.log('✅ Condition in result:', parsedResult.condition);
          console.log('✅ Display name in result:', parsedResult.display_name);
          setResult(parsedResult);
        } catch (e) {
          console.error(`Failed to parse key "${storageKey}":`, e);
        }
      } else {
        console.warn(`⚠️ No data found for key: ${storageKey}`);
        
        // Try fallback keys
        const fallbackKeys = [`${type}Result`, 'latestResult'];
        for (const key of fallbackKeys) {
          const fallbackRaw = localStorage.getItem(key);
          if (fallbackRaw) {
            try {
              const parsed = JSON.parse(fallbackRaw);
              console.log(`✅ Found fallback result in key "${key}"`);
              setResult(parsed);
              break;
            } catch (e) {
              console.error(`Failed to parse fallback key "${key}":`, e);
            }
          }
        }
      }
    } catch (error) {
      console.error('❌ Error reading localStorage:', error);
    } finally {
      setLoading(false);
    }
  }, [type]);

  const handleNewAnalysis = () => {
    const storageKey = STORAGE_KEY_MAP[type] || `${type}Result`;
    localStorage.removeItem(storageKey);
    console.log(`🗑️ Removed ${storageKey} from localStorage`);
    navigate('/');
  };

  const handleBack = () => navigate(-1);
  
  const handleForceRefresh = () => {
    // Clear all relevant storage and reload
    localStorage.removeItem(STORAGE_KEY_MAP[type]);
    window.location.reload();
  };

  const meta = PAGE_META[type] || { title: 'Analysis Results', icon: '📊' };

  if (loading) {
    return (
      <main className="page-main">
        <div className="loading-container">
          <div className="loading-spinner" />
          <p>Loading results...</p>
        </div>
      </main>
    );
  }

  if (!result) {
    return (
      <main className="page-main">
        <div className="no-results" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <span style={{ fontSize: '4rem' }}>🔍</span>
          <h2 style={{ marginTop: '16px' }}>No Results Found</h2>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>
            Please run a {type?.replace('-', ' ')} analysis first.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => navigate('/')}>
              Go to Home
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => {
                const routes = {
                  disease: '/detect-disease',
                  allergy: '/detect-allergy',
                  symptoms: '/symptom-checker',
                  'skin-tone': '/skin-tone',
                  product: '/product-analysis',
                };
                navigate(routes[type] || '/');
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page-main">
      <div className="page-header">
        <h1 className="page-title">
          {meta.icon} {meta.title}
        </h1>
        <button 
          onClick={handleForceRefresh}
          style={{
            padding: '6px 12px',
            fontSize: '12px',
            background: '#f3f4f6',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          🔄 Refresh (Clear Cache)
        </button>
      </div>

      <div className="results-container">
        <div className="result-card-wrapper">
          <ResultCard result={{ type, data: result }} />
        </div>

        <div className="action-buttons" style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
          <button className="btn btn-secondary" onClick={handleBack}>
            ← Back
          </button>
          <button className="btn btn-primary" onClick={handleNewAnalysis}>
            New Analysis
          </button>
        </div>
      </div>
    </main>
  );
};

export default ResultsPage;