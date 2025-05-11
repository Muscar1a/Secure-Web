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

  // console.log('ChatPage user:', user);

  const socketRef = useRef(null);

  //* reload to assure user is logged in
  // ################################################## //
  useEffect(() => {
    const hasReloaded = sessionStorage.getItem('chatPageReloaded');
    if (!hasReloaded) {
      sessionStorage.setItem('chatPageReloaded', 'true');
      window.location.reload();
    }
  }, []);
  // ################################################## //
  //* Load contacts
  // ################################################## //
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

  // ################################################## //
  //* fetch/create chat with recipient
  // ################################################## //

  const fetchOrCreateChat = async (recipientId) => {
    console.log("--> fetchOrCreateChat called with recipientId:", recipientId);
    try {
      // Get API for chat_id
      const response = await axios.get(`${host}/chat/private/recipient/chat-id/${recipientId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Recipients fetched:", response.data);
      // return response.data.chat_id;
      setCurrentChatId(response.data.chat_id);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        // Not found, create a new chat
        const createResponse = await axios.get(`${host}/chat/private/recipient/create-chat/${recipientId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("Chat created:", createResponse.data);
        return createResponse.data.chat_id;
      } else {
        console.error("Error fetching/creating chat:", error);
        return null;
      }
    }
  }

  // ################################################## //
  //* Connect to WebSocket when currentChatId changes
  // ################################################## //

  useEffect(() => {
    const connectWebsocketAndFetchMessages = async () => {
      if (!currentChatId || !selectedRecipient) return;

      console.log("Current chat ID:", currentChatId);

      const token = encodeURIComponent(localStorage.getItem('token'));
      const socket = new WebSocket(`${ws_host}/ws/chat/private/${currentChatId}?token=${token}`);
      socketRef.current = socket;
      console.log('Connect to WebSocket:', socketRef.current, 'successfully!');

      
      // Load old messages
      try {
        const response = await axios.get(`${host}/chat/private/messages/${currentChatId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessages(response.data);
      } catch (error) {
        console.error("No messages found"); //, error);
      }

      socket.onmessage = (event) => {
        const newMessage = JSON.parse(event.data);
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      };
      return () => {
        socket.close();
      };
      
    };
    connectWebsocketAndFetchMessages();
  }, [currentChatId, selectedRecipient]);

  // Handle message input change
  const handleInputChange = (e) => {
    setMessageInput(e.target.value);
  };

  // Send to websocket
  const handleSendMessage = (e) => {
    e.preventDefault();

    if (messageInput.trim() === '' || !socketRef.current || !selectedRecipient) return;
    const message = {
      sender: user.id,
      recipient: selectedRecipient.id,
      content: messageInput,
    };
    console.log("Sending message:", message);

    socketRef.current.send(JSON.stringify(message));
    setMessageInput('');
  };
  // ################################################## //
  // TODO: need to see why the code does not load old messages, it seems that function is not called
  // Render contact list
  const renderContactList = () => {
    if (!Array.isArray(contacts)) {
      return <p>Loading contacts...</p>;
    }


    return contacts.map((contact, idx) => {
      // console.log(`contact[${idx}]`, contact);
      // console.log(`user.id`, user.id, `contact.id`, contact.id);

      const isActive = selectedRecipient?.id === contact.id;
      return (
        <li
          key={contact.id}
          className={`contact-item ${isActive ? 'active' : ''}`}
          onClick={() => {
            setSelectedRecipient(contact);
            const chatId = fetchOrCreateChat(contact.id);
            setCurrentChatId(chatId);
          }}
        >
          {contact.first_name || ''} {contact.last_name || ''} (@{contact.username})
        </li>
      );
    });
  };



  if (loading || !user) {
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
          <ul className="contact-list">
            {renderContactList()}
          </ul>
        </aside>

        <section className="chat-area">
          <div className="chat-window">
            <div className="chat-messages">
              {messages.map((msg, index) => (
                <div
                  key={index} 
                  className={`message ${msg.sender === user.id ? "sent" : "received"}`}
                >
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
                disabled={!selectedRecipient}
              />
              <button onClick={handleSendMessage} disabled={!selectedRecipient || !messageInput.trim()}>
                Send
              </button>
            </div>

          </div>
        </section>
      </main>
    </div>
  );
};

export default ChatPage;