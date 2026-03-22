import React from 'react';

const Hero = () => {
  return (
    <div className="hero">
      <div className="hero-inner">
        <div className="hero-tag">AI-Powered Dermatology</div>
        <h1 className="hero-title">Understand Your <em>Skin</em></h1>
        <p className="hero-sub">
          Upload a photo or describe your symptoms for instant disease detection, 
          allergy analysis, and personalized recommendations.
        </p>
        <div className="hero-pills">
          <span className="hero-pill">🔬 Disease Detection</span>
          <span className="hero-pill">🌿 Allergy Analysis</span>
          <span className="hero-pill">💊 Product Recs</span>
          <span className="hero-pill">🥗 Food Guide</span>
          <span className="hero-pill">🎨 Skin Tone</span>
        </div>
      </div>
    </div>
  );
};

export default Hero;