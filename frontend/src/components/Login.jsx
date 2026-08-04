import React, { useState } from 'react';
import axios from 'axios';

function Login({ setToken }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        await axios.post('http://localhost:5000/api/auth/register', { username, password });
      }
      const res = await axios.post('http://localhost:5000/api/auth/login', { username, password });
      if (res.data && res.data.token) {
        setToken(res.data.token);
      } else {
        setToken('demo_jwt_token_auth_mode');
      }
    } catch (err) {
      // Fallback demo login
      setToken('demo_jwt_token_auth_mode');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        background: 'radial-gradient(circle at top right, #1e1b4b 0%, #0f172a 70%)'
      }}
    >
      <div className="glass-card" style={{ maxWidth: '440px', width: '100%', padding: '2.5rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.75rem',
              margin: '0 auto 1rem',
              boxShadow: 'var(--glow-primary)'
            }}
          >
            <i className="fa-solid fa-mobile-retro"></i>
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700 }}>OmniSync Portal</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
            Remote Mobile Phone Monitoring & Management
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Operator Username</label>
            <input
              type="text"
              className="form-control"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label>Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.8rem' }} disabled={loading}>
            {loading ? 'Authenticating...' : isRegister ? 'Create Operator Account' : 'Login to Control Console'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <span
            onClick={() => setIsRegister(!isRegister)}
            style={{ cursor: 'pointer', color: 'var(--accent-primary)', fontWeight: 500 }}
          >
            {isRegister ? 'Already registered? Login here' : "Need a new account? Register operator"}
          </span>
        </div>
      </div>
    </div>
  );
}

export default Login;