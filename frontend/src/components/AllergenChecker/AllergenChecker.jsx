import React, { useState } from 'react';
import TabBar from './TabBar';
import CheckProductTab from './CheckProductTab';
import AlternativesTab from './AlternativesTab';
import FoodGuideTab from './FoodGuideTab';
import './AllergenChecker.css';

const AllergenChecker = () => {
  const [activeTab, setActiveTab] = useState('check');

  return (
    <section id="allergy">
      <div className="card">
        <h2 className="card-title">Allergen Checker</h2>
        <p className="card-sub">Paste product ingredients and your known allergies to check safety</p>

        <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'check' && <CheckProductTab />}
        {activeTab === 'alt' && <AlternativesTab />}
        {activeTab === 'food' && <FoodGuideTab />}
      </div>
    </section>
  );
};

export default AllergenChecker;