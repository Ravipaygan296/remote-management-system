import React, { useState } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

function App() {
  const [token, setToken] = useState(localStorage.getItem('omnisync_token') || 'demo_token');

  const handleSetToken = (newToken) => {
    setToken(newToken);
    if (newToken) {
      localStorage.setItem('omnisync_token', newToken);
    } else {
      localStorage.removeItem('omnisync_token');
    }
  };

  return (
    <div>
      {!token ? (
        <Login setToken={handleSetToken} />
      ) : (
        <Dashboard token={token} onLogout={() => handleSetToken(null)} />
      )}
    </div>
  );
}

export default App;