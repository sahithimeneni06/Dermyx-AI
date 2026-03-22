import React, { useState } from 'react';
import { analyzeIngredientsText } from '../api/productAPI';

const TestProductPage = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ingredients, setIngredients] = useState('water, glycerin, alcohol, fragrance');

  const testAnalysis = async () => {
    setLoading(true);
    try {
      const list = ingredients.split(',').map(i => i.trim());
      console.log('Testing with:', list);
      const res = await analyzeIngredientsText(list);
      console.log('Result:', res);
      setResult(res);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '50px' }}>
      <h1>🔬 Test Product Analysis</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <textarea
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          style={{ width: '100%', height: '100px', padding: '10px' }}
        />
        <button 
          onClick={testAnalysis}
          disabled={loading}
          style={{
            padding: '10px 20px',
            marginTop: '10px',
            background: '#c4694f',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {loading ? 'Testing...' : 'Test Analysis'}
        </button>
      </div>

      {result && (
        <div style={{ 
          background: '#f5f5f5', 
          padding: '20px', 
          borderRadius: '8px',
          marginTop: '20px'
        }}>
          <h2>Result:</h2>
          <pre style={{ overflow: 'auto' }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default TestProductPage;