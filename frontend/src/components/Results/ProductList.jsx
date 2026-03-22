import React from 'react';
import './Results.css';

const ProductList = ({ products }) => {
  if (!products || products.length === 0 || products[0]?.name === 'No Safe Products Found') {
    return null;
  }

  return (
    <div className="prod-grid" id="prodGrid">
      {products.map((product, index) => {
        const pct = Math.round((product.score || 0) * 100);
        const matchColor = pct >= 70 ? '#16a34a' : pct >= 45 ? '#d97706' : '#dc2626';
        const scores = product.scores || {};

        return (
          <div key={index} className="prod-card">
            <div className="prod-rank">#{index + 1}</div>
            <div className="prod-head">
              <div>
                <div className="prod-name">{product.name || 'Unknown'}</div>
                <div className="prod-brand">{product.brand || ''}</div>
              </div>
              <div className="prod-match" style={{color: matchColor}}>
                {pct}%
                <span className="prod-match-lbl">match</span>
              </div>
            </div>
            
            <div className="prod-meta">
              {product.category && <span className="meta-tag">{product.category}</span>}
              {product.price && product.price !== 'N/A' && (
                <span className="meta-price">${product.price}</span>
              )}
            </div>

            {Object.keys(scores).length > 0 && (
              <div className="score-list">
                {[
                  ['Ingredient', scores.ingredient],
                  ['Similarity', scores.similarity],
                  ['Disease Match', scores.disease_match]
                ].map(([name, value]) => {
                  const vp = Math.round((value || 0) * 100);
                  return (
                    <div key={name} className="score-row">
                      <span className="score-name">{name}</span>
                      <div className="score-track">
                        <div className="score-fill" style={{width: `${vp}%`}} />
                      </div>
                      <span className="score-pct">{vp}%</span>
                    </div>
                  );
                })}
              </div>
            )}

            {product.ingredients?.length > 0 && (
              <details>
                <summary className="ing-toggle">
                  Key Ingredients ({product.ingredients.length})
                </summary>
                <div className="ing-chips">
                  {product.ingredients.slice(0, 8).map((ing, i) => (
                    <span key={i} className="ing-chip">{ing}</span>
                  ))}
                </div>
              </details>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ProductList;