import React, { useState, useEffect } from 'react';
import { testBackendConnection } from '../../utils/connectionTest';
import './UI.css';

const ConnectionStatus = () => {
  const [status, setStatus] = useState(null);
  const [checking, setChecking] = useState(false);

  const checkConnection = async () => {
    setChecking(true);
    const result = await testBackendConnection();
    setStatus(result);
    setChecking(false);
  };

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!status) return null;

  return (
    <div className={`connection-status ${status.success ? 'connected' : 'disconnected'}`}>
      <div className="status-content">
        <span className={`status-dot ${status.success ? 'connected' : 'disconnected'}`}></span>
        <span className="status-text">
          {status.success ? '✅ Backend Connected' : '❌ Backend Disconnected'}
        </span>
        <button 
          onClick={checkConnection} 
          className="retry-btn" 
          disabled={checking}
        >
          {checking ? '...' : '↻'}
        </button>
      </div>
      
      {!status.success && (
        <div className="error-details">
          <p>⚠️ {status.error}</p>
          <div className="quick-fixes">
            <h4>Quick fixes:</h4>
            <ol>
              <li>Open terminal and run: <code>cd backend</code></li>
              <li>Run: <code>python app.py</code></li>
              <li>Verify: <code>curl http://localhost:5000/health</code></li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;