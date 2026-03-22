import React from 'react';
import './Results.css';

const IngredientReport = ({ data }) => {
  const {
    overall_rating,
    overall_confidence,
    ingredients = [],
    warnings = [],
    summary,
    total_ingredients,
    safe_count,
    caution_count,
    bad_count,
    unknown_count,
    breakdown,
    safe_percentage,
    bad_percentage
  } = data;

  const getRatingColor = (rating) => {
    const colors = {
      'Recommended': '#16a34a',
      'Good': '#3b82f6',
      'Average': '#d97706',
      'Use with Caution': '#ea580c',
      'Not Recommended': '#dc2626',
      'Unknown': '#6b7280'
    };
    return colors[rating] || '#6b7280';
  };

  const getRatingBg = (rating) => {
    const colors = {
      'Recommended': '#f0fdf4',
      'Good': '#eff6ff',
      'Average': '#fffbeb',
      'Use with Caution': '#fff7ed',
      'Not Recommended': '#fef2f2',
      'Unknown': '#f3f4f6'
    };
    return colors[rating] || '#f3f4f6';
  };

  const getRatingIcon = (rating) => {
    switch(rating) {
      case 'Recommended': return '✅';
      case 'Good': return '👍';
      case 'Average': return '📊';
      case 'Use with Caution': return '⚠️';
      case 'Not Recommended': return '❌';
      default: return '❓';
    }
  };

  return (
    <div className="ingredient-report">
      {/* Header */}
      <div className="result-head">
        <div>
          <div className="result-name" style={{ color: getRatingColor(overall_rating) }}>
            {getRatingIcon(overall_rating)} {overall_rating}
          </div>
          <div className="result-label">Overall Product Rating</div>
        </div>
        <div className="conf-box">
          <span className="conf-num">{overall_confidence}%</span>
          <span className="conf-lbl">confidence</span>
        </div>
      </div>

      {/* Summary */}
      <div className="summary-section" style={{
        background: getRatingBg(overall_rating),
        padding: '16px',
        borderRadius: 'var(--r-sm)',
        marginBottom: '20px',
        borderLeft: `4px solid ${getRatingColor(overall_rating)}`
      }}>
        <p style={{ fontSize: '.95rem', color: 'var(--ink)', margin: 0 }}>
          {summary}
        </p>
      </div>

      {/* Stats Cards - Updated */}
      <div className="stats-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '8px',
        marginBottom: '24px'
      }}>
        <div className="stat-card" style={{ background: '#f0fdf4', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#16a34a' }}>{total_ingredients}</div>
          <div style={{ fontSize: '.7rem', color: '#166534' }}>Total</div>
        </div>
        <div className="stat-card" style={{ background: '#f0fdf4', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#16a34a' }}>{safe_count}</div>
          <div style={{ fontSize: '.7rem', color: '#166534' }}>Safe ({safe_percentage}%)</div>
        </div>
        <div className="stat-card" style={{ background: '#fef2f2', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc2626' }}>{bad_count}</div>
          <div style={{ fontSize: '.7rem', color: '#991b1b' }}>Bad ({bad_percentage}%)</div>
        </div>
        <div className="stat-card" style={{ background: '#fef2f2', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ea580c' }}>{caution_count - bad_count}</div>
          <div style={{ fontSize: '.7rem', color: '#9a3412' }}>Average</div>
        </div>
        <div className="stat-card" style={{ background: '#f3f4f6', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#6b7280' }}>{unknown_count}</div>
          <div style={{ fontSize: '.7rem', color: '#374151' }}>Unknown</div>
        </div>
      </div>

      {/* Breakdown Bars */}
      {total_ingredients > 0 && (
        <div className="breakdown-bars" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', height: '30px', borderRadius: '15px', overflow: 'hidden' }}>
            {breakdown?.Best > 0 && (
              <div style={{ 
                width: `${(breakdown.Best / total_ingredients) * 100}%`, 
                background: '#16a34a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '.7rem'
              }}>
                {breakdown.Best}
              </div>
            )}
            {breakdown?.Good > 0 && (
              <div style={{ 
                width: `${(breakdown.Good / total_ingredients) * 100}%`, 
                background: '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '.7rem'
              }}>
                {breakdown.Good}
              </div>
            )}
            {breakdown?.Average > 0 && (
              <div style={{ 
                width: `${(breakdown.Average / total_ingredients) * 100}%`, 
                background: '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '.7rem'
              }}>
                {breakdown.Average}
              </div>
            )}
            {breakdown?.Bad > 0 && (
              <div style={{ 
                width: `${(breakdown.Bad / total_ingredients) * 100}%`, 
                background: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '.7rem'
              }}>
                {breakdown.Bad}
              </div>
            )}
            {breakdown?.Unknown > 0 && (
              <div style={{ 
                width: `${(breakdown.Unknown / total_ingredients) * 100}%`, 
                background: '#6b7280',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '.7rem'
              }}>
                {breakdown.Unknown}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '.65rem', color: 'var(--ink3)' }}>
            <span>Best</span>
            <span>Good</span>
            <span>Average</span>
            <span>Bad</span>
            <span>Unknown</span>
          </div>
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="warnings-section" style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px'
        }}>
          <h4 style={{ color: '#dc2626', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            ⚠️ Warnings ({warnings.length})
          </h4>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            {warnings.map((warning, i) => (
              <li key={i} style={{ color: '#7f1d1d', fontSize: '.85rem', marginBottom: '4px' }}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Ingredients List */}
      <h4 style={{ marginBottom: '12px' }}>📋 Ingredient Analysis</h4>
      <div className="ingredients-list" style={{
        border: '1px solid var(--border)',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--surface2)' }}>
              <th style={{ padding: '10px', textAlign: 'left', fontSize: '.8rem' }}>Ingredient</th>
              <th style={{ padding: '10px', textAlign: 'center', fontSize: '.8rem' }}>Rating</th>
              <th style={{ padding: '10px', textAlign: 'right', fontSize: '.8rem' }}>Match</th>
            </tr>
          </thead>
          <tbody>
            {ingredients.map((ing, i) => (
              <tr key={i} style={{ borderTop: '1px solid var(--border)' }}>
                <td style={{ padding: '10px' }}>
                  <div style={{ fontWeight: 500 }}>{ing.input}</div>
                  {ing.matched && ing.matched !== ing.input && (
                    <div style={{ fontSize: '.7rem', color: 'var(--ink3)' }}>
                      Matched: {ing.matched}
                    </div>
                  )}
                </td>
                <td style={{ padding: '10px', textAlign: 'center' }}>
                  <span className={`rating-badge ${ing.rating.toLowerCase()}`}>
                    {ing.rating}
                  </span>
                </td>
                <td style={{ padding: '10px', textAlign: 'right', fontSize: '.8rem' }}>
                  {Math.round(ing.confidence * 100)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Note */}
      <p style={{
        fontSize: '.7rem',
        color: 'var(--ink3)',
        marginTop: '16px',
        fontStyle: 'italic'
      }}>
        * Ratings based on our ingredient database. {bad_count} bad ingredient(s) found. Always patch test new products.
      </p>
    </div>
  );
};

export default IngredientReport;