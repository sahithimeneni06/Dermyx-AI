// src/pages/ProductAnalysisPage.jsx
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyzeProductImage, analyzeIngredientsText } from '../api/productAPI';
import './Pages.css';

const ProductAnalysisPage = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState('image'); // 'image' | 'text'
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [ingredientsText, setIngredientsText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showTextInput, setShowTextInput] = useState(false);
  const fileInputRef = useRef();

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    if (!selected.type.startsWith('image/')) {
      setError('Please upload an image file (JPG, PNG, etc.)');
      return;
    }
    setFile(selected);
    setError(null);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(selected);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type.startsWith('image/')) {
      setFile(dropped);
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target.result);
      reader.readAsDataURL(dropped);
      setError(null);
    }
  };

  const handleDragOver = (e) => e.preventDefault();

  // 🔥 FIXED: handleAnalyze function
  const handleAnalyze = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let result;
      
      if (mode === 'image') {
        if (!file) {
          setError('Please select an image first');
          setLoading(false);
          return;
        }
        
        console.log('📤 Analyzing product image:', file.name);
        result = await analyzeProductImage(file);
        
        // Check if it's an image analysis that suggests using text input
        if (result.overall_rating === "Image Analysis Unavailable" && result.note) {
          // Show a helpful message and switch to text input mode
          setShowTextInput(true);
          setMode('text');
          alert(result.note + " Please paste the ingredients list in the text area below.");
        }
        
      } else {
        // Text mode
        if (!ingredientsText.trim()) {
          setError('Please enter ingredients list');
          setLoading(false);
          return;
        }
        
        console.log('📤 Analyzing ingredients text:', ingredientsText.substring(0, 100));
        result = await analyzeIngredientsText(ingredientsText);
      }
      
      console.log('📊 Product analysis result:', result);
      
      // Save to localStorage
      localStorage.setItem('productResult', JSON.stringify(result));
      
      // Navigate to results page
      navigate('/results/product');
      
    } catch (error) {
      console.error('❌ Product analysis failed:', error);
      setError('Analysis failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-main">
      <div className="page-header">
        <h1 className="page-title">🧴 Product Ingredient Analysis</h1>
        <p className="page-description">
          Check your skincare product ingredients for safety and compatibility with your skin type.
        </p>
      </div>

      {error && (
        <div style={{
          background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px',
          padding: '12px 16px', marginBottom: '20px', color: '#b91c1c',
        }}>
          ❌ {error}
        </div>
      )}

      <div className="page-content">
        {/* Mode toggle */}
        <div style={{ display: 'flex', gap: '0', marginBottom: '24px', border: '1.5px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>
          {[
            { key: 'image', label: '📷 Scan Product Label', desc: 'Upload a photo' },
            { key: 'text', label: '✍️ Enter Ingredients', desc: 'Paste ingredient list' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => { setMode(key); setError(null); setShowTextInput(false); }}
              style={{
                flex: 1, padding: '14px', border: 'none', cursor: 'pointer',
                background: mode === key ? '#c8a882' : 'white',
                color: mode === key ? 'white' : '#6b7280',
                fontWeight: mode === key ? '600' : '400',
                fontSize: '.9rem', transition: 'all 0.15s ease',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Image mode */}
        {mode === 'image' && (
          <>
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              style={{
                border: `2px dashed ${preview ? '#c8a882' : '#d1d5db'}`,
                borderRadius: '12px', padding: '40px 20px', textAlign: 'center',
                cursor: 'pointer', background: preview ? '#fdf8f4' : '#fafafa',
                marginBottom: '20px', transition: 'all 0.2s ease',
              }}
            >
              {preview ? (
                <img src={preview} alt="Preview" style={{ maxHeight: '280px', maxWidth: '100%', borderRadius: '8px', objectFit: 'contain' }} />
              ) : (
                <>
                  <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🧴</div>
                  <p style={{ color: '#374151', fontWeight: '500', marginBottom: '4px' }}>Click or drag & drop product label image</p>
                  <p style={{ color: '#9ca3af', fontSize: '.85rem' }}>The AI will read the ingredient list from the image</p>
                </>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
            {preview && (
              <button
                onClick={() => { setFile(null); setPreview(null); }}
                style={{ marginBottom: '16px', padding: '8px 16px', background: 'none', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', color: '#6b7280', fontSize: '.85rem' }}
              >
                × Remove Image
              </button>
            )}
          </>
        )}

        {/* Text mode */}
        {mode === 'text' && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '.9rem', color: '#374151', marginBottom: '8px', fontWeight: '500' }}>
              Paste ingredient list (comma-separated):
            </label>
            <textarea
              value={ingredientsText}
              onChange={(e) => setIngredientsText(e.target.value)}
              placeholder="e.g. Water, Glycerin, Niacinamide, Salicylic Acid, Fragrance, Alcohol..."
              rows={6}
              style={{
                width: '100%', padding: '12px', borderRadius: '8px',
                border: '1.5px solid #d1d5db', fontSize: '.9rem',
                outline: 'none', resize: 'vertical', fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            />
            <p style={{ fontSize: '.78rem', color: '#9ca3af', marginTop: '6px' }}>
              Separate ingredients with commas. Copy directly from the product packaging.
            </p>
          </div>
        )}

        {/* Analyze button */}
        <button
          onClick={handleAnalyze}
          disabled={loading || (mode === 'image' ? !file : !ingredientsText.trim())}
          className="btn btn-primary"
          style={{
            width: '100%', padding: '14px', fontSize: '1rem',
            opacity: loading || (mode === 'image' ? !file : !ingredientsText.trim()) ? 0.6 : 1,
            cursor: loading || (mode === 'image' ? !file : !ingredientsText.trim()) ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? '⏳ Analyzing ingredients...' : '🔍 Analyze Ingredients'}
        </button>

        {/* Tips */}
        <div style={{ marginTop: '28px', padding: '18px', background: '#f9fafb', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '.9rem', color: '#374151', marginBottom: '10px', fontWeight: '600' }}>💡 Tips for best results</h3>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '.82rem', color: '#6b7280' }}>
            <li style={{ marginBottom: '5px' }}>Use a clear, well-lit photo of the ingredient label</li>
            <li style={{ marginBottom: '5px' }}>Make sure text is in focus and readable</li>
            <li style={{ marginBottom: '5px' }}>Or simply copy-paste the ingredient list from the brand's website</li>
            <li style={{ marginBottom: '5px' }}>Results are informational — always consult a dermatologist for allergies</li>
          </ul>
        </div>
      </div>

      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner" />
          <p>Analyzing ingredients...</p>
        </div>
      )}
    </main>
  );
};

export default ProductAnalysisPage;