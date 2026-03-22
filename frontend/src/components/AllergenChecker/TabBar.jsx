import React from 'react';
import './AllergenChecker.css';

const TabBar = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'check', label: 'Check Product' },
    { id: 'alt', label: 'Find Alternatives' },
    { id: 'food', label: 'Food Guide' }
  ];

  return (
    <div className="tab-bar">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default TabBar;