import React, { useContext, useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './ChatPage.css';
import { host, ws_host } from '../../utils/APIRoutes';
import { BsChatSquare, BsPeople } from 'react-icons/bs';
import { IoSettingsOutline } from 'react-icons/io5';
import { CgProfile } from 'react-icons/cg';
import { BiLogOut } from 'react-icons/bi';

const ChatPage = () => {
  const { user, token, logout, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [contacts, setContacts] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [messageInput, setMessageInput] = useState("");


  const socketRef = useRef(null);

  // Load contacts
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await axios.get(`${host}/users/all`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setContacts(response.data);
      } catch (error) {
        console.error("Failed to fetch contacts", error);
      }
    };

    if (token) {
      fetchContacts();
    }
  }, [token]);


  // Connect to WebSocket when currentChatId changes
  useEffect(() => {
    if (!currentChatId) return;

    const token = encodeURIComponent(localStorage.getItem('token'));
    const socket = new WebSocket(`${ws_host}/ws/chat/private/${currentChatId}/token=${token}`);
    socketRef.current = socket;
    // TODO: currently websocket is reject, we need to fix it
    socket.onmessage = (event) => {
      const newMessage = JSON.parse(event.data);
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    };
    return () => {
      socket.close();
    };
  }, [currentChatId]);

  // Handle message input change
  const handleInputChange = (e) => {
    setMessageInput(e.target.value);
  }

  // Send to websocket
  const handleSendMessage = async (e) => {
    if (messageInput.trim() === '') return;

    const message = {
      sender: user.id,
      recipient: selectedRecipient.id,
      content: messageInput,
    }

    socketRef.current.send(JSON.stringify(message));
    setMessageInput('');
  }

  const renderContactList = () => {
    return contacts.map((contact) => (
      <li
        key={contact.id}
        className={`contact-item ${currentChatId === contact.id ? 'active' : ''}`}
        onClick={() => {
          setSelectedRecipient(contact);
          setCurrentChatId(contact.id);
        }}
      >
        {contact.first_name || ''} {contact.last_name || ''} (@{contact.username})
      </li>
    ));
  };

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  const userName = user?.username || user?.name || 'User';


  return (
    <div className="chat-page">
      <header className="chat-header">
        <div className="header-title">
          <BsChatSquare style={{ marginRight: '8px', verticalAlign: 'middle' }} />
          TriSec
        </div>

        <nav className="header-nav">
          <button className="nav-item">
            <IoSettingsOutline style={{ marginRight: '5px', verticalAlign: 'middle' }} /> Settings
          </button>
          <button className="nav-item">
            <CgProfile style={{ marginRight: '5px', verticalAlign: 'middle' }} /> Profile
          </button>
          <button onClick={logout} className="nav-item">
            <BiLogOut style={{ marginRight: '5px', verticalAlign: 'middle' }} /> Logout
          </button>
        </nav>
      </header>

      <div className="welcome-message">
        Welcome to TriSec{user ? `, ${userName}` : ''}!
      </div>

      <main className="chat-main">
        <aside className="chat-sidebar">
          <div className="sidebar-header">
            <BsPeople className="sidebar-icon" />
            Contacts
          </div>
          {/* <div className="sidebar-filter">
            <input type="checkbox" id="show-online" />
            <label htmlFor="show-online">Show online only</label>
          </div> */}
          <ul className="contact-list">
            {renderContactList()}

          </ul>
        </aside>

        <section className="chat-area">
          <div className="chat-window">
            <div className="chat-messages">
              {messages.map((msg, index) => (
                <div key={index} className={`message ${msg.sender === user.id ? "sent" : "received"}`}>
                  <p>{msg.content}</p>
                </div>
              ))}
            </div>

            <div className="message-input">
              <input
                type="text"
                value={messageInput}
                onChange={handleInputChange}
                placeholder="Type a message..."
              />
              <button onClick={handleSendMessage}>Send</button>
            </div>
            
          </div>
        </section>
      </main>
    </div>
  );
};

export default ChatPage;