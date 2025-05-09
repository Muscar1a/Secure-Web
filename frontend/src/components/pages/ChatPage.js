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
  const { user, logout, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [contacts, setContacts] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [messageInput, setMessageInput] = useState("");


  const socketRef = useRef(null);

  const connectWebSocket = (chatId) => {
    const token = localStorage.getItem('access_token');
    const ws = new WebSocket(`${ws_host}/ws/chat/private/${chatId}/token=${token}`);
    socketRef.current = ws;

    ws.onmessage = (event) => {
      const newMessage = JSON.parse(event.data);
      setMessages(prev => [...prev, newMessage]);
    };
    // TODO: cần check xem đã được connect tới websocket chưa
    ws.onopen = () => console.log("[WebSocket] Connected");
    ws.onclose = () => console.log("[WebSocket] Disconnected");
  };


  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await axios.get(`${host}/chat/private/msg-recipients/`);
        // TODO: check https://chatgpt.com/c/681c397b-7828-800b-bd54-64a1073237bb
        setContacts(res.data);
      } catch (err) {
        console.error('Error fetching contacts:', err);
      }
    };
    fetchContacts();
  }, []);


  const handleSelectContact = async (recipient) => {
    try {
      setSelectedRecipient(recipient);

      // Create/get chat
      const res = await axios.get(`${host}/chat/private/recipient/create-chat/${recipient._id}`);
      const chatId = res.data.chat_id;
      setCurrentChatId(chatId);

      // Get messages
      const msgRes = await axios.get(`${host}/chat/private/messages/${chatId}`);
      setMessages(msgRes.data);

      // Close existing socket
      if (socketRef.current) {
        socketRef.current.close();
      }

      // Connect to new socket
      connectWebSocket(chatId);
    } catch (err) {
      console.error('Error loading chat:', err);
    }
  };

  const sendMessage = () => {
    if (socketRef.current && messageInput.trim() !== "") {
      socketRef.current.send(messageInput);
      setMessageInput("");
    }
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


      <main className="chat-main">
        <aside className="chat-sidebar">
          <div className="sidebar-header">
            <BsPeople className="sidebar-icon" />
            Contacts
          </div>
          <div className="sidebar-filter">
            <input type="checkbox" id="show-online" />
            {/* <label htmlFor="show-online">Show online only</label> */}
          </div>
          <ul className="contact-list">
            {/* {renderContactList()} */}
            {contacts.map((contact) => (
              <li key={contact._id} 
                onClick={() => handleSelectContact(contact)}
                className={selectedRecipient?._id === contact._id ? 'active' : ''}
              >
                {contact.username || contact.name}
              </li>
            ))}
          </ul>
        </aside>

        <section className="chat-area">
          <div className="welcome-message">
            {/* <div className="welcome-icon">
              <BsChatSquare />
            </div>
            <h2 className="welcome-title">
              {currentChat === undefined ? (
                <Welcome />
              ) : (
                <ChatContainer currentChat={currentChat} socket={socket} />
              )}
              
              Welcome to TriSec{user ? `, ${userName}` : ''}!
            </h2> */}
          </div>
        </section>
      </main>
    </div>
  );
};

export default ChatPage;