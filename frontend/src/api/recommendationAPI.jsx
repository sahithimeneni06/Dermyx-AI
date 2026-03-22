// src/api/recommendAPI.js
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
    throw error;
  }
};

export const getRecommendations = async (disease, symptoms = []) => {
  try {
    console.log('📤 Fetching recommendations for:', { disease, symptoms });

    const url = `${API_BASE}/recommend`;
    const response = await fetchWithTimeout(url, {
      method: 'POST',
      body: JSON.stringify({
        disease: disease.toLowerCase(),
        symptoms: symptoms.map((s) => s.toLowerCase()),
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Failed (${response.status})`);
    }

    const data = await response.json();
    console.log('✅ Recommendations received:', data);
    return data;
  } catch (error) {
    console.error('❌ Recommendations API Error:', error);
    return null;
  }
};