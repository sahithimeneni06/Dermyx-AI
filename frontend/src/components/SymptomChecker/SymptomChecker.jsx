import React, { useState } from 'react';
import SymptomChips from './SymptomChips';
import CustomSymptom from './CustomSymptom';
import SelectedTags from './SelectedTags';
import Button from '../UI/Button';
import Error from '../UI/Error';
import { COMMON_SYMPTOMS } from '../../utils/constants';
import { analyzeSymptoms } from '../../api/symptomAPI';
import './SymptomChecker.css';

const SymptomChecker = ({ onResults }) => {
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [knownCondition, setKnownCondition] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleSymptom = (symptom) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const addCustomSymptom = (symptom) => {
    if (symptom && !selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(prev => [...prev, symptom]);
    }
  };

  const removeSymptom = (symptom) => {
    setSelectedSymptoms(prev => prev.filter(s => s !== symptom));
  };

  const handleAnalyze = async () => {
    console.log('🚀 [SymptomChecker] Starting analysis...');
    console.log('📋 Selected symptoms:', selectedSymptoms);
    
    if (selectedSymptoms.length === 0) {
      setError('Please select at least one symptom.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await analyzeSymptoms(selectedSymptoms, knownCondition);
      console.log('✅ [SymptomChecker] API response:', result);
      
      // Ensure result has the expected structure
      const processedResult = {
        risk: result.risk || 'MODERATE',
        message: result.message || 'Analysis complete',
        symptoms_analyzed: result.symptoms_analyzed || selectedSymptoms,
        analysis_method: result.analysis_method || 'ml'
      };
      
      console.log('📦 [SymptomChecker] Processed result:', processedResult);
      
      // Call the parent callback
      onResults(processedResult);
      
    } catch (err) {
      console.error('❌ [SymptomChecker] Analysis failed:', err);
      setError(err.message || 'Something went wrong. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="symptoms">
      <div className="card">
        <h2 className="card-title">Symptom Checker</h2>
        <p className="card-sub">Select all symptoms you are currently experiencing</p>

        <SymptomChips 
          symptoms={COMMON_SYMPTOMS}
          selected={selectedSymptoms}
          onToggle={toggleSymptom}
        />

        <CustomSymptom onAdd={addCustomSymptom} />

        <SelectedTags 
          symptoms={selectedSymptoms}
          onRemove={removeSymptom}
        />

        <label className="form-label">Known condition (optional)</label>
        <select 
          className="sel-select" 
          value={knownCondition}
          onChange={(e) => setKnownCondition(e.target.value)}
        >
          <option value="">— Select if known —</option>
          <option value="acne">Acne</option>
          <option value="eczema">Eczema</option>
          <option value="psoriasis">Psoriasis</option>
          <option value="melanoma">Melanoma</option>
          <option value="vitiligo">Vitiligo</option>
          <option value="rosacea">Rosacea</option>
          <option value="dermatitis">Dermatitis</option>
          <option value="urticaria">Urticaria</option>
        </select>

        {error && <Error message={error} id="symErr" />}

        <Button 
          onClick={handleAnalyze}
          disabled={selectedSymptoms.length === 0 || loading}
          loading={loading}
          fullWidth
          variant="terra"
        >
          Analyze Symptoms
        </Button>
      </div>
    </section>
  );
};

export default SymptomChecker;