import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MOCK_CALL_LOGS } from '../mockData';

function CallLogsViewer({ token, activeDevice }) {
  const [callLogs, setCallLogs] = useState(MOCK_CALL_LOGS);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    if (activeDevice) {
      axios
        .get(`http://localhost:5000/api/calllogs/${activeDevice._id}`, {
          headers: { authorization: token }
        })
        .then((res) => {
          if (res.data && res.data.length > 0) {
            setCallLogs(res.data);
          }
        })
        .catch(() => {});
    }
  }, [activeDevice]);

  const filteredLogs = callLogs.filter((log) => {
    if (filterType === 'all') return true;
    return log.type === filterType;
  });

  const getCallBadge = (type) => {
    switch (type) {
      case 'incoming':
        return (
          <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-success)' }}>
            <i className="fa-solid fa-phone-incoming"></i> Incoming
          </span>
        );
      case 'outgoing':
        return (
          <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-primary)' }}>
            <i className="fa-solid fa-phone-outgoing"></i> Outgoing
          </span>
        );
      case 'missed':
        return (
          <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--accent-danger)' }}>
            <i className="fa-solid fa-phone-slash"></i> Missed Call
          </span>
        );
      case 'rejected':
        return (
          <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-warning)' }}>
            <i className="fa-solid fa-phone-xmark"></i> Rejected
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 700 }}>
          Call History & Logs ({activeDevice ? activeDevice.name : 'Select Device'})
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Inspect call logs including incoming calls, dialed numbers, missed calls, and call durations.
        </p>
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
