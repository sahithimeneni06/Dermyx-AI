import React, { useState } from 'react';
import DropZone from '../ImageAnalysis/DropZone';
import Button from '../UI/Button';
import Error from '../UI/Error';
import { analyzeProductImage, analyzeIngredientsText } from '../../api/productAPI';
import './ProductAnalyzer.css';

const ProductAnalyzer = ({ onResults }) => {
  const [mode, setMode] = useState('text');
  const [file, setFile] = useState(null);
  const [ingredientsText, setIngredientsText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [progressMessage, setProgressMessage] = useState('');

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setError('');
  };

  const handleClear = () => {
    setFile(null);
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setError('');
    setProgressMessage('Processing...');

    try {
      let result;
      
      if (mode === 'image') {
        if (!file) {
          setError('Please select an image first.');
          setLoading(false);
          return;
        }
        setProgressMessage('Uploading image...');
        console.log('📤 Analyzing image:', file.name);
        
        setProgressMessage('Analyzing with OCR (may take 30-60 seconds on first use)...');
        result = await analyzeProductImage(file);
      } else {
        if (!ingredientsText.trim()) {
          setError('Please enter ingredients.');
          setLoading(false);
          return;
        }
        console.log('📤 Analyzing text:', ingredientsText);
        result = await analyzeIngredientsText(ingredientsText);
      }
      
      console.log('✅ Analysis complete:', result);
      setProgressMessage('');
      onResults({ type: 'product', data: result });
      
    } catch (err) {
      console.error('❌ Analysis failed:', err);
      setError(err.message || 'Failed to analyze ingredients');
      setProgressMessage('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="product-analyzer">
      <div className="card">
        <h2 className="card-title">Ingredient Analyzer</h2>
        <p className="card-sub">Upload a product label or type ingredients to check safety</p>

        <div className="mode-toggle">
          <button 
            className={`mode-btn ${mode === 'text' ? 'active' : ''}`}
            onClick={() => setMode('text')}
          >
            ✍️ Type Ingredients
          </button>
          <button 
            className={`mode-btn ${mode === 'image' ? 'active' : ''}`}
            onClick={() => setMode('image')}
          >
            📸 Upload Image
          </button>
        </div>


        {mode === 'image' ? (
           <DropZone 
            file={file} 
            onFileSelect={handleFileSelect}
            onClear={handleClear}
          />
        ) : (
          <div className="text-input-area">
            <textarea
              className="ingredients-textarea"
              placeholder="Enter ingredients separated by commas&#10;Example: water, glycerin, salicylic acid, alcohol"
              value={ingredientsText}
              onChange={(e) => setIngredientsText(e.target.value)}
              rows={6}
            />
          </div>
        )}

        {progressMessage && (
          <div className="progress-message" style={{
            padding: '10px',
            background: '#e3f2fd',
            borderRadius: '4px',
            marginBottom: '10px',
            color: '#0d47a1',
            fontSize: '.9rem'
          }}>
            ⏳ {progressMessage}
          </div>
        )}

        {error && <Error message={error} />}

        <Button 
          onClick={handleAnalyze}
          disabled={loading || (mode === 'image' ? !file : !ingredientsText.trim())}
          loading={loading}
          fullWidth
          variant="primary"
        >
          {loading ? 'Processing...' : 'Analyze Ingredients'}
        </Button>

        <div className="rating-guide">
          <h4>Rating Guide:</h4>
          <div className="rating-items">
            <span className="rating-badge best">Best</span> - Safe, beneficial ingredients
            <span className="rating-badge good">Good</span> - Generally safe
            <span className="rating-badge average">Average</span> - Acceptable with caution
            <span className="rating-badge bad">Bad</span> - Avoid, may cause irritation
            <span className="rating-badge unknown">Unknown</span> - Not in database
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductAnalyzer;