import React from 'react';
import ResultCard from './ResultCard';
import './Results.css';

const Results = ({ data }) => {
  if (!data) return null;

  const { type, data: resultData } = data;
  
  // For disease/allergy results that might have recommendations
  const hasRecommendations = resultData.recommendations || 
                            (type === 'disease' && resultData.risk_assessment);

  return (
    <section id="results">
      <div className="card result-wrap">
        <ResultCard result={data} />
      </div>
      
      {/* Debug info - remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <details style={{ marginTop: '20px', padding: '10px', background: '#f5f5f5' }}>
          <summary>Debug: View Raw Data</summary>
          <pre style={{ fontSize: '.7rem', overflow: 'auto' }}>
            {JSON.stringify(resultData, null, 2)}
          </pre>
        </details>
      )}
    </section>
  );
};

export default Results;