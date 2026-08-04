import React, { useState } from 'react';

function ScreenMirror({ activeDevice }) {
  const [isStreaming, setIsStreaming] = useState(true);
  const [lastAction, setLastAction] = useState('Screen stream active (30 FPS)');
  const [currentApp, setCurrentApp] = useState('Home Screen');

  const triggerAction = (actionName) => {
    setLastAction(`Executed remote action: ${actionName}`);
    if (actionName === 'Open Camera') setCurrentApp('Camera Viewfinder');
    if (actionName === 'Open Messages') setCurrentApp('Messages App');
    if (actionName === 'Open Photos') setCurrentApp('Gallery / Photos');
    if (actionName === 'Press Home') setCurrentApp('Home Screen');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700 }}>
            Live Screen Mirror & Remote Stream ({activeDevice ? activeDevice.name : 'Select Device'})
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Real-time screen view display and remote interaction controls.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            className={`btn ${isStreaming ? 'btn-danger' : 'btn-primary'}`}
            onClick={() => {
              setIsStreaming(!isStreaming);
              setLastAction(isStreaming ? 'Stream paused by operator' : 'Stream resumed');
            }}
          >
            <i className={`fa-solid ${isStreaming ? 'fa-pause' : 'fa-play'}`}></i>
            {isStreaming ? 'Pause Stream' : 'Start Live Stream'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'start' }}>
        {/* Mobile Screen Mockup */}
        <div className="phone-frame-container">
          <div className="phone-mockup">
            <div className="phone-notch"></div>
            <div className="phone-screen">
              <div className="phone-topbar">
                <span>11:10 AM</span>
                <span>
                  <i className="fa-solid fa-wifi"></i> 5G <i className="fa-solid fa-battery-full"></i>
                </span>
              </div>

              {/* Dynamic Screen Content */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '1rem' }}>
                {isStreaming ? (
                  <>
                    <div style={{ fontSize: '3rem', color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>
                      {currentApp === 'Home Screen' && <i className="fa-solid fa-shapes"></i>}
                      {currentApp === 'Camera Viewfinder' && <i className="fa-solid fa-camera"></i>}
                      {currentApp === 'Messages App' && <i className="fa-solid fa-comment-dots"></i>}
                      {currentApp === 'Gallery / Photos' && <i className="fa-solid fa-images"></i>}
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'white' }}>{currentApp}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--accent-success)', marginTop: '6px' }}>
                      🔴 LIVE STREAM (1080p WebRTC)
                    </div>
                  </>
                ) : (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    <i className="fa-solid fa-video-slash" style={{ fontSize: '2.5rem', marginBottom: '0.5rem', display: 'block' }}></i>
                    Stream Paused
                  </div>
                )}
              </div>

              {/* Navigation buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-around', padding: '0.5rem 0', color: 'var(--text-muted)' }}>
                <i className="fa-solid fa-chevron-left" style={{ cursor: 'pointer' }} onClick={() => triggerAction('Press Back')}></i>
                <i className="fa-solid fa-circle" style={{ cursor: 'pointer' }} onClick={() => triggerAction('Press Home')}></i>
                <i className="fa-solid fa-square" style={{ cursor: 'pointer' }} onClick={() => triggerAction('Recent Apps')}></i>
              </div>

              <div className="phone-home-bar"></div>
            </div>
          </div>
        </div>

        {/* Control Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>Remote Commands & Actions</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => triggerAction('Open Photos')}>
                <i className="fa-solid fa-images"></i> Open Photos
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => triggerAction('Open Messages')}>
                <i className="fa-solid fa-message"></i> Open Messages
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => triggerAction('Open Camera')}>
                <i className="fa-solid fa-camera"></i> Open Camera
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => triggerAction('Take Remote Snapshot')}>
                <i className="fa-solid fa-expand"></i> Capture Screen
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => triggerAction('Ring Phone Alarm')}>
                <i className="fa-solid fa-bell"></i> Ring Phone
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => triggerAction('Lock Device Screen')}>
                <i className="fa-solid fa-lock"></i> Lock Device
              </button>
            </div>
          </div>

          <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Stream Diagnostics</h3>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div>Resolution: 1080 x 2400 (60 FPS)</div>
              <div>Codec: H.264 / WebRTC</div>
              <div>Latency: 38 ms</div>
              <div style={{ color: 'var(--accent-secondary)', fontWeight: 500, marginTop: '4px' }}>
                Status: {lastAction}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ScreenMirror;
