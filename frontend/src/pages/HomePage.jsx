import React from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import './Pages.css';

const HomePage = () => {
  const features = [
    {
      id: 'disease',
      title: 'Skin Disease Detection',
      icon: '🔬',
      description: 'Upload a photo of your skin concern for instant AI-powered disease detection and analysis.',
      color: '#c4694f',
      path: '/detect-disease',
      stats: '95% accuracy',
      features: ['Acne detection', 'Eczema analysis', 'Melasma screening', 'Psoriasis identification']
    },
    {
      id: 'symptoms',
      title: 'Symptom Checker',
      icon: '🤔',
      description: 'Describe your symptoms and get immediate risk assessment and condition analysis.',
      color: '#5c7e5f',
      path: '/symptom-checker',
      stats: '24/7 assessment',
      features: ['Risk evaluation', 'Condition matching', 'Emergency alerts', 'Doctor recommendations']
    },
    {
      id: 'skintone',
      title: 'Skin Tone Analysis',
      icon: '🎨',
      description: 'Determine your Fitzpatrick skin type for personalized skincare recommendations.',
      color: '#d99b6e',
      path: '/skin-tone',
      stats: '2-class classification',
      features: ['Light skin (I-III)', 'Dark skin (IV-VI)', 'SPF recommendations', 'Personalized routine']
    },
    {
      id: 'product',
      title: 'Product Analysis',
      icon: '🧴',
      description: 'Check product ingredients against your allergies for safe skincare choices.',
      color: '#c8a882',
      path: '/product-analysis',
      stats: 'Ingredient checker',
      features: ['Allergen detection', 'Safe alternatives', 'Ingredient scores', 'Product matching']
    }
  ];

  return (
    <>
      <Hero />
      <main className="main">
        {/* Feature Cards Section */}
        <section className="features-section">
          <h2 className="section-title">✨ AI-Powered Skin Analysis Tools</h2>
          <p className="section-subtitle">Choose a feature below to get started with your skin health journey</p>
          
          <div className="features-grid">
            {features.map(feature => (
              <Link to={feature.path} key={feature.id} className="feature-card-link">
                <div className="feature-card" style={{ borderTopColor: feature.color }}>
                  <div className="feature-header">
                    <span className="feature-icon" style={{ background: `${feature.color}20`, color: feature.color }}>
                      {feature.icon}
                    </span>
                    <span className="feature-stats" style={{ background: feature.color }}>{feature.stats}</span>
                  </div>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                  
                  <div className="feature-list">
                    {feature.features.map((item, index) => (
                      <div key={index} className="feature-list-item">
                        <span className="feature-bullet" style={{ color: feature.color }}>✓</span>
                        {item}
                      </div>
                    ))}
                  </div>
                  
                  <div className="feature-footer">
                    <span className="feature-link" style={{ color: feature.color }}>
                      Try Now → 
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </>
  );
};

export default HomePage;