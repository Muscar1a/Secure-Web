// src/App.js
import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [userId, setUserId] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState('');
  const webSocketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Function to connect to WebSocket
  const connectWebSocket = () => {
    if (!userId.trim()) {
      setError('Please enter a user ID');
      return;
    }

    setError('');
    const ws = new WebSocket(`ws://localhost:8000/ws/${userId}`);

    ws.onopen = () => {
      setIsConnected(true);
      setMessages(prev => [...prev, { text: 'Connected to chat server', type: 'system' }]);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages(prev => [...prev, { text: data.message, sender: data.sender, type: 'received' }]);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('Failed to connect. Please try again.');
      setIsConnected(false);
    };

    ws.onclose = () => {
      setMessages(prev => [...prev, { text: 'Disconnected from chat server', type: 'system' }]);
      setIsConnected(false);
    };

    webSocketRef.current = ws;
  };

  // Function to disconnect WebSocket
  const disconnectWebSocket = () => {
    if (webSocketRef.current) {
      webSocketRef.current.close();
      webSocketRef.current = null;
    }
  };

  // Function to send message
  const sendMessage = (e) => {
    e.preventDefault();
    
    if (!message.trim() || !isConnected) return;
    
    const messageData = {
      message: message,
      sender: userId
    };

    webSocketRef.current.send(JSON.stringify(messageData));
    setMessages(prev => [...prev, { text: message, sender: userId, type: 'sent' }]);
    setMessage('');
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Clean up WebSocket connection when component unmounts
  useEffect(() => {
    return () => {
      disconnectWebSocket();
    };
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-4">
        <h1 className="text-2xl font-bold">WebSocket Chat</h1>
      </header>

      <main className="flex-1 p-4 flex flex-col">
        {!isConnected ? (
          <div className="max-w-md mx-auto w-full p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Join Chat</h2>
            
            <div className="mb-4">
              <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-1">
                User ID
              </label>
              <input
                type="text"
                id="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Enter your user ID"
              />
            </div>
            
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            
            <button
              onClick={connectWebSocket}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Connect
            </button>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="flex-1 bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
              <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                <span className="font-medium">Connected as: {userId}</span>
                <button
                  onClick={disconnectWebSocket}
                  className="text-sm bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600"
                >
                  Disconnect
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`mb-4 ${
                      msg.type === 'system'
                        ? 'text-center text-gray-500 text-sm'
                        : msg.type === 'sent'
                        ? 'flex justify-end'
                        : 'flex justify-start'
                    }`}
                  >
                    {msg.type !== 'system' && (
                      <div
                        className={`max-w-xs p-3 rounded-lg ${
                          msg.type === 'sent'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-800'
                        }`}
                      >
                        {msg.type === 'received' && (
                          <div className="text-xs text-gray-600 mb-1">{msg.sender}</div>
                        )}
                        {msg.text}
                      </div>
                    )}
                    {msg.type === 'system' && <div>{msg.text}</div>}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              
              <form onSubmit={sendMessage} className="p-4 border-t">
                <div className="flex">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded-l"
                    placeholder="Type your message..."
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 text-white py-2 px-4 rounded-r hover:bg-blue-700"
                  >
                    Send
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-gray-200 text-center p-2 text-sm text-gray-600">
        FastAPI WebSocket Chat Demo
      </footer>
    </div>
  );
}

export default App;