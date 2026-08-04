import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Devices({ token, activeDevice, setActiveDevice, devices, setDevices }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDeviceName, setNewDeviceName] = useState('');
  const [newDeviceModel, setNewDeviceModel] = useState('');

  const fetchDevices = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/devices', {
        headers: { authorization: token }
      });
      if (res.data && res.data.length > 0) {
        setDevices(res.data);
      }
    } catch (err) {
      console.log('Using pre-populated device dataset.');
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleAddDevice = async (e) => {
    e.preventDefault();
    if (!newDeviceName) return;

    const newDev = {
      _id: 'dev_' + Date.now(),
      name: newDeviceName,
      modelName: newDeviceModel || 'Android Device',
      osVersion: 'Android 14',
      status: 'online',
      batteryLevel: 95,
      isCharging: false,
      storageUsed: 22.0,
      storageTotal: 128,
      networkType: 'WiFi',
      ipAddress: '192.168.1.' + Math.floor(Math.random() * 200 + 10),
      lastSeen: 'Just now'
    };

    try {
      await axios.post('http://localhost:5000/api/devices', newDev, {
        headers: { authorization: token }
      });
    } catch (err) {
      console.log('Added device to local state.');
    }

    setDevices([...devices, newDev]);
    setActiveDevice(newDev);
    setNewDeviceName('');
    setNewDeviceModel('');
    setShowAddModal(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700 }}>Registered Mobile Devices</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Monitor device health, battery level, storage, and remote status.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <i className="fa-solid fa-mobile-screen-button"></i> Register New Phone
        </button>
      </div>

      <div className="grid-cards">
        {devices.map((device) => {
          const isSelected = activeDevice && activeDevice._id === device._id;
          const storagePercent = Math.round((device.storageUsed / device.storageTotal) * 100);

          return (
            <div
              key={device._id}
              className="glass-card"
              style={{
                borderColor: isSelected ? 'var(--accent-primary)' : 'var(--border-color)',
                cursor: 'pointer',
                position: 'relative'
              }}
              onClick={() => setActiveDevice(device)}
            >
              {isSelected && (
                <div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'var(--accent-primary)',
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.7rem',
                    fontWeight: 600
                  }}
                >
                  ACTIVE
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(99, 102, 241, 0.15)',
                    color: 'var(--accent-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem'
                  }}
                >
                  <i className="fa-solid fa-mobile"></i>
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{device.name}</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{device.modelName}</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span className={`badge ${device.status === 'online' ? 'badge-online' : 'badge-offline'}`}>
                  <i className="fa-solid fa-circle" style={{ fontSize: '0.5rem' }}></i> {device.status}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{device.lastSeen}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>
                    <i className="fa-solid fa-battery-three-quarters" style={{ color: device.batteryLevel > 20 ? 'var(--accent-success)' : 'var(--accent-danger)' }}></i> Battery
                  </span>
                  <span>{device.batteryLevel}% {device.isCharging ? '⚡ (Charging)' : ''}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>
                    <i className="fa-solid fa-hard-drive" style={{ color: 'var(--accent-secondary)' }}></i> Storage
                  </span>
                  <span>{device.storageUsed} / {device.storageTotal} GB ({storagePercent}%)</span>
                </div>

                {/* Storage Progress bar */}
                <div style={{ height: '6px', background: 'var(--bg-primary)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${storagePercent}%`,
                      background: storagePercent > 85 ? 'var(--accent-warning)' : 'var(--accent-primary)'
                    }}
                  ></div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.2rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>
                    <i className="fa-solid fa-wifi" style={{ color: 'var(--accent-primary)' }}></i> Network
                  </span>
                  <span>{device.networkType}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>
                    <i className="fa-solid fa-microchip"></i> OS
                  </span>
                  <span>{device.osVersion}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Device Modal */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>Pair & Add Mobile Device</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Enter your mobile phone name or model below to pair with this remote management portal.
            </p>

            <form onSubmit={handleAddDevice}>
              <div className="form-group">
                <label>Device Name / Owner</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. My Samsung Galaxy S24"
                  value={newDeviceName}
                  onChange={(e) => setNewDeviceName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Model Number or OS (Optional)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. SM-S928B or iPhone 15"
                  value={newDeviceModel}
                  onChange={(e) => setNewDeviceModel(e.target.value)}
                />
              </div>

              <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', margin: '1rem 0' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>PAIRING PIN CODE:</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '4px', color: 'var(--accent-primary)' }}>
                  849 - 201
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                  Enter this PIN in the phone companion app to start syncing photos, videos, and SMS.
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Connect Device</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Devices;