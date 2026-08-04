import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MOCK_MESSAGES } from '../mockData';

function MessagesViewer({ token, activeDevice }) {
  const [conversations, setConversations] = useState(MOCK_MESSAGES);
  const [activeThreadIndex, setActiveThreadIndex] = useState(0);
  const [newSmsText, setNewSmsText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (activeDevice) {
      axios
        .get(`http://localhost:5000/api/messages/${activeDevice._id}`, {
          headers: { authorization: token }
        })
        .then((res) => {
          if (res.data && res.data.length > 0) {
            // Group messages by contact
          }
        })
        .catch(() => {});
    }
  }, [activeDevice]);

  const activeThread = conversations[activeThreadIndex] || conversations[0];

  const handleSendRemoteSms = (e) => {
    e.preventDefault();
    if (!newSmsText.trim()) return;

    const updated = [...conversations];
    const target = updated[activeThreadIndex];
    target.threads.push({
      id: Date.now(),
      body: newSmsText,
      direction: 'outgoing',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    setConversations(updated);
    setNewSmsText('');
  };

  const filteredConversations = conversations.filter((c) =>
    c.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phoneNumber.includes(searchQuery)
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 700 }}>
          SMS & Messages Monitor ({activeDevice ? activeDevice.name : 'Select Device'})
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Remotely view SMS text messages, OTP alerts, and send SMS from the connected mobile phone.
        </p>
      </div>

      <div className="messages-container">
        {/* Sidebar contact search & threads */}
        <div className="threads-sidebar">
          <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search SMS / contact..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ fontSize: '0.85rem' }}
            />
          </div>

          {filteredConversations.map((conv, idx) => {
            const lastMsg = conv.threads[conv.threads.length - 1];
            return (
              <div
                key={idx}
                className={`thread-item ${activeThreadIndex === idx ? 'active' : ''}`}
                onClick={() => setActiveThreadIndex(idx)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span className="thread-name">{conv.contactName}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{lastMsg ? lastMsg.time : ''}</span>
                </div>
                <div className="thread-preview">{lastMsg ? lastMsg.body : 'No messages'}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', marginTop: '2px' }}>
                  {conv.phoneNumber}
                </div>
              </div>
            );
          })}
        </div>

        {/* Conversation Chat Box */}
        <div className="chat-box">
          {activeThread ? (
            <>
              <div className="chat-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{activeThread.contactName}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{activeThread.phoneNumber}</div>
                </div>
                <span className="badge badge-online">Device Synced</span>
              </div>

              <div className="chat-history">
                {activeThread.threads.map((msg) => (
                  <div key={msg.id} className={`chat-bubble ${msg.direction}`}>
                    <div>{msg.body}</div>
                    <div className="chat-timestamp">{msg.time}</div>
                  </div>
                ))}
              </div>

              <form className="chat-input-bar" onSubmit={handleSendRemoteSms}>
                <input
                  type="text"
                  className="form-control"
                  placeholder={`Send SMS via ${activeDevice ? activeDevice.name : 'Phone'}...`}
                  value={newSmsText}
                  onChange={(e) => setNewSmsText(e.target.value)}
                />
                <button type="submit" className="btn btn-primary">
                  <i className="fa-solid fa-paper-plane"></i> Send
                </button>
              </form>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
              Select a message thread to inspect SMS contents.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MessagesViewer;
