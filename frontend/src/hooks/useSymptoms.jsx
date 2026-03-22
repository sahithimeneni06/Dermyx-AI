import { useState } from 'react';
import { analyzeSymptoms } from '../api/symptomAPI';

export const useSymptoms = () => {
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

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

  const clearSymptoms = () => {
    setSelectedSymptoms([]);
    setResult(null);
    setError('');
  };

  const analyze = async (symptoms = selectedSymptoms) => {
    if (symptoms.length === 0) {
      setError('Please select at least one symptom.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await analyzeSymptoms(symptoms);
      setResult(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    selectedSymptoms,
    loading,
    error,
    result,
    toggleSymptom,
    addCustomSymptom,
    removeSymptom,
    clearSymptoms,
    analyze
  };
};