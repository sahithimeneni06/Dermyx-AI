import React from 'react';
import './Results.css';

const FoodGuide = ({ food }) => {
  if (!food) return null;

  const eatHTML = (food.eat || []).length > 0
    ? food.eat.map(item => (
        <div key={item.name} className="food-item">
          <strong>{item.name}</strong>
          {item.reason && <div className="food-reason">{item.reason}</div>}
        </div>
      ))
    : <p style={{color:'var(--ink3)',fontSize:'.82rem'}}>No specific recommendations.</p>;

  const avoidHTML = (food.avoid || []).length > 0
    ? food.avoid.map(item => (
        <div key={item.name} className="food-item">
          <strong>{item.name}</strong>
          {item.reason && <div className="food-reason">{item.reason}</div>}
        </div>
      ))
    : <p style={{color:'var(--ink3)',fontSize:'.82rem'}}>None listed.</p>;

  return (
    <div className="food-grid">
      <div className="food-eat">
        <div className="food-head">✅ Foods to Eat</div>
        <div className="food-items">{eatHTML}</div>
      </div>
      <div className="food-avoid">
        <div className="food-head">❌ Foods to Avoid</div>
        <div className="food-items">{avoidHTML}</div>
      </div>
    </div>
  );
};

export default FoodGuide;