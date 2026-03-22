// src/api/symptomAPI.js
import { API_BASE, FETCH_TIMEOUT } from './config';

const fetchWithTimeout = async (url, options = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      mode: 'cors',
      credentials: 'omit',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout — please check if backend server is running.');
    }
    if (error.message === 'Failed to fetch') {
      throw new Error('Cannot connect to server. Please ensure the backend is running on port 5000.');
    }
    throw error;
  }
};

export const analyzeSymptoms = async (symptoms, knownCondition = '') => {
  console.log('🚀 analyzeSymptoms called with:', symptoms);

  // Step 1: Call symptom analysis
  const symptomUrl = `${API_BASE}/analyze-symptoms`;
  const symptomResponse = await fetchWithTimeout(symptomUrl, {
    method: 'POST',
    body: JSON.stringify({ symptoms }),
  });

  if (!symptomResponse.ok) {
    const errorText = await symptomResponse.text();
    throw new Error(`Symptom analysis failed (${symptomResponse.status}): ${errorText}`);
  }

  const symptomData = await symptomResponse.json();
  console.log('✅ Symptom analysis response:', symptomData);

  // Step 2: Determine condition for recommendations
  const conditionToUse =
    knownCondition ||
    symptomData.inferred_condition ||
    _inferConditionFromSymptoms(symptoms);

  console.log('🔍 Using condition for recommendations:', conditionToUse);

  // Step 3: Get recommendations
  let recommendations = null;
  try {
    const recUrl = `${API_BASE}/recommend`;
    const recResponse = await fetchWithTimeout(recUrl, {
      method: 'POST',
      body: JSON.stringify({ disease: conditionToUse, symptoms }),
    });

    if (recResponse.ok) {
      recommendations = await recResponse.json();
      console.log('✅ Recommendations received:', recommendations);
    } else {
      console.warn('⚠️ Recommendation API returned:', recResponse.status);
    }
  } catch (recError) {
    console.warn('⚠️ Recommendation fetch failed (non-fatal):', recError.message);
  }

  // Step 4: Combine and return
  const finalResult = {
    ...symptomData,
    recommendations,
    inferred_condition: conditionToUse,
    display_name:
      symptomData.display_name ||
      conditionToUse.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
  };

  console.log('📦 Final symptom result:', finalResult);
  return finalResult;
};

function _inferConditionFromSymptoms(symptoms) {
  const str = symptoms.join(' ').toLowerCase();
  if (str.includes('pimple') || str.includes('acne') || str.includes('oily')) return 'acne';
  if (str.includes('itch') || str.includes('dry') || str.includes('eczema')) return 'eczema';
  if (str.includes('hive') || str.includes('welt') || str.includes('urticaria')) return 'urticaria';
  if (str.includes('rash') || str.includes('red')) return 'contact_dermatitis';
  if (str.includes('fungal') || str.includes('ring')) return 'fungal';
  if (str.includes('mole') || str.includes('melanoma') || str.includes('dark spot')) return 'melanoma';
  if (str.includes('white patch') || str.includes('vitiligo')) return 'vitiligo';
  return 'eczema'; // safe default
}