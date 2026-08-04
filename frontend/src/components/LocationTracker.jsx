import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MOCK_LOCATION } from '../mockData';

function LocationTracker({ token, activeDevice }) {
  const [location, setLocation] = useState(MOCK_LOCATION);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (activeDevice) {
      axios
        .get(`http://localhost:5000/api/location/${activeDevice._id}`, {
          headers: { authorization: token }
        })
        .then((res) => {
          if (res.data && res.data.length > 0) {
            setLocation(res.data[0]);
          }
        })
        .catch(() => {});
    }
  }, [activeDevice]);

  const handleRefreshGPS = () => {
    setIsUpdating(true);
    setTimeout(() => {
      setLocation({
        ...location,
        timestamp: 'Just now',
        accuracy: (Math.random() * 3 + 2).toFixed(1)
      });
      setIsUpdating(false);
    }, 1000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700 }}>
            GPS Location Tracker ({activeDevice ? activeDevice.name : 'Select Device'})
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Real-time GPS coordinate telemetry and location history log.
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleRefreshGPS} disabled={isUpdating}>
          <i className="fa-solid fa-location-crosshairs"></i> {isUpdating ? 'Pinging GPS...' : 'Ping GPS Position'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {/* Info Card */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(6, 182, 212, 0.15)',
                color: 'var(--accent-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.3rem'
              }}
            >
              <i className="fa-solid fa-map-location-dot"></i>
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem' }}>Current Coordinates</h3>
              <span className="badge badge-online">GPS Lock Active</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Latitude:</span>
              <span style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>{location.latitude}° N</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Longitude:</span>
              <span style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>{location.longitude}° W</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Accuracy:</span>
              <span>Within {location.accuracy} meters</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Estimated Address:</span>
              <span style={{ textAlign: 'right', maxWidth: '180px', fontWeight: 500 }}>{location.address}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Last GPS Ping:</span>
              <span>{location.timestamp}</span>
            </div>
          </div>
        </div>

        {/* Map Preview Visualizer */}
        <div
          className="glass-card"
          style={{
            minHeight: '280px',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {/* Grid pattern lines background */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: 0.15,
              backgroundImage: 'radial-gradient(var(--accent-primary) 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}
          ></div>

          <div style={{ textAlign: 'center', zIndex: 2, padding: '1rem' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(99, 102, 241, 0.2)',
                border: '2px solid var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                animation: 'pulse 2s infinite',
                boxShadow: 'var(--glow-primary)'
              }}
            >
              <i className="fa-solid fa-street-view" style={{ fontSize: '2rem', color: 'var(--accent-primary)' }}></i>
            </div>
            <h4 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>{activeDevice ? activeDevice.name : 'Mobile Phone'}</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {location.latitude}, {location.longitude}
            </p>

            <a
              href={`https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm"
              style={{ marginTop: '1rem' }}
            >
              <i className="fa-solid fa-arrow-up-right-from-square"></i> Open in Google Maps
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LocationTracker;
