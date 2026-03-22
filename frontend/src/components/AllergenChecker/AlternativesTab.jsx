import React, { useState } from 'react';
import Button from '../UI/Button';
import Error from '../UI/Error';
import { findAlternatives } from '../../api/allergyAPI';
import { parseCSV } from '../../utils/parsers';
import './AllergenChecker.css';

const AlternativesTab = () => {
  const [ingredients, setIngredients] = useState('');
  const [allergies, setAllergies] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleFindAlternatives = async () => {
    const ingsList = parseCSV(ingredients);
    const allergiesList = parseCSV(allergies);

    if (!ingsList.length) {
      setError('Please enter ingredients.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await findAlternatives(ingsList, allergiesList);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tab-panel" id="tab-alt">
      <label className="form-label">Ingredients to Find Alternatives For</label>
      <textarea 
        className="textarea-input" 
        placeholder="e.g. fragrance, paraben, sodium lauryl sulfate…"
        value={ingredients}
        onChange={(e) => setIngredients(e.target.value)}
      />
      
      <label className="form-label" style={{marginTop:'10px'}}>
        Your Known Allergies
      </label>
      <textarea 
        className="textarea-input" 
        placeholder="e.g. fragrance, sulfate…"
        value={allergies}
        onChange={(e) => setAllergies(e.target.value)}
      />
      
      {error && <Error message={error} />}
      
      <Button 
        onClick={handleFindAlternatives}
        disabled={loading}
        loading={loading}
        fullWidth
        variant="terra"
        style={{marginTop:'6px'}}
      >
        Find Alternatives
      </Button>

      {result && (
        <div style={{marginTop:'18px'}}>
          {result.problematic && result.problematic.length > 0 ? (
            <>
              <p style={{fontSize:'.84rem',fontWeight:'600',color:'var(--ink)',marginBottom:'10px'}}>
                Problematic ingredients & safe swaps:
              </p>
              <div className="alt-list">
                {result.problematic.map((p, index) => (
                  <div key={index} className="alt-row">
                    <div className="alt-problem">
                      ✕ {p.ingredient} <span style={{fontWeight:'400',color:'var(--ink3)'}}>
                        ({p.allergy} allergy)
                      </span>
                    </div>
                    <div className="alt-chips">
                      {(p.alternatives || []).map((alt, i) => (
                        <span key={i} className="alt-chip">✓ {alt}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p style={{color:'var(--ink3)',fontSize:'.85rem'}}>
              No issues found with the provided ingredients.
            </p>
          )}
          {result.safe_ingredients && result.safe_ingredients.length > 0 && (
            <p style={{fontSize:'.82rem',color:'var(--sage)',fontWeight:'600',marginTop:'14px'}}>
              ✓ Safe ingredients: {result.safe_ingredients.join(', ')}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default AlternativesTab;