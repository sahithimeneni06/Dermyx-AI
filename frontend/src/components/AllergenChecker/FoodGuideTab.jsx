import React, { useState } from 'react';
import Button from '../UI/Button';
import Error from '../UI/Error';
import { getFoodGuide } from '../../api/allergyAPI';
import FoodGuide from '../Results/FoodGuide';
import './AllergenChecker.css';

const FoodGuideTab = () => {
  const [allergy, setAllergy] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleGetFoodGuide = async () => {
    const trimmed = allergy.trim();
    if (!trimmed) {
      setError('Please enter an allergy or condition.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await getFoodGuide(trimmed);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tab-panel" id="tab-food">
      <label className="form-label">Allergy / Condition</label>
      <input 
        className="txt-input" 
        placeholder="e.g. fragrance, nut, sulfate, eczema…"
        value={allergy}
        onChange={(e) => setAllergy(e.target.value)}
        style={{marginBottom:'8px',width:'100%'}}
      />
      
      {error && <Error message={error} />}
      
      <Button 
        onClick={handleGetFoodGuide}
        disabled={loading}
        loading={loading}
        fullWidth
        variant="terra"
        style={{marginTop:'6px'}}
      >
        Get Food Guide
      </Button>

      {result && (
        <div style={{marginTop:'18px'}}>
          <FoodGuide food={result} />
        </div>
      )}
    </div>
  );
};

export default FoodGuideTab;