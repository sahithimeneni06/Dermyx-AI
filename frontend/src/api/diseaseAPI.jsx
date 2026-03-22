// src/api/diseaseAPI.js
import { API_BASE, FETCH_TIMEOUT } from './config';

const fetchWithTimeout = async (url, options = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    console.log(`🌐 Fetching: ${url}`);
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      mode: 'cors',
      credentials: 'omit',
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout — server not responding. Please ensure the backend is running on port 5000.');
    }
    if (error.message === 'Failed to fetch') {
      throw new Error('Cannot connect to server. Please ensure the backend is running:\n\ncd backend\npython app.py');
    }
    throw error;
  }
};

// Step 1: Detect disease from image
const detectDisease = async (file) => {
  const formData = new FormData();
  formData.append('image', file);

  const url = `${API_BASE}/detect-disease`;
  console.log('📤 Sending image to:', url);

  const response = await fetchWithTimeout(url, {
    method: 'POST',
    body: formData,
  });

  console.log('📥 Detection status:', response.status);

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Detection failed (${response.status})`);
  }

  const data = await response.json();
  console.log('📦 RAW Detection result from backend:', data);
  
  // ✅ IMPORTANT: Return the nested data object
  if (data.success && data.data) {
    console.log('✅ Extracted data from response:', data.data);
    return data.data;
  }
  
  return data;
};

// Step 2: Get recommendations for a condition
const fetchRecommendations = async (conditionName, symptoms = []) => {
  const url = `${API_BASE}/recommend`;
  console.log('📤 Fetching recommendations for:', conditionName);

  try {
    const response = await fetchWithTimeout(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ disease: conditionName, symptoms }),
    });

    if (!response.ok) {
      console.warn(`⚠️ Recommend endpoint returned ${response.status}`);
      return null;
    }

    const recs = await response.json();
    console.log('📦 Recommendations:', recs);
    return recs;
  } catch (err) {
    console.warn('⚠️ Recommendation fetch failed (non-fatal):', err.message);
    return null;
  }
};

// Main export: detect → recommend → merge
export const analyzeImage = async (file, symptoms = []) => {
  // Step 1 — detect (now returns the data object directly)
  const detectionResult = await detectDisease(file);
  
  // 🔥 CRITICAL: Log what we got from backend
  console.log('🔥 BACKEND RESULT (after extraction):', detectionResult);
  console.log('🔥 CONDITION:', detectionResult.condition);
  console.log('🔥 DISPLAY_NAME:', detectionResult.display_name);
  console.log('🔥 CATEGORY:', detectionResult.category);
  console.log('🔥 CONFIDENCE:', detectionResult.confidence);

  // ✅ Now detectionResult has condition directly
  const conditionName = detectionResult.condition || detectionResult.category || 'normal';
  const displayName = detectionResult.display_name ||
    conditionName.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  // Step 2 — recommend
  const recsResult = await fetchRecommendations(conditionName, symptoms);

  // Step 3 — merge recommendations
  let mergedRecommendations = detectionResult.recommendations || {};

  if (recsResult && recsResult.recommendations) {
    const engineProducts = recsResult.recommendations.products || [];
    const engineFood = recsResult.recommendations.food || {};
    const enginePrecautions = recsResult.recommendations.precautions || [];
    const engineRisk = recsResult.risk_assessment || {};

    mergedRecommendations = {
      risk_level: engineRisk.level || mergedRecommendations.risk_level || 'MODERATE',
      requires_doctor:
        engineRisk.requires_doctor != null
          ? engineRisk.requires_doctor
          : mergedRecommendations.requires_doctor || false,
      products: engineProducts.length > 0 ? engineProducts : mergedRecommendations.products || [],
      food: {
        eat:
          (engineFood.eat || []).length > 0
            ? engineFood.eat
            : mergedRecommendations.food?.eat || [],
        avoid:
          (engineFood.avoid || []).length > 0
            ? engineFood.avoid
            : mergedRecommendations.food?.avoid || [],
      },
      precautions:
        enginePrecautions.length > 0
          ? enginePrecautions
          : mergedRecommendations.precautions || [],
      emergency: recsResult.emergency || mergedRecommendations.emergency || null,
    };
  }

  if (!mergedRecommendations.emergency) {
    delete mergedRecommendations.emergency;
  }

  const finalResult = {
    ...detectionResult,
    condition: conditionName,
    display_name: displayName,
    category: detectionResult.category || conditionName,
    recommendations: mergedRecommendations,
  };

  // 🔥 CRITICAL: Log the final result before saving
  console.log('✅ FINAL RESULT TO SAVE:', finalResult);
  console.log('✅ CONDITION IN FINAL RESULT:', finalResult.condition);
  console.log('✅ DISPLAY_NAME IN FINAL RESULT:', finalResult.display_name);
  console.log('✅ CONFIDENCE IN FINAL RESULT:', finalResult.confidence);
  
  // 🔥 IMPORTANT: Save to localStorage with the correct key
  localStorage.setItem('diseaseResult', JSON.stringify(finalResult));
  console.log('💾 Saved to localStorage with key: diseaseResult');
  
  // Also verify it was saved correctly
  const saved = localStorage.getItem('diseaseResult');
  if (saved) {
    const parsed = JSON.parse(saved);
    console.log('💾 VERIFICATION - Saved condition:', parsed.condition);
    console.log('💾 VERIFICATION - Saved display_name:', parsed.display_name);
  }
  
  return finalResult;
};

// Allergy detection — same backend endpoint, frontend just labels it differently
export const analyzeAllergyImage = async (file, symptoms = []) => {
  const result = await analyzeImage(file, symptoms);
  // Mark it as allergy-focused for display
  return {
    ...result,
    analysis_type: 'allergy',
  };
};

export const getRecommendations = async (disease, symptoms = []) => {
  return fetchRecommendations(disease, symptoms);
};