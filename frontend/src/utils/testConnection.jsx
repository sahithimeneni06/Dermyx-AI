export const testBackendConnection = async () => {
  console.log('🔍 Testing connection to http://localhost:5000...');
  
  const urls = [
    'http://localhost:5000/health',
    'http://127.0.0.1:5000/health',
    'http://0.0.0.0:5000/health'
  ];
  
  for (const url of urls) {
    try {
      console.log(`Testing: ${url}`);
      const response = await fetch(url, { 
        method: 'GET',
        mode: 'cors',
        headers: { 'Accept': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Connected to ${url}:`, data);
        return { success: true, url, data };
      }
    } catch (error) {
      console.log(`❌ Failed to connect to ${url}: ${error.message}`);
    }
  }
  
  return { 
    success: false, 
    message: 'Could not connect to backend on any port' 
  };
};