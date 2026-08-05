import React, { useState, useEffect } from 'react';

function ContactsViewer({ token, activeDevice, liveContacts }) {
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (liveContacts && liveContacts.length > 0) {
      const formatted = liveContacts.map((c, idx) => ({
        _id: `c_${idx}`,
        name: c.name || 'Contact',
        phone: c.phone || '',
        email: c.email || '',
        starred: false
      }));
      setContacts(formatted);
    }
  }, [liveContacts]);

  const filtered = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  if (!liveContacts || liveContacts.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700 }}>
            Device Contacts Directory ({activeDevice ? activeDevice.name : 'Select Device'})
          </h2>
        </div>
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <i className="fa-solid fa-address-book" style={{ fontSize: '3rem', color: 'var(--accent-primary)', marginBottom: '1rem', display: 'block', opacity: 0.5 }}></i>
          <h3 style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Waiting for Live Contacts Data...</h3>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
            Open the OmniSync app and grant <strong>Contacts</strong> permission.
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
            Device Contacts Directory ({activeDevice ? activeDevice.name : 'Select Device'})
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Remotely access saved phone address book contacts.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span className="badge badge-online">
            🟢 Live Extracted Contacts ({liveContacts.length})
          </span>
          <div style={{ width: '280px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search contact name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid-cards">
        {filtered.map((contact) => (
          <div key={contact._id} className="glass-card" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.3rem',
                fontWeight: 700,
                flexShrink: 0
              }}
            >
              {contact.name ? contact.name.charAt(0).toUpperCase() : 'C'}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {contact.name}
              </h4>
              <div style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', marginTop: '2px' }}>
                <i className="fa-solid fa-phone" style={{ fontSize: '0.75rem' }}></i> {contact.phone}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ContactsViewer;
