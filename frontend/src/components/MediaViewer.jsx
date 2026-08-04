import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MOCK_MEDIA } from '../mockData';

function MediaViewer({ token, activeDevice }) {
  const [mediaItems, setMediaItems] = useState(MOCK_MEDIA);
  const [filterType, setFilterType] = useState('all'); // all, photo, video
  const [categoryFilter, setCategoryFilter] = useState('all'); // all, Camera, Screenshots, WhatsApp
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (activeDevice) {
      axios
        .get(`http://localhost:5000/api/media/${activeDevice._id}`, { headers: { authorization: token } })
        .then((res) => {
          if (res.data && res.data.length > 0) {
            setMediaItems(res.data);
          }
        })
        .catch(() => {
          // Keep mock media as fallback
        });
    }
  }, [activeDevice]);

  const filtered = mediaItems.filter((item) => {
    if (filterType !== 'all' && item.type !== filterType) return false;
    if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
    return true;
  });

  const handleSimulateSync = () => {
    setIsUploading(true);
    setTimeout(() => {
      const newPhoto = {
        _id: 'm_' + Date.now(),
        filename: `REMOTE_SNAP_${Math.floor(Math.random() * 8999 + 1000)}.jpg`,
        url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
        type: 'photo',
        category: 'Camera',
        size: '3.4 MB',
        date: 'Just synced'
      };
      setMediaItems([newPhoto, ...mediaItems]);
      setIsUploading(false);
    }, 1200);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700 }}>
            Device Media Explorer ({activeDevice ? activeDevice.name : 'Select Device'})
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Remotely browse all photos, camera captures, WhatsApp media, and videos stored on this device.
          </p>
        </div>
        <button className="btn btn-secondary" onClick={handleSimulateSync} disabled={isUploading}>
          <i className="fa-solid fa-arrows-rotate"></i> {isUploading ? 'Syncing Device...' : 'Trigger Remote Camera Sync'}
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="glass-card" style={{ padding: '0.75rem 1.25rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className={`btn btn-sm ${filterType === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterType('all')}
          >
            All Media
          </button>
          <button
            className={`btn btn-sm ${filterType === 'photo' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterType('photo')}
          >
            <i className="fa-solid fa-image"></i> Photos
          </button>
          <button
            className={`btn btn-sm ${filterType === 'video' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterType('video')}
          >
            <i className="fa-solid fa-video"></i> Videos
          </button>
        </div>

        <div style={{ width: '1px', height: '24px', background: 'var(--border-color)' }}></div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Folder:</span>
          <select
            className="device-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Albums (DCIM, Screenshots, WhatsApp)</option>
            <option value="Camera">Camera (DCIM)</option>
            <option value="Screenshots">Screenshots</option>
            <option value="WhatsApp">WhatsApp Media</option>
          </select>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="grid-gallery">
        {filtered.map((item) => (
          <div key={item._id} className="media-card" onClick={() => setSelectedMedia(item)}>
            {item.type === 'photo' ? (
              <img src={item.url} alt={item.filename} loading="lazy" />
            ) : (
              <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                <video src={item.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: 'rgba(0,0,0,0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '1.2rem'
                  }}
                >
                  <i className="fa-solid fa-play"></i>
                </div>
              </div>
            )}

            <div className="media-card-overlay">
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>
                {item.filename}
              </span>
              <span>{item.size}</span>
            </div>
          </div>
        ))}
      </div>

      {/* High-res Lightbox Modal */}
      {selectedMedia && (
        <div className="modal-backdrop" onClick={() => setSelectedMedia(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '850px', background: '#090d16' }}>
            <button className="modal-close" onClick={() => setSelectedMedia(null)}>×</button>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
              {selectedMedia.type === 'photo' ? (
                <img
                  src={selectedMedia.url}
                  alt={selectedMedia.filename}
                  style={{ maxWidth: '100%', maxHeight: '60vh', borderRadius: 'var(--radius-md)', objectFit: 'contain' }}
                />
              ) : (
                <video
                  src={selectedMedia.url}
                  controls
                  autoPlay
                  style={{ maxWidth: '100%', maxHeight: '60vh', borderRadius: 'var(--radius-md)' }}
                />
              )}

              <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <div>
                  <h4 style={{ fontSize: '1.1rem', color: 'white' }}>{selectedMedia.filename}</h4>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    <span>Category: {selectedMedia.category}</span> • <span>Size: {selectedMedia.size}</span> • <span>Date: {selectedMedia.date}</span>
                  </div>
                </div>

                <a href={selectedMedia.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                  <i className="fa-solid fa-download"></i> Download Full Res
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MediaViewer;