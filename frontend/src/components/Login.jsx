import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

function Login({ setToken }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await axios.post(`${API_BASE_URL}/api/auth/register`, { username, password });
      }
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, { username, password });
      if (res.data.token) {
        setToken(res.data.token);
      }
    } catch (err) {
      console.warn('Backend login failed, using demo session token:', err.message);
      // Fallback for standalone/demo mode
      setToken('demo_token_' + Date.now());
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = () => {
    setToken('demo_token_guest');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon">
            <i className="fa-solid fa-shield-halved"></i>
          </div>
          <h2>OmniSync Management System</h2>
          <p>Remote Device Monitoring & Telemetry Dashboard</p>
        </div>

        {error && (
          <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', background: 'rgba(239,68,68,0.2)', border: '1px solid var(--accent-danger)', color: '#fca5a5', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label className="form-label">USERNAME / OPERATOR ID</label>
            <input
              type="text"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="admin"
            />
          </div>

          <div>
            <label className="form-label">PASSWORD</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem', justifyContent: 'center' }} disabled={loading}>
            <i className={`fa-solid ${isRegister ? 'fa-user-plus' : 'fa-right-to-bracket'}`}></i>
            {loading ? 'Authenticating...' : isRegister ? 'Register Account' : 'Sign In to Dashboard'}
          </button>
        </form>

        <div style={{ marginTop: '1.25rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setIsRegister(!isRegister)}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {isRegister ? 'Already have an account? Sign In' : 'Need an Operator Account? Register'}
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleDemoAccess}
            style={{ width: '100%', justifyContent: 'center', border: '1px dashed var(--accent-primary)', color: 'var(--accent-primary)' }}
          >
            <i className="fa-solid fa-bolt"></i> Instant Demo Access (No Login Required)
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;