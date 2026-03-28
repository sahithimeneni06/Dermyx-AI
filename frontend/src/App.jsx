// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Layout/Footer';
import HomePage from './pages/HomePage';
import DiseaseDetectionPage from './pages/DiseaseDetectionPage';
import SymptomCheckerPage from './pages/SymptomCheckerPage';
import SkinTonePage from './pages/SkinTonePage';
import ProductAnalysisPage from './pages/ProductAnalysisPage';
import ResultsPage from './pages/ResultsPage';
import NearbyDoctorsPage from './pages/NearbyDoctorsPage';
import './styles/global.css';

function App() {
  
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/detect-disease" element={<DiseaseDetectionPage />} />
        <Route path="/symptom-checker" element={<SymptomCheckerPage />} />
        <Route path="/skin-tone" element={<SkinTonePage />} />
        <Route path="/product-analysis" element={<ProductAnalysisPage />} />
        <Route path="/results/:type" element={<ResultsPage />} />
        <Route path="/nearby-doctors" element={<NearbyDoctorsPage />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;