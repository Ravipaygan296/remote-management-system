import React, { useState } from 'react';

function PhoneCloneView({ activeDevice }) {
  const [currentApp, setCurrentApp] = useState('Home');
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [streamActive, setStreamActive] = useState(true);
  const [lastAction, setLastAction] = useState('Connected — 60 FPS WebRTC Stream');
  const [volumeLevel, setVolumeLevel] = useState(80);

  const apps = [
    { id: 'Gallery', name: 'Photos & Videos', icon: 'fa-solid fa-images', color: '#6366f1' },
    { id: 'SMS', name: 'Messages & SMS', icon: 'fa-solid fa-comments', color: '#10b981' },
    { id: 'WhatsApp', name: 'WhatsApp', icon: 'fa-brands fa-whatsapp', color: '#25d366' },
    { id: 'Calls', name: 'Call History', icon: 'fa-solid fa-phone-volume', color: '#06b6d4' },
    { id: 'Contacts', name: 'Contacts', icon: 'fa-solid fa-address-book', color: '#f59e0b' },
    { id: 'GPS', name: 'GPS Location', icon: 'fa-solid fa-location-dot', color: '#ef4444' },
    { id: 'Files', name: 'File Explorer', icon: 'fa-solid fa-folder-open', color: '#8b5cf6' },
    { id: 'Camera', name: 'Camera Captures', icon: 'fa-solid fa-camera', color: '#ec4899' },
    { id: 'Settings', name: 'Device Settings', icon: 'fa-solid fa-gear', color: '#64748b' }
  ];

  const handleAppClick = (appId) => {
    setCurrentApp(appId);
    setLastAction(`Launched remote app: ${appId}`);
  };

  const handleNavClick = (action) => {
    if (action === 'Home') setCurrentApp('Home');
    if (action === 'Back') setCurrentApp('Home');
    setLastAction(`Remote button pressed: ${action}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700 }}>
            1:1 Phone Clone Mirror ({activeDevice ? activeDevice.name : 'Select Device'})
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Interactive real-time replica of the mobile screen. Click any app or button to interact with the device.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            className={`btn ${streamActive ? 'btn-danger' : 'btn-primary'}`}
            onClick={() => {
              setStreamActive(!streamActive);
              setLastAction(streamActive ? 'Stream paused by operator' : 'Stream resumed');
            }}
          >
            <i className={`fa-solid ${streamActive ? 'fa-pause' : 'fa-play'}`}></i>
            {streamActive ? 'Pause Clone Stream' : 'Resume Clone Stream'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2.5rem', alignItems: 'start' }}>
        {/* Interactive 1:1 Phone Replica */}
        <div className="phone-frame-container">
          <div className="phone-mockup" style={{ width: '340px', height: '680px', borderRadius: '44px' }}>
            <div className="phone-notch" style={{ cursor: 'pointer' }} onClick={() => setNotificationOpen(!notificationOpen)}></div>

            <div className="phone-screen" style={{ padding: 0, position: 'relative' }}>
              {/* Status Bar */}
              <div
                className="phone-topbar"
                style={{
                  padding: '0.5rem 1.25rem 0.25rem',
                  background: 'rgba(0,0,0,0.6)',
                  cursor: 'pointer',
                  zIndex: 20
                }}
                onClick={() => setNotificationOpen(!notificationOpen)}
              >
                <span style={{ fontWeight: 600 }}>12:51 PM</span>
                <span style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <i className="fa-solid fa-bell-slash" style={{ fontSize: '0.7rem' }}></i>
                  <i className="fa-solid fa-wifi"></i> 5G
                  <i className="fa-solid fa-battery-three-quarters" style={{ color: 'var(--accent-success)' }}></i> 88%
                </span>
              </div>

              {/* Notification Shade Pull-down */}
              {notificationOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '32px',
                    left: 0,
                    right: 0,
                    background: 'rgba(15, 23, 42, 0.95)',
                    backdropFilter: 'blur(16px)',
                    zIndex: 50,
                    padding: '1rem',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    animation: 'fadeIn 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span>NOTIFICATIONS (3)</span>
                    <span style={{ cursor: 'pointer', color: 'var(--accent-primary)' }} onClick={() => setNotificationOpen(false)}>
                      Close Shade ▲
                    </span>
                  </div>

                  <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem' }}>
                    <div style={{ fontWeight: 600, color: '#25d366' }}>
                      <i className="fa-brands fa-whatsapp"></i> WhatsApp • Sarah Jenkins
                    </div>
                    <div style={{ color: 'var(--text-muted)', marginTop: '2px' }}>
                      "Awesome, can you check the device photos from yesterday?"
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>
                      <i className="fa-solid fa-comment-dots"></i> SMS Alert • Bank OTP
                    </div>
                    <div style={{ color: 'var(--text-muted)', marginTop: '2px' }}>
                      Your verification code for Login is 849201.
                    </div>
                  </div>
                </div>
              )}

              {/* Active Screen Content */}
              <div style={{ flex: 1, padding: '1rem', overflowY: 'auto' }}>
                {!streamActive ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                    <i className="fa-solid fa-video-slash" style={{ fontSize: '3rem', marginBottom: '1rem' }}></i>
                    <div>Clone Stream Paused</div>
                  </div>
                ) : currentApp === 'Home' ? (
                  /* App Grid Launcher */
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', paddingTop: '1rem' }}>
                    {apps.map((app) => (
                      <div
                        key={app.id}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '0.5rem',
                          cursor: 'pointer',
                          transition: 'transform 0.15s ease'
                        }}
                        onClick={() => handleAppClick(app.id)}
                      >
                        <div
                          style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '16px',
                            background: app.color,
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.5rem',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
                          }}
                        >
                          <i className={app.icon}></i>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'white', textAlign: 'center', fontWeight: 500 }}>
                          {app.name}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Simulated Open App Screen */
                  <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'white' }}>{currentApp} App</span>
                      <button className="btn btn-secondary btn-sm" onClick={() => setCurrentApp('Home')}>
                        <i className="fa-solid fa-xmark"></i>
                      </button>
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                      <i className={apps.find((a) => a.id === currentApp)?.icon || 'fa-solid fa-mobile'} style={{ fontSize: '3rem', color: 'var(--accent-primary)', marginBottom: '0.75rem' }}></i>
                      <div style={{ fontWeight: 600, color: 'white' }}>Active {currentApp} View</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Simulating 1:1 touch stream input
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Navigation Bar */}
              <div
                style={{
                  display: 'flex',
                  justify: 'space-around',
                  padding: '0.6rem 0',
                  background: 'rgba(0,0,0,0.7)',
                  color: 'var(--text-muted)'
                }}
              >
                <i className="fa-solid fa-chevron-left" style={{ cursor: 'pointer' }} onClick={() => handleNavClick('Back')}></i>
                <i className="fa-solid fa-circle" style={{ cursor: 'pointer' }} onClick={() => handleNavClick('Home')}></i>
                <i className="fa-solid fa-square" style={{ cursor: 'pointer' }} onClick={() => handleNavClick('Recent Apps')}></i>
              </div>

              <div className="phone-home-bar" style={{ marginBottom: '4px' }}></div>
            </div>
          </div>
        </div>

        {/* Remote Control & Telemetry Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.85rem' }}>Remote Phone Control Shortcuts</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => handleNavClick('Home')}>
                <i className="fa-solid fa-house"></i> Home Screen
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => setNotificationOpen(!notificationOpen)}>
                <i className="fa-solid fa-bell"></i> Pull Notifications
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => setLastAction('Screen snapshot captured')}>
                <i className="fa-solid fa-camera"></i> Screen Capture
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => setLastAction('Phone alarm triggered')}>
                <i className="fa-solid fa-volume-high"></i> Ring Phone Alarm
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => setLastAction('Screen locked remotely')}>
                <i className="fa-solid fa-lock"></i> Lock Screen
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => setLastAction('Device restarted remotely')}>
                <i className="fa-solid fa-power-off"></i> Restart Phone
              </button>
            </div>
          </div>

          <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Volume & Ring Control</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
              <i className="fa-solid fa-volume-low" style={{ color: 'var(--text-muted)' }}></i>
              <input
                type="range"
                min="0"
                max="100"
                value={volumeLevel}
                onChange={(e) => setVolumeLevel(e.target.value)}
                style={{ flex: 1, accentColor: 'var(--accent-primary)' }}
              />
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{volumeLevel}%</span>
            </div>
          </div>

          <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Live Stream Diagnostics</h3>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div>Resolution: 1080 x 2400 (60 FPS)</div>
              <div>Codec: WebRTC H.264 High Profile</div>
              <div>Stream Latency: 24 ms</div>
              <div style={{ color: 'var(--accent-success)', fontWeight: 500, marginTop: '4px' }}>
                Status: {lastAction}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PhoneCloneView;
