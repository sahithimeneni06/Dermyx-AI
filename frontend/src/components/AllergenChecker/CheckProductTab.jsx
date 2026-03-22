import React, { useState } from 'react';
import Button from '../UI/Button';
import Error from '../UI/Error';
import { checkAllergens } from '../../api/allergyAPI';
import { parseCSV } from '../../utils/parsers';
import './AllergenChecker.css';

const CheckProductTab = () => {
  const [ingredients, setIngredients] = useState('');
  const [allergies, setAllergies] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleCheck = async () => {
    const ingsList = parseCSV(ingredients);
    const allergiesList = parseCSV(allergies);

    if (!ingsList.length) {
      setError('Please enter ingredients.');
      return;
    }
    if (!allergiesList.length) {
      setError('Please enter known allergies.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await checkAllergens(ingsList, allergiesList);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityClass = (severity) => {
    const classes = {
      none: 'sev-none',
      mild: 'sev-mild',
      severe: 'sev-severe'
    };
    return classes[severity] || 'sev-mild';
  };

  return (
    <div className="tab-panel active" id="tab-check">
      <label className="form-label">Product Ingredients (comma-separated)</label>
      <textarea 
        className="textarea-input" 
        placeholder="e.g. fragrance, methylparaben, almond oil, sodium lauryl sulfate…"
        value={ingredients}
        onChange={(e) => setIngredients(e.target.value)}
      />
      
      <label className="form-label" style={{marginTop:'10px'}}>
        Your Known Allergies (comma-separated)
      </label>
      <textarea 
        className="textarea-input" 
        placeholder="e.g. fragrance, nut, sulfate…"
        value={allergies}
        onChange={(e) => setAllergies(e.target.value)}
      />
      
      {error && <Error message={error} />}
      
      <Button 
        onClick={handleCheck}
        disabled={loading}
        loading={loading}
        fullWidth
        variant="terra"
        style={{marginTop:'6px'}}
      >
        Check Safety
      </Button>

      {result && (
        <div style={{marginTop:'18px'}}>
          <div>
            <div className={result.is_safe ? 'result-safe' : 'result-unsafe'}>
              {result.is_safe ? '✓ Product appears safe' : '✕ Allergens detected'}
            </div>
            <span className={`severity-badge ${getSeverityClass(result.severity)}`} style={{marginTop:'8px'}}>
              Severity: {result.severity}
            </span>
            <p style={{fontSize:'.85rem',color:'var(--ink2)',marginBottom:'12px'}}>
              {result.warning}
            </p>
          </div>
          {result.allergens_found && result.allergens_found.length > 0 && (
            <div className="allergen-found">
              {result.allergens_found.map((a, index) => (
                <div key={index} className="allergen-row">
                  ⚠ <span className="allergen-name">{a.ingredient}</span> — matched allergy: <strong>{a.matched_allergy}</strong>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CheckProductTab;