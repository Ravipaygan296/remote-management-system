import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

function Devices({ token, activeDevice, setActiveDevice, devices, setDevices }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDeviceName, setNewDeviceName] = useState('');
  const [newModel, setNewModel] = useState('SM-S928B');
  const [pairingCode, setPairingCode] = useState('');

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/devices`, {
        headers: { authorization: token }
      });
      if (res.data && res.data.length > 0) {
        setDevices(res.data);
        if (!activeDevice) setActiveDevice(res.data[0]);
      }
    } catch (err) {
      console.warn('Backend unavailable, using default device list:', err.message);
    }
  };

  const handleAddDevice = async (e) => {
    e.preventDefault();
    if (!newDeviceName) return;

    const generatedPin = Math.floor(100000 + Math.random() * 900000).toString();
    setPairingCode(generatedPin);

    const newDev = {
      _id: 'dev_' + Date.now(),
      name: newDeviceName,
      modelName: newModel,
      osVersion: 'Android 14 (One UI 6.1)',
      status: 'online',
      batteryLevel: 95,
      isCharging: false,
      storageUsed: 38.4,
      storageTotal: 256,
      networkType: '5G Cellular',
      ipAddress: '192.168.1.105',
      lastSeen: 'Just now'
    };

    try {
      await axios.post(`${API_BASE_URL}/api/devices`, newDev, {
        headers: { authorization: token }
      });
    } catch (err) {
      console.warn('Saved device locally:', err.message);
    }

    setDevices([newDev, ...devices]);
    setActiveDevice(newDev);
    setNewDeviceName('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700 }}>Registered Mobile Devices</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Manage target phones connected via mobile background agent or WiFi telemetry
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <i className="fa-solid fa-plus"></i> Register New Phone
        </button>
      </div>

      <div className="grid-cards">
        {devices.map((dev) => {
          const isSelected = activeDevice && activeDevice._id === dev._id;
          const storagePercent = Math.round((dev.storageUsed / dev.storageTotal) * 100);

          return (
            <div
              key={dev._id}
              className={`device-card ${isSelected ? 'selected' : ''}`}
              onClick={() => setActiveDevice(dev)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'white', marginBottom: '2px' }}>{dev.name}</h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{dev.modelName} • {dev.osVersion}</div>
                </div>
                <span className={`badge ${dev.status === 'online' ? 'badge-online' : 'badge-offline'}`}>
                  {dev.status}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Battery Status:</span>
                  <span style={{ fontWeight: 600, color: dev.batteryLevel > 20 ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
                    <i className="fa-solid fa-battery-three-quarters" style={{ marginRight: '4px' }}></i>
                    {dev.batteryLevel}% {dev.isCharging && '(Charging)'}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span>Storage ({dev.storageUsed} GB / {dev.storageTotal} GB)</span>
                    <span>{storagePercent}%</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${storagePercent}%`,
                        background: storagePercent > 85 ? 'var(--accent-warning)' : 'var(--gradient-primary)'
                      }}
                    ></div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <span>Network: <strong style={{ color: 'white' }}>{dev.networkType}</strong></span>
                  <span>IP: <strong style={{ color: 'white' }}>{dev.ipAddress}</strong></span>
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
                  Last sync: {dev.lastSeen}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.25rem' }}>Pair New Target Mobile Phone</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowAddModal(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleAddDevice} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="form-label">DEVICE NAME / ALIAS</label>
                <input
                  type="text"
                  className="form-control"
                  value={newDeviceName}
                  onChange={(e) => setNewDeviceName(e.target.value)}
                  placeholder="e.g. Personal Samsung Galaxy S24"
                  required
                />
              </div>

              <div>
                <label className="form-label">MODEL NAME</label>
                <input
                  type="text"
                  className="form-control"
                  value={newModel}
                  onChange={(e) => setNewModel(e.target.value)}
                  placeholder="e.g. SM-S928B or iPhone 15 Pro"
                />
              </div>

              {pairingCode && (
                <div style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid var(--accent-primary)', padding: '1rem', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>PAIRING PIN CODE FOR MOBILE AGENT:</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '4px', color: 'var(--accent-primary)', marginTop: '4px' }}>
                    {pairingCode}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Enter this PIN on your Android background agent app to link telemetry.
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Generate Pairing Key</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Devices;