// src/pages/SkinTonePage.jsx
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyzeSkinTone } from '../api/skinToneAPI';
import './Pages.css';

const SkinTonePage = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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

  const handleAnalyze = async () => {
    if (!file) {
      setError('Please upload an image first.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const result = await analyzeSkinTone(file);
      localStorage.setItem('skinToneResult', JSON.stringify(result));
      localStorage.setItem('latestResult', JSON.stringify(result));
      navigate('/results/skin-tone');
    } catch (err) {
      console.error('❌ Skin tone analysis failed:', err);
      setError(err.message || 'Analysis failed. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-main">
      <div className="page-header">
        <h1 className="page-title">🎨 Skin Tone Analysis</h1>
        <p className="page-description">
          Upload a photo to determine your Fitzpatrick skin type and get personalized skincare recommendations.
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
        {/* Upload area */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          style={{
            border: `2px dashed ${preview ? '#d99b6e' : '#d1d5db'}`,
            borderRadius: '12px', padding: '40px 20px', textAlign: 'center',
            cursor: 'pointer', background: preview ? '#fff7f0' : '#fafafa',
            transition: 'all 0.2s ease', marginBottom: '20px',
          }}
        >
          {preview ? (
            <img src={preview} alt="Preview" style={{ maxHeight: '300px', maxWidth: '100%', borderRadius: '8px', objectFit: 'contain' }} />
          ) : (
            <>
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🎨</div>
              <p style={{ color: '#374151', fontWeight: '500', marginBottom: '4px' }}>Click or drag & drop an image</p>
              <p style={{ color: '#9ca3af', fontSize: '.85rem' }}>JPG, PNG, WEBP up to 10MB</p>
            </>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        {preview && (
          <button
            onClick={() => { setFile(null); setPreview(null); setError(null); }}
            style={{
              marginBottom: '16px', padding: '8px 16px', background: 'none',
              border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer',
              color: '#6b7280', fontSize: '.85rem',
            }}
          >
            × Remove Image
          </button>
        )}

        <button
          onClick={handleAnalyze}
          disabled={loading || !file}
          className="btn btn-primary"
          style={{
            width: '100%', padding: '14px', fontSize: '1rem',
            opacity: loading || !file ? 0.6 : 1,
            cursor: loading || !file ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? '⏳ Analyzing skin tone...' : '🔍 Analyze Skin Tone'}
        </button>

        {/* Info section */}
        <div style={{ marginTop: '32px', padding: '20px', background: '#f9fafb', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '.95rem', color: '#374151', marginBottom: '12px' }}>ℹ️ Tips for best results</h3>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '.85rem', color: '#6b7280' }}>
            <li style={{ marginBottom: '6px' }}>Use a photo in natural lighting (avoid flash)</li>
            <li style={{ marginBottom: '6px' }}>Make sure your face or skin area is clearly visible</li>
            <li style={{ marginBottom: '6px' }}>Avoid heavy makeup or filters</li>
            <li style={{ marginBottom: '6px' }}>Use a front-facing photo for best accuracy</li>
          </ul>
        </div>
      </div>

      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner" />
          <p>Analyzing skin tone...</p>
        </div>
      )}
    </main>
  );
};

export default SkinTonePage;