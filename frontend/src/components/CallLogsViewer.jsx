import React, { useState, useEffect } from 'react';
import { MOCK_CALL_LOGS } from '../mockData';

function CallLogsViewer({ token, activeDevice, liveCallLogs }) {
  const [callLogs, setCallLogs] = useState(MOCK_CALL_LOGS);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    if (liveCallLogs && liveCallLogs.length > 0) {
      const formatted = liveCallLogs.map((log, idx) => ({
        _id: log.id || `call_${idx}`,
        contactName: log.name || 'Unknown',
        phoneNumber: log.number || 'Private',
        type: (log.type || 'incoming').toLowerCase(),
        duration: log.duration || '0 sec',
        timestamp: new Date(log.date || Date.now()).toLocaleString()
      }));
      setCallLogs(formatted);
    }
  }, [liveCallLogs]);

  const filteredLogs = callLogs.filter((log) => {
    if (filterType === 'all') return true;
    return log.type.toLowerCase().includes(filterType.toLowerCase());
  });

  const getCallBadge = (type) => {
    const lower = type.toLowerCase();
    if (lower.includes('in')) {
      return (
        <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-success)' }}>
          <i className="fa-solid fa-phone-incoming"></i> Incoming
        </span>
      );
    } else if (lower.includes('out')) {
      return (
        <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-primary)' }}>
          <i className="fa-solid fa-phone-outgoing"></i> Outgoing
        </span>
      );
    } else {
      return (
        <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--accent-danger)' }}>
          <i className="fa-solid fa-phone-slash"></i> Missed Call
        </span>
      );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700 }}>
            Call History & Logs ({activeDevice ? activeDevice.name : 'Select Device'})
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Inspect call logs including incoming calls, dialed numbers, missed calls, and call durations.
          </p>
        </div>
        {liveCallLogs && liveCallLogs.length > 0 && (
          <span className="badge badge-online">
            🟢 Live Extracted Call History ({liveCallLogs.length} logs)
          </span>
        )}
      </div>

      <div className="glass-card" style={{ padding: '0.75rem 1.25rem', display: 'flex', gap: '0.75rem' }}>
        <button
          className={`btn btn-sm ${filterType === 'all' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setFilterType('all')}
        >
          All Calls ({callLogs.length})
        </button>
        <button
          className={`btn btn-sm ${filterType === 'incoming' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setFilterType('incoming')}
        >
          Incoming
        </button>
        <button
          className={`btn btn-sm ${filterType === 'outgoing' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setFilterType('outgoing')}
        >
          Outgoing
        </button>
        <button
          className={`btn btn-sm ${filterType === 'missed' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setFilterType('missed')}
        >
          Missed
        </button>
      </div>

      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Contact / Name</th>
              <th>Phone Number</th>
              <th>Call Type</th>
              <th>Duration</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log) => (
              <tr key={log._id}>
                <td style={{ fontWeight: 600 }}>{log.contactName}</td>
                <td style={{ color: 'var(--accent-secondary)' }}>{log.phoneNumber}</td>
                <td>{getCallBadge(log.type)}</td>
                <td style={{ color: 'var(--text-muted)' }}>{log.duration}</td>
                <td style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>{log.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CallLogsViewer;
