import React, { useState } from 'react';
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

import { MOCK_DEVICES } from '../mockData';

function Dashboard({ token, onLogout }) {
  const [activeTab, setActiveTab] = useState('clone');
  const [devices, setDevices] = useState(MOCK_DEVICES);
  const [activeDevice, setActiveDevice] = useState(MOCK_DEVICES[0]);

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
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Remote Device Management & Phone Clone Portal</div>
          </div>
        </div>

        <div className="user-controls">
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Logged in as <strong style={{ color: 'white' }}>Admin Operator</strong>
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
          <button
            className={`nav-tab ${activeTab === 'clone' ? 'active' : ''}`}
            onClick={() => setActiveTab('clone')}
          >
            <i className="fa-solid fa-mobile"></i> 1:1 Phone Clone
          </button>
          <button
            className={`nav-tab ${activeTab === 'devices' ? 'active' : ''}`}
            onClick={() => setActiveTab('devices')}
          >
            <i className="fa-solid fa-mobile-screen"></i> Devices Overview
          </button>
          <button
            className={`nav-tab ${activeTab === 'media' ? 'active' : ''}`}
            onClick={() => setActiveTab('media')}
          >
            <i className="fa-solid fa-images"></i> Photos & Videos
          </button>
          <button
            className={`nav-tab ${activeTab === 'messages' ? 'active' : ''}`}
            onClick={() => setActiveTab('messages')}
          >
            <i className="fa-solid fa-comments"></i> SMS & Messages
          </button>
          <button
            className={`nav-tab ${activeTab === 'calls' ? 'active' : ''}`}
            onClick={() => setActiveTab('calls')}
          >
            <i className="fa-solid fa-phone-volume"></i> Call Logs
          </button>
          <button
            className={`nav-tab ${activeTab === 'contacts' ? 'active' : ''}`}
            onClick={() => setActiveTab('contacts')}
          >
            <i className="fa-solid fa-address-book"></i> Contacts
          </button>
          <button
            className={`nav-tab ${activeTab === 'screen' ? 'active' : ''}`}
            onClick={() => setActiveTab('screen')}
          >
            <i className="fa-solid fa-display"></i> Live Stream Mirror
          </button>
          <button
            className={`nav-tab ${activeTab === 'location' ? 'active' : ''}`}
            onClick={() => setActiveTab('location')}
          >
            <i className="fa-solid fa-location-dot"></i> GPS Location
          </button>
          <button
            className={`nav-tab ${activeTab === 'files' ? 'active' : ''}`}
            onClick={() => setActiveTab('files')}
          >
            <i className="fa-solid fa-folder-open"></i> File Manager
          </button>
          <button
            className={`nav-tab ${activeTab === 'guide' ? 'active' : ''}`}
            onClick={() => setActiveTab('guide')}
          >
            <i className="fa-solid fa-circle-info"></i> Setup Guide
          </button>
        </nav>

        <main className="main-content">
          {activeTab === 'clone' && (
            <PhoneCloneView activeDevice={activeDevice} />
          )}
          {activeTab === 'devices' && (
            <Devices
              token={token}
              activeDevice={activeDevice}
              setActiveDevice={setActiveDevice}
              devices={devices}
              setDevices={setDevices}
            />
          )}
          {activeTab === 'media' && (
            <MediaViewer token={token} activeDevice={activeDevice} />
          )}
          {activeTab === 'messages' && (
            <MessagesViewer token={token} activeDevice={activeDevice} />
          )}
          {activeTab === 'calls' && (
            <CallLogsViewer token={token} activeDevice={activeDevice} />
          )}
          {activeTab === 'contacts' && (
            <ContactsViewer token={token} activeDevice={activeDevice} />
          )}
          {activeTab === 'screen' && (
            <ScreenMirror activeDevice={activeDevice} />
          )}
          {activeTab === 'location' && (
            <LocationTracker token={token} activeDevice={activeDevice} />
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