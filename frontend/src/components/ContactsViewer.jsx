import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MOCK_CONTACTS } from '../mockData';

function ContactsViewer({ token, activeDevice }) {
  const [contacts, setContacts] = useState(MOCK_CONTACTS);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (activeDevice) {
      axios
        .get(`http://localhost:5000/api/contacts/${activeDevice._id}`, {
          headers: { authorization: token }
        })
        .then((res) => {
          if (res.data && res.data.length > 0) {
            setContacts(res.data);
          }
        })
        .catch(() => {});
    }
  }, [activeDevice]);

  const filtered = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700 }}>
            Device Contacts Directory ({activeDevice ? activeDevice.name : 'Select Device'})
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Remotely access saved phone address book contacts and emails.
          </p>
        </div>
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
                fontWeight: 700
              }}
            >
              {contact.initial || contact.name.charAt(0)}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {contact.name}
                </h4>
                {contact.starred && <i className="fa-solid fa-star" style={{ color: 'var(--accent-warning)', fontSize: '0.85rem' }}></i>}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', marginTop: '2px' }}>
                <i className="fa-solid fa-phone" style={{ fontSize: '0.75rem' }}></i> {contact.phone}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
                <i className="fa-solid fa-envelope" style={{ fontSize: '0.75rem' }}></i> {contact.email}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ContactsViewer;
