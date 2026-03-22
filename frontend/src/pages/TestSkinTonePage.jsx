import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TestSkinTonePage = () => {
  const navigate = useNavigate();
  const [result, setResult] = useState(null);

  const handleTestResult = () => {
    // Create a mock result
    const mockResult = {
      skin_tone: "Light-Medium (I-III)",
      confidence: 0.89,
      description: "Light to medium skin that may burn with sun exposure",
      all_predictions: {
        "Light-Medium (I-III)": 0.89,
        "Tan-Dark (IV-VI)": 0.11
      }
    };

    console.log("🔍 Test: Setting mock result:", mockResult);
    
    // Store in localStorage
    try {
      localStorage.setItem('skinToneResult', JSON.stringify(mockResult));
      console.log("✅ Test: Stored in localStorage");
      
      // Verify it was stored
      const check = localStorage.getItem('skinToneResult');
      console.log("📦 Test: Retrieved from localStorage:", check);
      
      // Navigate
      navigate('/results/skin-tone');
    } catch (error) {
      console.error("❌ Test error:", error);
    }
  };

  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1>Test Skin Tone Page</h1>
      <button 
        onClick={handleTestResult}
        style={{
          padding: '15px 30px',
 fontSize: '18px',
          background: '#c4694f',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer'
        }}
      >
        Test: Set Mock Result and Navigate
      </button>
      
      {result && (
        <pre style={{ marginTop: '20px', textAlign: 'left' }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default TestSkinTonePage;