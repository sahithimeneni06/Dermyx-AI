// api/productAPI.jsx
import { API_BASE, FETCH_TIMEOUT } from './config';

const fetchWithTimeout = async (url, options = {}, timeout = 30000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    console.log(`🌐 Fetching: ${url}`);
    
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      mode: 'cors',
      credentials: 'omit'
    });
    
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout/1000} seconds - server not responding`);
    }
    throw error;
  }
};

export const analyzeProductImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append('image', file);
    
    const url = `${API_BASE}/analyze-product`;
    console.log('📤 Sending product image to:', url);
    console.log('📁 File:', file.name, `(${(file.size / 1024).toFixed(2)} KB)`);
    
    // 60 second timeout for product analysis (OCR can take time)
    const response = await fetchWithTimeout(url, {
      method: 'POST',
      body: formData
    }, 60000);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server response:', errorText);
      
      try {
        const error = JSON.parse(errorText);
        throw new Error(error.error || `Server error: ${response.status}`);
      } catch (e) {
        throw new Error(`Server error (${response.status}): ${errorText.substring(0, 100)}`);
      }
    }

    const data = await response.json();
    console.log('✅ Product analysis complete:', data);
    return data;
    
  } catch (error) {
    console.error('❌ Product API Error:', error);
    throw error;
  }
};

export const analyzeIngredientsText = async (ingredients) => {
  try {
    const url = `${API_BASE}/analyze-ingredients`;
    console.log('📤 Sending ingredients text to:', url);
    
    const requestBody = typeof ingredients === 'string' 
      ? { ingredients: ingredients.split(',').map(i => i.trim()) }
      : { ingredients };
    
    const response = await fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    }, 30000);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server response:', errorText);
      
      try {
        const error = JSON.parse(errorText);
        throw new Error(error.error || `Server error: ${response.status}`);
      } catch (e) {
        throw new Error(`Server error (${response.status})`);
      }
    }

    const data = await response.json();
    console.log('✅ Text analysis complete:', data);
    return data;
    
  } catch (error) {
    console.error('❌ Product API Error:', error);
    throw error;
  }
};