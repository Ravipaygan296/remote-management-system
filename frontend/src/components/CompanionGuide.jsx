import React, { useState } from 'react';

function CompanionGuide() {
  const [cloudUrl, setCloudUrl] = useState('http://localhost:5000');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(cloudUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 700 }}>Mobile Companion Agent & Cloud Setup</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Configure 1-time background service synchronization for 4G/5G remote management without annoying popups.
        </p>
      </div>

      {/* Cloud URL Configuration */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 style={{ color: 'var(--accent-primary)', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <i className="fa-solid fa-globe"></i> Server Connection URL
        </h3>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          Enter your public cloud server endpoint (Render, Railway, or Cloudflare Tunnel) below to allow background telemetry sync over 4G/5G mobile data from anywhere in the world.
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <input
            type="text"
            className="form-control"
            value={cloudUrl}
            onChange={(e) => setCloudUrl(e.target.value)}
            placeholder="e.g. https://your-server.onrender.com or http://192.168.1.105:5000"
          />
          <button className="btn btn-secondary" onClick={handleCopy}>
            <i className="fa-solid fa-copy"></i> {copied ? 'Copied!' : 'Copy URL'}
          </button>
        </div>
      </div>

      {/* Smooth Background Architecture Explanation */}
      <div className="grid-cards">
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ fontSize: '1.5rem', color: 'var(--accent-success)' }}>
            <i className="fa-solid fa-bell-slash"></i>
          </div>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Zero Popup Distractions</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Runs as a standard Android <strong>Foreground Service</strong> with a quiet status-bar icon. It never throws popups, alerts, or toast banners while you use your phone.
          </p>
        </div>

        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ fontSize: '1.5rem', color: 'var(--accent-secondary)' }}>
            <i className="fa-solid fa-key"></i>
          </div>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 600 }}>1-Time Token Pairing</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Stores pairing tokens locally in <code>SharedPreferences</code> on first run. The phone remembers the connection forever without prompting for PIN codes again.
          </p>
        </div>

        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ fontSize: '1.5rem', color: 'var(--accent-primary)' }}>
            <i className="fa-solid fa-rotate"></i>
          </div>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Auto-Start on Boot</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Listens for Android system <code>BOOT_COMPLETED</code>. Whenever the phone reboots or powers on, the sync service starts automatically in the background.
          </p>
        </div>
      </div>
    </div>
  );
}

export default CompanionGuide;
