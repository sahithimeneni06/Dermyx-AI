import React from 'react';
import './Results.css';

const FoodRecommendations = ({ food }) => {
  if (!food) return null;

  const { eat = [], avoid = [] } = food;

  if (eat.length === 0 && avoid.length === 0) {
    return (
      <div className="food-section" style={{
        padding: '20px',
        background: 'var(--surface2)',
        borderRadius: 'var(--r-sm)',
        textAlign: 'center',
        color: 'var(--ink3)'
      }}>
        No specific food recommendations for this condition
      </div>
    );
  }

  return (
    <div className="food-section">
      <div className="food-grid">
        {/* Foods to Eat */}
        {eat.length > 0 && (
          <div className="food-eat">
            <div className="food-head">
              <span style={{ fontSize: '1.2rem', marginRight: '8px' }}>✅</span>
              Foods to Eat
            </div>
            <div className="food-items">
              {eat.map((item, index) => (
                <div key={index} className="food-item-card" style={{
                  background: '#f0fdf4',
                  border: '1px solid #86efac',
                  borderRadius: 'var(--r-sm)',
                  padding: '12px',
                  marginBottom: '8px'
                }}>
                  <strong style={{ color: '#16a34a', display: 'block', marginBottom: '4px' }}>
                    {item.name}
                  </strong>
                  {item.reason && (
                    <p style={{ fontSize: '.8rem', color: 'var(--ink2)', margin: 0 }}>
                      {item.reason}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Foods to Avoid */}
        {avoid.length > 0 && (
          <div className="food-avoid">
            <div className="food-head">
              <span style={{ fontSize: '1.2rem', marginRight: '8px' }}>❌</span>
              Foods to Avoid
            </div>
            <div className="food-items">
              {avoid.map((item, index) => (
                <div key={index} className="food-item-card" style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: 'var(--r-sm)',
                  padding: '12px',
                  marginBottom: '8px'
                }}>
                  <strong style={{ color: '#dc2626', display: 'block', marginBottom: '4px' }}>
                    {item.name}
                  </strong>
                  {item.reason && (
                    <p style={{ fontSize: '.8rem', color: 'var(--ink2)', margin: 0 }}>
                      {item.reason}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodRecommendations;