import React, { useState } from 'react';
import DropZone from '../ImageAnalysis/DropZone';
import Button from '../UI/Button';
import Error from '../UI/Error';
import { analyzeSkinTone } from '../../api/skinToneAPI';
import './SkinToneAnalyzer.css';

const SkinToneAnalyzer = ({ onResults }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = (selectedFile) => {
    console.log('📁 [SkinToneAnalyzer] File selected:', {
      name: selectedFile.name,
      size: selectedFile.size,
      type: selectedFile.type
    });
    setFile(selectedFile);
    setError('');
  };

  const handleClear = () => {
    console.log('🗑️ [SkinToneAnalyzer] File cleared');
    setFile(null);
  };

  const handleAnalyze = async () => {
    console.log('🚀 [SkinToneAnalyzer] Starting analysis...');
    
    if (!file) {
      console.error('❌ [SkinToneAnalyzer] No file selected');
      setError('Please select an image first.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('📤 [SkinToneAnalyzer] Calling API with file:', file.name);
      const result = await analyzeSkinTone(file);
      
      console.log('✅ [SkinToneAnalyzer] API response:', result);
      
      // Validate result
      if (!result) {
        throw new Error('No result returned from API');
      }
      
      // Ensure result has required fields
      const processedResult = {
        skin_tone: result.skin_tone || 'Unknown',
        confidence: result.confidence || 0,
        description: result.description || 'Skin tone analysis complete',
        all_predictions: result.all_predictions || {
          "Light-Medium (I-III)": result.confidence || 0,
          "Tan-Dark (IV-VI)": 1 - (result.confidence || 0)
        }
      };
      
      console.log('📦 [SkinToneAnalyzer] Processed result:', processedResult);
      
      // Call the parent callback
      console.log('📞 [SkinToneAnalyzer] Calling onResults callback');
      onResults(processedResult);
      
    } catch (err) {
      console.error('❌ [SkinToneAnalyzer] Analysis failed:', err);
      setError(err.message || 'Something went wrong. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="skin-tone">
      <div className="card">
        <h2 className="card-title">Skin Tone Analysis</h2>
        <p className="card-sub">Upload a clear photo to determine your Fitzpatrick skin type</p>

        <div className="skin-tone-info">
          <div className="info-grid">
            <div className="info-item light-skin">
              <span className="info-label">Light-Medium Skin</span>
              <span className="info-desc">Types I-III: Fair to medium skin</span>
              <ul className="info-list">
                <li>Type I: Very fair, always burns</li>
                <li>Type II: Fair, usually burns</li>
                <li>Type III: Medium, sometimes burns</li>
              </ul>
            </div>
            <div className="info-item dark-skin">
              <span className="info-label">Tan-Dark Skin</span>
              <span className="info-desc">Types IV-VI: Olive to dark skin</span>
              <ul className="info-list">
                <li>Type IV: Olive, rarely burns</li>
                <li>Type V: Brown, very rarely burns</li>
                <li>Type VI: Dark brown/black, never burns</li>
              </ul>
            </div>
          </div>
        </div>

        <DropZone 
          file={file} 
          onFileSelect={handleFileSelect}
          onClear={handleClear}
        />

        {error && <Error message={error} />}

        <Button 
          onClick={handleAnalyze}
          disabled={!file || loading}
          loading={loading}
          fullWidth
          variant="primary"
        >
          {loading ? 'Analyzing...' : 'Analyze Skin Tone'}
        </Button>

        <div className="skin-tone-tips">
          <h4>📸 Tips for best results:</h4>
          <ul>
            <li>Use natural, even lighting</li>
            <li>Include only the skin area (no makeup)</li>
            <li>Avoid shadows on the skin</li>
            <li>Take photo against neutral background</li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default SkinToneAnalyzer;