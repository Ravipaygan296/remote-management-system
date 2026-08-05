import React, { useState, useEffect } from 'react';

function MediaViewer({ token, activeDevice, liveMedia }) {
  const [mediaItems, setMediaItems] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [selectedMedia, setSelectedMedia] = useState(null);

  useEffect(() => {
    if (liveMedia && liveMedia.length > 0) {
      const formatted = liveMedia.map((item, idx) => ({
        _id: item.id || `m_${idx}`,
        filename: item.title || `Photo_${idx + 1}.jpg`,
        url: item.url || item.thumbnailUrl || '',
        type: 'photo',
        category: item.category || 'Photos',
        size: item.size || '',
        date: item.date || 'Live extracted'
      }));
      setMediaItems(formatted);
    }
  }, [liveMedia]);

  const filtered = mediaItems.filter((item) => {
    if (filterType !== 'all' && item.type !== filterType) return false;
    return true;
  });

  if (!liveMedia || liveMedia.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700 }}>
            Device Media Explorer ({activeDevice ? activeDevice.name : 'Select Device'})
          </h2>
        </div>
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <i className="fa-solid fa-images" style={{ fontSize: '3rem', color: 'var(--accent-primary)', marginBottom: '1rem', display: 'block', opacity: 0.5 }}></i>
          <h3 style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Waiting for Live Photos & Media...</h3>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
            Open the OmniSync app on your phone and grant <strong>Photos & Media</strong> permission. Photos will be streamed as compressed thumbnails.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700 }}>
            Device Media Explorer ({activeDevice ? activeDevice.name : 'Select Device'})
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Real photos extracted from the phone's gallery, streamed as compressed thumbnails.
          </p>
        </div>
        <span className="badge badge-online">
          🟢 Live Device Photos ({liveMedia.length} items)
        </span>
      </div>

      <div className="glass-card" style={{ padding: '0.75rem 1.25rem', display: 'flex', gap: '0.75rem' }}>
        <button className={`btn btn-sm ${filterType === 'all' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilterType('all')}>
          All Media ({mediaItems.length})
        </button>
        <button className={`btn btn-sm ${filterType === 'photo' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilterType('photo')}>
          <i className="fa-solid fa-image"></i> Photos
        </button>
      </div>

      {/* Gallery Grid */}
      <div className="grid-gallery">
        {filtered.map((item) => (
          <div key={item._id} className="media-card" onClick={() => setSelectedMedia(item)}>
            <img src={item.url} alt={item.filename} loading="lazy" />
            <div className="media-card-overlay">
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>
                {item.filename}
              </span>
              <span>{item.size}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedMedia && (
        <div className="modal-backdrop" onClick={() => setSelectedMedia(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '850px', background: '#090d16' }}>
            <button className="modal-close" onClick={() => setSelectedMedia(null)}>×</button>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
              <img
                src={selectedMedia.url}
                alt={selectedMedia.filename}
                style={{ maxWidth: '100%', maxHeight: '60vh', borderRadius: 'var(--radius-md)', objectFit: 'contain' }}
              />
              <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <div>
                  <h4 style={{ fontSize: '1.1rem', color: 'white' }}>{selectedMedia.filename}</h4>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    <span>Size: {selectedMedia.size}</span> • <span>Date: {selectedMedia.date}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MediaViewer;