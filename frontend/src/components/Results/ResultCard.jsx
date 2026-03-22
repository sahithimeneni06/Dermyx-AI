// src/components/Results/ResultCard.jsx
import React from 'react';
import './Results.css';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const RISK_COLORS = {
  HIGH: '#dc2626',
  'MODERATE-HIGH': '#ea580c',
  MODERATE: '#d97706',
  'LOW-MODERATE': '#ca8a04',
  LOW: '#16a34a',
};

const RATING_COLORS = {
  Best: { bg: '#dcfce7', text: '#16a34a' },
  Good: { bg: '#dbeafe', text: '#2563eb' },
  Average: { bg: '#fffbeb', text: '#d97706' },
  Bad: { bg: '#fee2e2', text: '#dc2626' },
  Unknown: { bg: '#f3f4f6', text: '#6b7280' },
};

const OVERALL_RATING_STYLES = {
  Recommended: { color: '#16a34a', icon: '✅' },
  Good: { color: '#3b82f6', icon: '👍' },
  Average: { color: '#d97706', icon: '📊' },
  'Use with Caution': { color: '#ea580c', icon: '⚠️' },
  'Not Recommended': { color: '#dc2626', icon: '❌' },
  Unknown: { color: '#6b7280', icon: '❓' },
};

const CATEGORY_STYLES = {
  allergy: { color: '#f39c12', emoji: '🤧', label: 'Allergy Detected' },
  disease: { color: '#e74c3c', emoji: '⚠️', label: 'Skin Disease Detected' },
  normal: { color: '#16a34a', emoji: '✅', label: 'Healthy Skin' },
};


// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

const EmergencyBanner = ({ emergency }) => {
  if (!emergency) return null;
  return (
    <div style={{
      background: '#fee2e2', border: '2px solid #ef4444', borderRadius: '8px',
      padding: '16px', marginBottom: '20px',
    }}>
      <strong style={{ color: '#dc2626', display: 'block', marginBottom: '4px' }}>
        🚨 {emergency.message}
      </strong>
      <span style={{ color: '#b91c1c' }}>{emergency.action}</span>
    </div>
  );
};

const RiskBadge = ({ level, requiresDoctor }) => {
  if (!level) return null;
  const color = RISK_COLORS[level] || '#6b7280';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px',
      padding: '12px 16px',
      background: ['HIGH', 'MODERATE-HIGH'].includes(level) ? '#fef2f2' : '#f9fafb',
      borderRadius: '8px', borderLeft: `4px solid ${color}`,
    }}>
      <span style={{ fontSize: '.9rem', color: '#374151' }}>Risk Level:</span>
      <span style={{
        padding: '4px 12px', borderRadius: '100px',
        background: color, color: 'white', fontSize: '.8rem', fontWeight: '600',
      }}>
        {level}
      </span>
      {requiresDoctor && (
        <span style={{ color: '#ea580c', fontSize: '.85rem' }}>⚕ Consult a dermatologist</span>
      )}
    </div>
  );
};

const FoodSection = ({ food }) => {
  if (!food || (!food.eat?.length && !food.avoid?.length)) return null;
  return (
    <div style={{ marginTop: '24px' }}>
      <h3 style={{ fontSize: '1rem', marginBottom: '12px', color: '#111827' }}>🥗 Dietary Recommendations</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {food.eat?.length > 0 && (
          <div style={{ background: '#f0fdf4', padding: '16px', borderRadius: '8px' }}>
            <h4 style={{ color: '#16a34a', marginBottom: '10px', fontSize: '.9rem' }}>✅ Eat More</h4>
            <ul style={{ margin: 0, paddingLeft: '18px' }}>
              {food.eat.map((item, i) => (
                <li key={i} style={{ marginBottom: '6px', fontSize: '.85rem', color: '#374151' }}>
                  <strong>{item.name || item}</strong>
                  {item.reason && <span style={{ color: '#6b7280' }}> — {item.reason}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}
        {food.avoid?.length > 0 && (
          <div style={{ background: '#fef2f2', padding: '16px', borderRadius: '8px' }}>
            <h4 style={{ color: '#dc2626', marginBottom: '10px', fontSize: '.9rem' }}>❌ Avoid</h4>
            <ul style={{ margin: 0, paddingLeft: '18px' }}>
              {food.avoid.map((item, i) => (
                <li key={i} style={{ marginBottom: '6px', fontSize: '.85rem', color: '#374151' }}>
                  <strong>{item.name || item}</strong>
                  {item.reason && <span style={{ color: '#6b7280' }}> — {item.reason}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

const ProductsSection = ({ products }) => {
  if (!products?.length || products[0]?.name === 'No Safe Products Found') return null;
  return (
    <div style={{ marginTop: '24px' }}>
      <h3 style={{ fontSize: '1rem', marginBottom: '12px', color: '#111827' }}>🧴 Recommended Products</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
        {products.map((product, idx) => (
          <div key={idx} style={{
            background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px',
            padding: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}>
            <div style={{ fontWeight: '600', fontSize: '.9rem', marginBottom: '4px' }}>{product.name}</div>
            {product.brand && <div style={{ fontSize: '.75rem', color: '#6b7280' }}>{product.brand}</div>}
            {product.score != null && (
              <div style={{
                fontSize: '.75rem', color: '#16a34a', marginTop: '8px', fontWeight: '500',
              }}>
                Match: {Math.round(product.score * 100)}%
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const PrecautionsSection = ({ precautions }) => {
  if (!precautions?.length) return null;
  return (
    <div style={{ marginTop: '20px', padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
      <h4 style={{ marginBottom: '8px', color: '#374151', fontSize: '.9rem', fontWeight: '600' }}>📋 Precautions</h4>
      <ul style={{ fontSize: '.85rem', color: '#6b7280', paddingLeft: '20px', margin: 0 }}>
        {precautions.map((item, i) => <li key={i} style={{ marginBottom: '4px' }}>{item}</li>)}
      </ul>
    </div>
  );
};


// ─────────────────────────────────────────────
// PRODUCT RESULT
// ─────────────────────────────────────────────
const ProductResult = ({ data }) => {
  const {
    overall_rating = 'Unknown',
    overall_confidence = 0,
    ingredients = [],
    warnings = [],
    summary = '',
    total_ingredients = 0,
    safe_count = 0,
    bad_count = 0,
    unknown_count = 0,
    breakdown = {},
    safe_percentage = 0,
    bad_percentage = 0,
  } = data;

  const ratingStyle = OVERALL_RATING_STYLES[overall_rating] || OVERALL_RATING_STYLES.Unknown;

  if (ingredients.length === 0 && total_ingredients === 0) {
    return (
      <div className="result-content">
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
          <h3 style={{ color: '#dc2626', marginBottom: '8px' }}>No Ingredients Detected</h3>
          <p style={{ color: '#6b7280', fontSize: '.9rem' }}>
            {data.note || 'Please try uploading a clearer image of the ingredients list, or use the text input option.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="result-content">
      {/* Header */}
      <div className="result-head">
        <div>
          <div className="result-name" style={{ color: ratingStyle.color }}>
            {ratingStyle.icon} {overall_rating}
          </div>
          <div className="result-label">Overall Product Rating</div>
        </div>
        <div className="conf-box">
          <span className="conf-num">{Math.round(overall_confidence)}%</span>
          <span className="conf-lbl">confidence</span>
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div style={{
          background: '#f3f4f6', padding: '16px', borderRadius: '8px', marginBottom: '20px',
          borderLeft: `4px solid ${ratingStyle.color}`,
        }}>
          <p style={{ fontSize: '.95rem', color: '#374151', margin: 0 }}>{summary}</p>
        </div>
      )}

      {/* Stats */}
      {total_ingredients > 0 && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '16px' }}>
            {[
              { label: 'Total', val: total_ingredients, bg: '#f9fafb', color: '#374151' },
              { label: `Safe (${Math.round(safe_percentage)}%)`, val: safe_count, bg: '#f0fdf4', color: '#16a34a' },
              { label: `Bad (${Math.round(bad_percentage)}%)`, val: bad_count, bg: '#fef2f2', color: '#dc2626' },
              { label: 'Unknown', val: unknown_count, bg: '#f9fafb', color: '#6b7280' },
            ].map(({ label, val, bg, color }) => (
              <div key={label} style={{ background: bg, padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color }}>{val}</div>
                <div style={{ fontSize: '.68rem', color: '#6b7280', marginTop: '2px' }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          {Object.values(breakdown).some(v => v > 0) && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', height: '28px', borderRadius: '14px', overflow: 'hidden' }}>
                {[
                  { key: 'Best', color: '#16a34a' },
                  { key: 'Good', color: '#3b82f6' },
                  { key: 'Average', color: '#d97706' },
                  { key: 'Bad', color: '#dc2626' },
                  { key: 'Unknown', color: '#9ca3af' },
                ].map(({ key, color }) =>
                  breakdown[key] > 0 ? (
                    <div
                      key={key}
                      title={`${key}: ${breakdown[key]}`}
                      style={{
                        width: `${(breakdown[key] / total_ingredients) * 100}%`,
                        background: color, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', color: 'white', fontSize: '.7rem', fontWeight: '600',
                      }}
                    >
                      {breakdown[key]}
                    </div>
                  ) : null
                )}
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '6px', flexWrap: 'wrap' }}>
                {[
                  { label: 'Best', color: '#16a34a' },
                  { label: 'Good', color: '#3b82f6' },
                  { label: 'Average', color: '#d97706' },
                  { label: 'Bad', color: '#dc2626' },
                  { label: 'Unknown', color: '#9ca3af' },
                ].map(({ label, color }) => (
                  <span key={label} style={{ fontSize: '.65rem', color, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, display: 'inline-block' }} />
                    {label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fecaca',
          borderRadius: '8px', padding: '16px', marginBottom: '20px',
        }}>
          <h4 style={{ color: '#dc2626', marginBottom: '10px', fontSize: '.9rem' }}>⚠️ Warnings ({warnings.length})</h4>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            {warnings.map((w, i) => (
              <li key={i} style={{ color: '#7f1d1d', fontSize: '.85rem', marginBottom: '4px' }}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Ingredient table */}
      {ingredients.length > 0 && (
        <>
          <h4 style={{ marginBottom: '12px', fontSize: '.95rem' }}>📋 Ingredient Analysis ({ingredients.length})</h4>
          <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '.78rem', color: '#6b7280', fontWeight: '600' }}>Ingredient</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center', fontSize: '.78rem', color: '#6b7280', fontWeight: '600' }}>Rating</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right', fontSize: '.78rem', color: '#6b7280', fontWeight: '600' }}>Match</th>
                </tr>
              </thead>
              <tbody>
                {ingredients.map((ing, i) => {
                  const rStyle = RATING_COLORS[ing.rating] || RATING_COLORS.Unknown;
                  return (
                    <tr key={i} style={{ borderTop: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ fontWeight: '500', fontSize: '.88rem' }}>{ing.input || ing}</div>
                        {ing.matched && ing.matched !== ing.input && (
                          <div style={{ fontSize: '.7rem', color: '#9ca3af' }}>→ {ing.matched}</div>
                        )}
                        {ing.description && (
                          <div style={{ fontSize: '.72rem', color: '#6b7280', marginTop: '2px' }}>{ing.description}</div>
                        )}
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                        <span style={{
                          padding: '3px 10px', borderRadius: '100px', fontSize: '.72rem',
                          fontWeight: '600', background: rStyle.bg, color: rStyle.text,
                        }}>
                          {ing.rating || 'Unknown'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'right', fontSize: '.8rem', color: '#6b7280' }}>
                        {Math.round((ing.confidence || 0.5) * 100)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      <p style={{ fontSize: '.7rem', color: '#9ca3af', marginTop: '16px', fontStyle: 'italic' }}>
        * Ratings based on ingredient database. Always patch test new products.
      </p>
    </div>
  );
};


// ─────────────────────────────────────────────
// SKIN TONE RESULT
// ─────────────────────────────────────────────
const SkinToneResult = ({ data }) => {
  const {
    skin_tone = 'Unknown',
    confidence = 0,
    description = '',
    tips = [],
    all_predictions = {},
    fitzpatrick_types = [],
    note,
  } = data;

  const isLight = skin_tone.includes('Light');
  const skinColor = isLight ? '#c4834a' : '#7b4f2e';
  const bgColor = isLight ? '#fff7f0' : '#f5f0eb';

  return (
    <div className="result-content">
      <div className="result-head">
        <div>
          <div className="result-name" style={{ color: skinColor }}>🎨 {skin_tone}</div>
          <div className="result-label">Fitzpatrick Skin Type Analysis</div>
          {fitzpatrick_types.length > 0 && (
            <div style={{ fontSize: '.8rem', color: '#6b7280', marginTop: '4px' }}>
              {fitzpatrick_types.join(' · ')}
            </div>
          )}
        </div>
        <div className="conf-box">
          <span className="conf-num" style={{ color: skinColor }}>{Math.round(confidence * 100)}%</span>
          <span className="conf-lbl">confidence</span>
        </div>
      </div>

      {note && (
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '12px', marginBottom: '16px' }}>
          <span style={{ fontSize: '.85rem', color: '#92400e' }}>ℹ️ {note}</span>
        </div>
      )}

      {description && (
        <div style={{ background: bgColor, padding: '16px', borderRadius: '8px', marginBottom: '20px', borderLeft: `4px solid ${skinColor}` }}>
          <p style={{ fontSize: '.95rem', color: '#374151', margin: 0 }}>{description}</p>
        </div>
      )}

      {/* Probability bars */}
      {Object.keys(all_predictions).length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ fontSize: '.9rem', marginBottom: '12px', color: '#374151' }}>Classification Confidence</h4>
          {Object.entries(all_predictions).sort(([, a], [, b]) => b - a).map(([cls, prob]) => {
            const pct = Math.round(prob * 100);
            const isSelected = cls === skin_tone;
            return (
              <div key={cls} style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '.85rem', fontWeight: isSelected ? '600' : '400', color: isSelected ? skinColor : '#374151' }}>
                    {cls}{isSelected ? ' ✓' : ''}
                  </span>
                  <span style={{ fontSize: '.8rem', color: '#6b7280' }}>{pct}%</span>
                </div>
                <div style={{ height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: isSelected ? skinColor : '#d1d5db', borderRadius: '4px', transition: 'width 0.6s ease' }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tips */}
      {tips.length > 0 && (
        <div style={{ background: bgColor, padding: '16px', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '.95rem', marginBottom: '12px', color: '#111827' }}>💡 Personalized Skincare Tips</h3>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            {tips.map((tip, i) => (
              <li key={i} style={{ marginBottom: '8px', fontSize: '.85rem', color: '#4b5563' }}>{tip}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};


// ─────────────────────────────────────────────
// SYMPTOM RESULT
// ─────────────────────────────────────────────
const SymptomResult = ({ data }) => {
  const {
    risk = 'LOW',
    message = '',
    inferred_condition = 'unknown',
    display_name,
    symptoms_analyzed = [],
    top_conditions = [],
    recommendations: symptomRecs = [],
    emergency,
    recommendations: recsObj,
  } = data;

  const conditionDisplay = display_name || inferred_condition.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const riskColor = RISK_COLORS[risk] || '#6b7280';

  // Nested recommendations from /recommend endpoint
  const products = recsObj?.recommendations?.products || [];
  const food = recsObj?.recommendations?.food;
  const precautions = recsObj?.recommendations?.precautions || symptomRecs || [];
  const emergencyData = emergency || recsObj?.emergency;

  return (
    <div className="result-content">
      <EmergencyBanner emergency={emergencyData} />

      <div className="result-head">
        <div>
          <div className="result-name" style={{ color: riskColor }}>
            🤔 {conditionDisplay}
          </div>
          <div className="result-label">Inferred from symptom analysis</div>
        </div>
        <div className="conf-box">
          <span className="conf-num" style={{ color: riskColor, fontSize: '1.1rem' }}>{risk}</span>
          <span className="conf-lbl">risk level</span>
        </div>
      </div>

      {message && (
        <div style={{
          padding: '14px 16px', borderRadius: '8px', marginBottom: '20px',
          background: ['HIGH', 'MODERATE-HIGH'].includes(risk) ? '#fef2f2' : '#f0fdf4',
          borderLeft: `4px solid ${riskColor}`,
        }}>
          <p style={{ margin: 0, color: '#374151', fontSize: '.9rem' }}>{message}</p>
        </div>
      )}

      {/* Symptoms analyzed */}
      {symptoms_analyzed.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ fontSize: '.85rem', color: '#6b7280', marginBottom: '8px' }}>Symptoms Analyzed</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {symptoms_analyzed.map((s, i) => (
              <span key={i} style={{
                padding: '4px 12px', background: '#f3f4f6', borderRadius: '100px',
                fontSize: '.82rem', color: '#374151',
              }}>
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Top conditions */}
      {top_conditions.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ fontSize: '.9rem', marginBottom: '10px', color: '#374151' }}>Possible Conditions</h4>
          {top_conditions.slice(0, 4).map(({ condition, score }, i) => {
            const maxScore = top_conditions[0]?.score || 1;
            const pct = Math.round((score / maxScore) * 100);
            const isTop = i === 0;
            return (
              <div key={condition} style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '.85rem', fontWeight: isTop ? '600' : '400', color: isTop ? riskColor : '#374151' }}>
                    {condition.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}{isTop ? ' (most likely)' : ''}
                  </span>
                  <span style={{ fontSize: '.8rem', color: '#6b7280' }}>{pct}%</span>
                </div>
                <div style={{ height: '6px', background: '#e5e7eb', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: isTop ? riskColor : '#d1d5db', borderRadius: '3px' }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ProductsSection products={products} />
      <FoodSection food={food} />
      <PrecautionsSection precautions={precautions} />
    </div>
  );
};

// ─────────────────────────────────────────────
// DISEASE / ALLERGY RESULT - COMPLETELY CORRECTED
// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
// DISEASE / ALLERGY RESULT - COMPLETELY CORRECTED
// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
// DISEASE / ALLERGY RESULT - COMPLETELY CORRECTED
// ─────────────────────────────────────────────
const DiseaseResult = ({ data, type }) => {
  // =====================================================
  // ROBUST DATA EXTRACTION - FIXES "always normal" bug
  // =====================================================
  
  // Debug log to see what we're receiving
  console.log('🔬 DiseaseResult received:', {
    data,
    type,
    'data.condition': data?.condition,
    'data.category': data?.category,
    'data.display_name': data?.display_name,
    'data.recommendations': data?.recommendations
  });
  
  // ✅ STEP 1: Extract condition (MOST IMPORTANT)
  // Priority: condition > category > fallback
  const rawCondition = data?.condition || data?.category || 'normal';
  
  // ✅ STEP 2: Normalize condition
  const condition = rawCondition.toLowerCase();
  
  // ✅ STEP 3: Get display name with proper formatting
  let displayName = data?.display_name;
  if (!displayName) {
    // Format based on condition
    if (condition === 'allergy') {
      displayName = 'Allergy Detected';
    } else if (condition === 'disease') {
      displayName = 'Skin Disease Detected';
    } else if (condition === 'normal') {
      displayName = 'Normal Skin';
    } else if (condition === 'acne') {
      displayName = 'Acne';
    } else if (condition === 'eczema') {
      displayName = 'Eczema';
    } else if (condition === 'melanoma') {
      displayName = 'Melanoma (High Risk)';
    } else if (condition === 'vitiligo') {
      displayName = 'Vitiligo';
    } else if (condition === 'contact_dermatitis') {
      displayName = 'Contact Dermatitis';
    } else if (condition === 'urticaria') {
      displayName = 'Urticaria (Hives)';
    } else if (condition === 'fungal') {
      displayName = 'Fungal Infection';
    } else if (condition === 'rash') {
      displayName = 'General Rash';
    } else if (condition === 'psoriasis') {
      displayName = 'Psoriasis';
    } else if (condition === 'rosacea') {
      displayName = 'Rosacea';
    } else {
      // Generic formatting
      displayName = condition.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    }
  }
  
  // ✅ STEP 4: Get confidence (handle different formats)
  let confidence = data?.confidence || 0;
  if (confidence === 0 && data?.category_confidence) {
    confidence = data.category_confidence;
  }
  const confidencePercent = Math.round(confidence * 100);
  
  // ✅ STEP 5: Get probabilities (handle different formats)
  let allProbabilities = data?.all_probabilities || data?.all_predictions || {};
  
  // If no probabilities, create from condition
  if (Object.keys(allProbabilities).length === 0 && condition) {
    allProbabilities = {
      allergy: condition === 'allergy' ? confidence || 0.7 : 0.1,
      disease: condition === 'disease' ? confidence || 0.7 : 0.1,
      normal: condition === 'normal' ? confidence || 0.7 : 0.1
    };
  }
  
  // ✅ STEP 6: Get recommendations
  const recommendations = data?.recommendations || {};
  
  // ✅ STEP 7: Determine category style (for UI colors)
  // FIX: Properly map specific diseases to correct category
  let categoryKey = condition;
  
  // List of specific skin diseases (these should show as DISEASE category)
  const specificDiseases = [
    'acne', 'eczema', 'melanoma', 'vitiligo', 'psoriasis', 'rosacea',
    'actinic_keratosis', 'basal_cell_carcinoma', 'squamous_cell_carcinoma'
  ];
  
  // List of allergy-related conditions (these should show as ALLERGY category)
  const allergyConditions = [
    'allergy', 'contact_dermatitis', 'urticaria', 'rash', 'fungal'
  ];
  
  if (specificDiseases.includes(condition)) {
    categoryKey = 'disease';
  } else if (allergyConditions.includes(condition)) {
    categoryKey = 'allergy';
  } else if (condition === 'normal') {
    categoryKey = 'normal';
  }
  
  const catStyle = CATEGORY_STYLES[categoryKey] || { 
    color: '#6b7280', 
    emoji: '📊', 
    label: 'Analysis Result' 
  };
  
  // ✅ STEP 8: Extract risk assessment
  const risk = recommendations.risk_level
    ? { 
        level: recommendations.risk_level, 
        requires_doctor: recommendations.requires_doctor 
      }
    : null;
  
  // ✅ STEP 9: Extract food recommendations
  const food = recommendations.food;
  
  // ✅ STEP 10: Extract products
  const products = recommendations.products;
  
  // ✅ STEP 11: Extract precautions
  const precautions = recommendations.precautions;
  
  // ✅ STEP 12: Extract emergency info
  const emergency = recommendations.emergency;
  
  // ✅ STEP 13: Extract note
  const note = data?.note;
  
  // =====================================================
  // RENDER COMPONENT
  // =====================================================
  
  return (
    <div className="result-content">
      {/* Emergency Banner */}
      <EmergencyBanner emergency={emergency} />

      {/* Header Section */}
      <div className="result-head">
        <div>
          <div className="result-name" style={{ color: catStyle.color }}>
            {catStyle.emoji} {displayName}
          </div>
          <div className="result-label">{catStyle.label}</div>
          {type === 'allergy' && (
            <div style={{ fontSize: '.8rem', color: '#f39c12', marginTop: '4px', fontWeight: '500' }}>
              🌿 Allergy Analysis Mode
            </div>
          )}
          {/* Show detected condition name for debugging */}
          <div style={{ fontSize: '.7rem', color: '#9ca3af', marginTop: '4px' }}>
            Detected: {condition}
          </div>
        </div>
        <div className="conf-box">
          <span className="conf-num" style={{ color: catStyle.color }}>
            {confidencePercent}%
          </span>
          <span className="conf-lbl">confidence</span>
        </div>
      </div>

      {/* Note Banner */}
      {note && (
        <div style={{ 
          background: '#fffbeb', 
          border: '1px solid #fde68a', 
          borderRadius: '8px', 
          padding: '12px', 
          marginBottom: '16px' 
        }}>
          <span style={{ fontSize: '.85rem', color: '#92400e' }}>ℹ️ {note}</span>
        </div>
      )}

      {/* Risk Badge */}
      {risk && <RiskBadge level={risk.level} requiresDoctor={risk.requires_doctor} />}

      {/* Probability Breakdown */}
      {Object.keys(allProbabilities).length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ fontSize: '.9rem', marginBottom: '10px', color: '#374151' }}>
            Confidence Breakdown
          </h4>
          {Object.entries(allProbabilities)
            .sort(([, a], [, b]) => b - a)
            .map(([cls, prob]) => {
              const pct = Math.round(prob * 100);
              const isTop = cls.toLowerCase() === condition;
              const clsStyle = CATEGORY_STYLES[cls.toLowerCase()] || { color: '#9ca3af' };
              return (
                <div key={cls} style={{ marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ 
                      fontSize: '.85rem', 
                      fontWeight: isTop ? '600' : '400', 
                      color: isTop ? catStyle.color : '#374151' 
                    }}>
                      {cls.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      {isTop ? ' ✓' : ''}
                    </span>
                    <span style={{ fontSize: '.8rem', color: '#6b7280' }}>{pct}%</span>
                  </div>
                  <div style={{ height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${pct}%`, 
                      height: '100%', 
                      background: isTop ? catStyle.color : '#d1d5db', 
                      borderRadius: '4px', 
                      transition: 'width 0.6s ease' 
                    }} />
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Products Section */}
      <ProductsSection products={products} />
      
      {/* Food Section */}
      <FoodSection food={food} />
      
      {/* Precautions Section */}
      <PrecautionsSection precautions={precautions} />
    </div>
  );
};

const ResultCard = ({ result }) => {
  // Support both { type, data } and flat result objects
  const type = result.type || 'disease';
  const data = result.data || result;

  console.log('🔬 ResultCard rendering:', {
    type,
    'data keys': Object.keys(data),
    'data.condition': data?.condition,
    'data.category': data?.category,
    'data.display_name': data?.display_name,
    'data.overall_rating': data?.overall_rating,
    'data.skin_tone': data?.skin_tone,
    'data.risk': data?.risk
  });

  // Product result (has overall_rating or ingredients)
  if (type === 'product' || data.overall_rating !== undefined || 
      (data.ingredients !== undefined && !data.condition && !data.category)) {
    console.log('🎯 Routing to ProductResult');
    return <ProductResult data={data} />;
  }

  // Skin tone result (has skin_tone)
  if (type === 'skin-tone' || data.skin_tone !== undefined) {
    console.log('🎯 Routing to SkinToneResult');
    return <SkinToneResult data={data} />;
  }

  // Symptom result (has risk or inferred_condition)
  if (type === 'symptoms' || data.risk !== undefined || data.inferred_condition !== undefined) {
    console.log('🎯 Routing to SymptomResult');
    return <SymptomResult data={data} />;
  }

  // Disease / allergy result (has condition or category)
  console.log('🎯 Routing to DiseaseResult');
  return <DiseaseResult data={data} type={type} />;
};

export default ResultCard;