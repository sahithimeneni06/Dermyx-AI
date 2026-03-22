import React, { useState } from 'react';
import Button from '../UI/Button';
import './SymptomChecker.css';

const CustomSymptom = ({ onAdd }) => {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    const trimmed = inputValue.trim().toLowerCase();
    if (trimmed) {
      onAdd(trimmed);
      setInputValue('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  return (
    <div className="input-row">
      <input 
        className="txt-input" 
        placeholder="Add a custom symptom…"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <Button onClick={handleAdd} variant="primary">
        Add
      </Button>
    </div>
  );
};

export default CustomSymptom;