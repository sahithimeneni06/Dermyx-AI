// src/api/skinToneAPI.js
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

export const analyzeSkinTone = async (file) => {
  const formData = new FormData();
  formData.append('image', file);

  const url = `${API_BASE}/detect-skin-tone`;
  console.log(`📤 Sending skin tone request to: ${url}`);

  const response = await fetchWithTimeout(url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    let message = `Server error (${response.status})`;
    try {
      const err = JSON.parse(errorText);
      message = err.error || message;
    } catch (_) {}
    throw new Error(message);
  }

  const data = await response.json();
  console.log('✅ Skin tone result:', data);
  return data;
};