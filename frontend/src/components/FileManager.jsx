import React, { useState, useEffect } from 'react';
import axios from 'axios';

function FileManager({ token, activeDevice }) {
  const [currentPath, setCurrentPath] = useState('/storage/emulated/0');
  const [folders, setFolders] = useState([
    { name: 'DCIM', items: 142, size: '12.4 GB', modified: '2026-08-02' },
    { name: 'Download', items: 38, size: '1.8 GB', modified: '2026-08-03' },
    { name: 'Documents', items: 19, size: '420 MB', modified: '2026-07-28' },
    { name: 'Pictures', items: 85, size: '4.2 GB', modified: '2026-08-01' },
    { name: 'WhatsApp', items: 310, size: '8.1 GB', modified: '2026-08-03' },
    { name: 'Music', items: 54, size: '650 MB', modified: '2026-07-15' }
  ]);
  const [files, setFiles] = useState([
    { name: 'device_log_2026.txt', type: 'text/plain', size: '45 KB', modified: '2026-08-03' },
    { name: 'backup_config.json', type: 'application/json', size: '12 KB', modified: '2026-08-02' },
    { name: 'employment_contract.pdf', type: 'application/pdf', size: '2.1 MB', modified: '2026-07-20' },
    { name: 'voice_note_104.m4a', type: 'audio/m4a', size: '5.8 MB', modified: '2026-08-01' }
  ]);

  useEffect(() => {
    if (activeDevice) {
      axios
        .get(`http://localhost:5000/api/files/${activeDevice._id}`, {
          headers: { authorization: token }
        })
        .then((res) => {
          if (res.data) {
            setFolders(res.data.folders);
            setFiles(res.data.files);
          }
        })
        .catch(() => {});
    }
  }, [activeDevice]);

  const openFolder = (folderName) => {
    setCurrentPath(`${currentPath}/${folderName}`);
  };

  const goUp = () => {
    const parts = currentPath.split('/');
    if (parts.length > 3) {
      parts.pop();
      setCurrentPath(parts.join('/'));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 700 }}>
          Remote Device File Explorer ({activeDevice ? activeDevice.name : 'Select Device'})
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Browse internal storage folders, documents, audio clips, and downloads.
        </p>
      </div>

      {/* Path Bar */}
      <div className="glass-card" style={{ padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button className="btn btn-secondary btn-sm" onClick={goUp} disabled={currentPath === '/storage/emulated/0'}>
          <i className="fa-solid fa-arrow-up"></i> Up Level
        </button>
        <div style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: 'var(--accent-primary)', flex: 1, overflowX: 'auto' }}>
          <i className="fa-solid fa-folder-open" style={{ marginRight: '6px' }}></i> {currentPath}
        </div>
      </div>

      {/* Folders & Files Grid */}
      <div className="grid-cards">
        {folders.map((f, i) => (
          <div
            key={i}
            className="glass-card"
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem' }}
            onClick={() => openFolder(f.name)}
          >
            <div style={{ fontSize: '2rem', color: 'var(--accent-warning)' }}>
              <i className="fa-solid fa-folder"></i>
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{f.name}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {f.items} items • {f.size}
              </div>
            </div>
          </div>
        ))}

        {files.map((file, i) => (
          <div key={i} className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontSize: '2rem', color: 'var(--accent-secondary)' }}>
              {file.name.endsWith('.pdf') ? (
                <i className="fa-solid fa-file-pdf" style={{ color: 'var(--accent-danger)' }}></i>
              ) : file.name.endsWith('.txt') || file.name.endsWith('.json') ? (
                <i className="fa-solid fa-file-code" style={{ color: 'var(--accent-primary)' }}></i>
              ) : (
                <i className="fa-solid fa-file-lines"></i>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {file.name}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {file.size} • {file.modified}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FileManager;
