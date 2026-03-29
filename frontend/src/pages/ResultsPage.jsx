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
  (condition
    ? condition.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : 'Skin Condition');

const getActualCondition = (result) => {
  if (!result) return 'unknown';
  const data = result.data || result;
  return (
    data?.prediction ||
    data?.condition ||
    data?.inferred_condition ||
    'unknown'
  );
};

const isSkinCondition = (result) => {
  const condition = getActualCondition(result);
  return condition && condition !== 'normal' && condition !== 'unknown';
};

const isNormalSkin = (result) => getActualCondition(result) === 'normal';

const ResultsPage = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storageKey = STORAGE_KEY_MAP[type] || `${type}Result`;
    console.log(`📊 [ResultsPage] type="${type}" → key="${storageKey}"`);

    const shouldRefresh =
      new URLSearchParams(window.location.search).get('refresh') === 'true';
    if (shouldRefresh) {
      localStorage.removeItem(storageKey);
      window.history.replaceState({}, '', window.location.pathname);
    }

    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsedResult = JSON.parse(raw);
        console.log('✅ Parsed result:', parsedResult);
        setResult(parsedResult);
      } else {
        console.warn(`⚠️ No data found for key: ${storageKey}`);
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
    navigate('/');
  };

  const handleBack = () => navigate(-1);

  const handleForceRefresh = () => {
    const storageKey = STORAGE_KEY_MAP[type] || `${type}Result`;
    localStorage.removeItem(storageKey);
    window.location.reload();
  };

  const handleFindSpecialists = () => {
    if (!result) return;

    // result can be flat {prediction, condition} or nested {data: {prediction}}
    const resultData = result.data || result;

    // Extract condition — never trust display_name
    let condition =
      resultData?.prediction ||
      resultData?.condition ||
      resultData?.inferred_condition ||
      resultData?.top3?.[0]?.class ||
      'unknown';

    console.log('🎯 handleFindSpecialists — extracted condition:', condition);

    // Always derive display name from condition
    const displayName = getDisplayName(condition);

    const confidence =
      resultData?.confidence ||
      resultData?.top3?.[0]?.confidence ||
      0;

    let riskLevel = 'MODERATE';
    let requiresDoctor = false;
    if (condition === 'melanoma') {
      riskLevel = 'HIGH';
      requiresDoctor = true;
    } else if (condition === 'normal') {
      riskLevel = 'LOW';
    }

    const conditionInfo = {
      condition,
      display_name: displayName,
      risk_level: riskLevel,
      requires_doctor: requiresDoctor,
      confidence,
      category:
        condition === 'melanoma'
          ? 'melanoma'
          : condition === 'normal'
          ? 'normal'
          : 'disease',
    };

    console.log('🟢 Navigating to /nearby-doctors with:', { condition, conditionInfo });

    navigate('/nearby-doctors', {
      state: {
        detectedCondition: condition,
        conditionInfo,
        fromPage: type,
      },
    });
  };

  const meta = PAGE_META[type] || { title: 'Analysis Results', icon: '📊' };
  const actualCondition = result ? getActualCondition(result) : null;

  const isSkinConditionResult =
    (type === 'disease' || type === 'allergy' || type === 'symptoms') &&
    result &&
    isSkinCondition(result);

  const isNormalResult = type === 'disease' && result && isNormalSkin(result);

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
        <h1 className="page-title">🔬 Skin Disease Detection Results</h1>
        
      </div>

      <div className="results-container">
        <div className="result-card-wrapper">
          <ResultCard result={{ type, data: result }} />
        </div>

        <div className="action-buttons" style={{ marginTop: '32px' }}>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" onClick={handleBack}>
              ← Back
            </button>
            <button className="btn btn-primary" onClick={handleNewAnalysis}>
              New Analysis
            </button>
          </div>

          {isSkinConditionResult && (
            <div
              style={{
                marginTop: '20px',
                paddingTop: '20px',
                borderTop: '1px solid #e5e7eb',
                textAlign: 'center',
              }}
            >
              <button
                onClick={handleFindSpecialists}
                className="btn-find-specialists"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>🔬</span>
                Find Nearby Skin Specialists
                <span style={{ fontSize: '1.2rem' }}>📍</span>
              </button>

              {actualCondition === 'melanoma' && (
                <div
                  style={{
                    marginTop: '12px',
                    padding: '12px',
                    background: '#fef2f2',
                    borderRadius: '8px',
                    borderLeft: '4px solid #dc2626',
                  }}
                >
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#991b1b' }}>
                    ⚠️ <strong>High Risk Condition Detected</strong> — We strongly recommend
                    consulting a dermatologist immediately.
                  </p>
                </div>
              )}
            </div>
          )}

          {isNormalResult && (
            <div
              style={{
                marginTop: '20px',
                padding: '16px',
                background: '#f0fdf4',
                borderRadius: '12px',
                textAlign: 'center',
                border: '1px solid #bbf7d0',
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>✅</span>
              <p style={{ margin: '8px 0 0', color: '#166534' }}>
                Your skin appears healthy! Continue with your regular skincare routine.
              </p>
            </div>
          )}
        </div>
      </div>

      <style jsx="true">{`
        .btn-find-specialists {
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.02);
          }
        }
        .btn-find-specialists:hover {
          animation: none;
        }
      `}</style>
    </main>
  );
};

export default ResultsPage;