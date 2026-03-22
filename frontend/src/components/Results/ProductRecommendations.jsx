import React from 'react';
import './Results.css';

const ProductRecommendations = ({ products }) => {
  if (!products || products.length === 0) return null;
  
  // Check if it's the "no products found" message
  if (products[0]?.name === "No Safe Products Found") {
    return (
      <div className="no-products-message" style={{
        padding: '30px',
        textAlign: 'center',
        background: '#fef4f2',
        borderRadius: 'var(--r)',
        border: '1px solid #fbd0c7'
      }}>
        <span style={{ fontSize: '2rem', display: 'block', marginBottom: '10px' }}>⚠️</span>
        <h3 style={{ color: 'var(--terra)', marginBottom: '10px' }}>No Safe Products Found</h3>
        <p style={{ color: 'var(--ink2)' }}>{products[0].message}</p>
      </div>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 0.7) return '#16a34a';
    if (score >= 0.5) return '#d97706';
    return '#dc2626';
  };

  return (
    <div className="product-recommendations">
      <div className="prod-grid">
        {products.map((product, index) => {
          const matchScore = Math.round((product.score || 0) * 100);
          const scoreColor = getScoreColor(product.score || 0);
          const scores = product.scores || {};

          return (
            <div key={index} className="prod-card">
              <div className="prod-rank">#{index + 1}</div>
              
              <div className="prod-head">
                <div>
                  <div className="prod-name">{product.name}</div>
                  <div className="prod-brand">{product.brand}</div>
                </div>
                <div className="prod-match" style={{ color: scoreColor }}>
                  {matchScore}%
                  <span className="prod-match-lbl">match</span>
                </div>
              </div>

              <div className="prod-meta">
                {product.category && (
                  <span className="meta-tag">{product.category}</span>
                )}
                {product.price && product.price !== 'N/A' && (
                  <span className="meta-price">${product.price}</span>
                )}
              </div>

              {/* Score Breakdown */}
              {Object.keys(scores).length > 0 && (
                <div className="score-list">
                  <div className="score-row">
                    <span className="score-name">Ingredient Safety</span>
                    <div className="score-track">
                      <div 
                        className="score-fill" 
                        style={{ width: `${Math.round((scores.ingredient || 0) * 100)}%` }}
                      />
                    </div>
                    <span className="score-pct">{Math.round((scores.ingredient || 0) * 100)}%</span>
                  </div>
                  
                  <div className="score-row">
                    <span className="score-name">Similarity</span>
                    <div className="score-track">
                      <div 
                        className="score-fill" 
                        style={{ width: `${Math.round((scores.similarity || 0) * 100)}%` }}
                      />
                    </div>
                    <span className="score-pct">{Math.round((scores.similarity || 0) * 100)}%</span>
                  </div>
                  
                  <div className="score-row">
                    <span className="score-name">Disease Match</span>
                    <div className="score-track">
                      <div 
                        className="score-fill" 
                        style={{ width: `${Math.round((scores.disease_match || 0) * 100)}%` }}
                      />
                    </div>
                    <span className="score-pct">{Math.round((scores.disease_match || 0) * 100)}%</span>
                  </div>
                </div>
              )}

              {/* Ingredients */}
              {product.ingredients && product.ingredients.length > 0 && (
                <details className="ingredients-details">
                  <summary className="ing-toggle">
                    Key Ingredients ({product.ingredients.length})
                  </summary>
                  <div className="ing-chips">
                    {product.ingredients.slice(0, 8).map((ing, i) => (
                      <span key={i} className="ing-chip">{ing}</span>
                    ))}
                    {product.ingredients.length > 8 && (
                      <span className="ing-chip">+{product.ingredients.length - 8} more</span>
                    )}
                  </div>
                </details>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductRecommendations;