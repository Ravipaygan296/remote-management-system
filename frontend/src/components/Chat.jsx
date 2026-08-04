import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

function Chat({ token }) {
    const [messages, setMessages] = useState([]);
    const [newMsg, setNewMsg] = useState('');
    const [userId, setUserId] = useState('current-user');

    useEffect(() => {
        socket.on('new_message', (data) => {
            setMessages((prev) => [...prev, data]);
        });

        fetch('http://localhost:5000/api/chat', {
            headers: { authorization: token },
        })
            .then((res) => res.json())
            .then((data) => setMessages(data));

        return () => {
            socket.off('new_message');
        };
    }, []);

    const sendMessage = () => {
        socket.emit('send_message', { senderId: userId, message: newMsg });
        setNewMsg('');
    };

    return (
        <div>
            <h2>Chat</h2>
            <div style={{ border: '1px solid black', height: '200px', overflowY: 'scroll' }}>
                {messages.map((msg, index) => (
                    <div key={index}>
                        <b>{msg.sender?.username || 'User'}:</b> {msg.message}
                    </div>
                ))}
            </div>
            <input value={newMsg} onChange={(e) => setNewMsg(e.target.value)} />
            <button onClick={sendMessage}>Send</button>
        </div>
    );
}

export default Chat;