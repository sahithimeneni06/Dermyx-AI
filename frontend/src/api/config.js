// src/api/config.js
const getBaseUrl = () => {
  if (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  ) {
    return 'http://localhost:5000';
  }
  // Replace with your production URL when deploying
  return 'https://your-backend-url.com';
};

export const API_BASE = getBaseUrl();

// 60 seconds timeout
export const FETCH_TIMEOUT = 60000;

console.log('🌐 API Base URL:', API_BASE);