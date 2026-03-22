// src/components/ImageAnalysis/ImageAnalysis.jsx
import React, { useState, useRef } from 'react';
import { analyzeImage } from '../../api/diseaseAPI';

const ImageAnalysis = ({ onResults, onError }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef();

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    if (!selected.type.startsWith('image/')) {
      const msg = 'Please upload an image file (JPG, PNG, WEBP, etc.)';
      setError(msg);
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
      const result = await analyzeImage(file);
      console.log('✅ Analysis complete:', result);
      onResults(result);
    } catch (err) {
      console.error('❌ Analysis failed:', err);
      const msg = err.message || 'Analysis failed. Please ensure the backend is running on port 5000.';
      setError(msg);
      if (onError) onError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setPreview(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div>
      {/* Error display */}
      {error && (
        <div style={{
          background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px',
          padding: '12px 16px', marginBottom: '16px', color: '#b91c1c', fontSize: '.9rem',
        }}>
          ❌ {error}
          {error.includes('backend') && (
            <div style={{ marginTop: '8px', fontSize: '.82rem', color: '#7f1d1d' }}>
              <strong>Quick fix:</strong> Open a terminal, run <code style={{ background: '#fca5a5', padding: '2px 6px', borderRadius: '4px' }}>cd backend && python app.py</code>
            </div>
          )}
        </div>
      )}

      {/* Upload area */}
      <div
        onClick={() => !loading && fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        style={{
          border: `2px dashed ${preview ? '#c4694f' : '#d1d5db'}`,
          borderRadius: '12px', padding: preview ? '16px' : '48px 20px',
          textAlign: 'center', cursor: loading ? 'not-allowed' : 'pointer',
          background: preview ? '#fdf6f0' : '#fafafa',
          transition: 'all 0.2s ease', marginBottom: '16px',
        }}
      >
        {preview ? (
          <img
            src={preview}
            alt="Preview"
            style={{ maxHeight: '320px', maxWidth: '100%', borderRadius: '8px', objectFit: 'contain' }}
          />
        ) : (
          <>
            <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>📸</div>
            <p style={{ color: '#374151', fontWeight: '600', marginBottom: '6px', fontSize: '1rem' }}>
              Click to upload or drag & drop
            </p>
            <p style={{ color: '#9ca3af', fontSize: '.85rem' }}>
              JPG, PNG, WEBP — up to 10MB
            </p>
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

      {/* Actions */}
      <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
        {preview && !loading && (
          <button
            onClick={handleRemove}
            style={{
              padding: '10px 16px', background: 'none',
              border: '1px solid #d1d5db', borderRadius: '8px',
              cursor: 'pointer', color: '#6b7280', fontSize: '.88rem',
              alignSelf: 'flex-start',
            }}
          >
            × Remove Image
          </button>
        )}

        <button
          onClick={handleAnalyze}
          disabled={loading || !file}
          style={{
            width: '100%', padding: '14px 24px', fontSize: '1rem',
            fontWeight: '600', borderRadius: '10px', border: 'none',
            background: loading || !file ? '#d1d5db' : '#c4694f',
            color: 'white', cursor: loading || !file ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s ease',
          }}
        >
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <span style={{
                width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)',
                borderTopColor: 'white', borderRadius: '50%',
                display: 'inline-block', animation: 'spin 0.8s linear infinite',
              }} />
              Analyzing...
            </span>
          ) : (
            '🔍 Analyze Skin'
          )}
        </button>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default ImageAnalysis;