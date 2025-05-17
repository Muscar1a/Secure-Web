import React, { useContext, useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../../contexts/AuthContext';
import './ChatPage.css';
import { host, ws_host } from '../../utils/APIRoutes';
import { BsChatSquare, BsPeople, BsChatDots } from 'react-icons/bs';
import { IoSettingsOutline } from 'react-icons/io5';
import { CgProfile } from 'react-icons/cg';
import { BiLogOut } from 'react-icons/bi';
import { Link } from 'react-router-dom'; // Import Link

const ChatPage = () => {
  const { user, token, logout, loading: authLoading } = useContext(AuthContext);

  const [contacts, setContacts] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [isSocketConnected, setIsSocketConnected] = useState();

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
<<<<<<< HEAD
  

=======
  const previousRecipientRef = useRef(null);
  // username lookup
  const [lookupUsername, setLookupUsername]   = useState("");
>>>>>>> 02b80ed12c329c83ffaf4f8362e0f6505329a2df
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const hasReloaded = sessionStorage.getItem('chatPageReloaded');
    if (!hasReloaded) {
      sessionStorage.setItem('chatPageReloaded', 'true');
      window.location.reload();
    }
  }, []);

  useEffect(() => {
    const fetchContacts = async () => {
      if (!user || !token) return;
      try {
        const response = await axios.get(`${host}/users/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setContacts(response.data.filter(contact => contact.id !== user.id));
      } catch (error) {
        console.error("Failed to fetch contacts", error);
      }
    };
    fetchContacts();
  }, [token, user]);

  const getDisplayName = (contact) => {
    if (!contact) return "Unknown User";
    if (contact.first_name && contact.last_name) {
      return `${contact.first_name} ${contact.last_name}`;
    }
    if (contact.username) {
      return contact.username;
    }
    return `User ${contact.id}`; 
  };

  const getAvatarInitials = (contactUser) => { 
    if (!contactUser) return "U";
    if (contactUser.first_name && contactUser.last_name) {
      return `${contactUser.first_name[0]}${contactUser.last_name[0]}`.toUpperCase();
    }
    if (contactUser.username) {
      return contactUser.username[0].toUpperCase();
    }
    return "U";
  };

    const handleLookup = async () => {
    if (!lookupUsername.trim()) return;
    setMessages([]);
    setIsLoadingChat(true);

    try {
      // 1) find the user by username
      const resp = await axios.get(
        `${host}/users/by-username/${lookupUsername.trim()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const peer = resp.data;  // { id, username, … }

      // 2) re-use your existing flow
      const chatId = await fetchOrCreateChat(peer.id);
      if (chatId) {
        setCurrentChatId(chatId);
        setSelectedRecipient(peer);
      }
    } catch (err) {
      console.error("Lookup failed:", err);     
    } finally {
      setLookupUsername("");
    }
  };

  const fetchOrCreateChat = async (recipientId) => {
    console.log("--> fetchOrCreateChat called with recipientId:", recipientId);
    try {
      const response = await axios.get(`${host}/chat/private/recipient/chat-id/${recipientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Fetched existing chat ID:", response.data.chat_id);
      return response.data.chat_id;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log("Chat not found, creating new chat via GET (as per original).");
        const createResponse = await axios.get(`${host}/chat/private/recipient/create-chat/${recipientId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Chat created (via GET):", createResponse.data);
        return createResponse.data.chat_id;
      } else {
        console.error("Error fetching/creating chat:", error.response?.data || error.message, error);
        throw error; 
      }
    }
  };

  const handleSelectContact = async (contact) => {
    if (selectedRecipient?.id === contact.id && !isLoadingChat) return;

    console.log(`Switching chat to: ${getDisplayName(contact)} (ID: ${contact.id})`);
    setIsLoadingChat(true);
    setSelectedRecipient(contact);
    setMessages([]); 
    
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.close();
    }
    socketRef.current = null;
    setIsSocketConnected(false);
    setCurrentChatId(null);

    try {
      const chatId = await fetchOrCreateChat(contact.id);
      if (chatId) {
        setCurrentChatId(chatId);
      } else {
        console.error("fetchOrCreateChat returned null/undefined chatId without throwing error.");
        setSelectedRecipient(null);
        setIsLoadingChat(false);
      }
    } catch (error) {
      console.error("Failed to setup chat in handleSelectContact:", error);
      setSelectedRecipient(null);
      setIsLoadingChat(false);
    }
  };

  useEffect(() => {
    if (!currentChatId || !selectedRecipient || !token || !user) {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.close();
      }
      socketRef.current = null;
      setIsSocketConnected(false);
      if (!selectedRecipient) {
          setIsLoadingChat(false);
      }
      return;
    }
    
    if(!isLoadingChat) setIsLoadingChat(true); 

    const wsTokenFromStorage = localStorage.getItem('token');
    if (!wsTokenFromStorage) {
      console.error("WebSocket token not found in localStorage.");
      setIsLoadingChat(false);
      setIsSocketConnected(false);
      setSelectedRecipient(null); 
      return;
    }

    if (socketRef.current && socketRef.current.readyState !== WebSocket.CLOSED) {
        socketRef.current.close();
    }

    console.log(`Attempting to connect WebSocket for chat ID: ${currentChatId}`);
    const encodedToken = encodeURIComponent(wsTokenFromStorage);
    const socket = new WebSocket(`${ws_host}/ws/chat/private/${currentChatId}?token=${encodedToken}`);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log(`WebSocket connection opened for chat ID: ${currentChatId}`);
      setIsSocketConnected(true);
      console.log("isSocketConnected after set:", isSocketConnected);
      const loadOldMessages = async () => {
        try {
          const response = await axios.get(`${host}/chat/private/messages/${currentChatId}`, {
            headers: { Authorization: `Bearer ${token}` }, 
          });
          setMessages(response.data.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)));
        } catch (error) {
          console.error("Error fetching old messages:", error);
          setMessages([]);
        } finally {
          setIsLoadingChat(false); 
        }
      };
      loadOldMessages();
    };

    socket.onmessage = (event) => {
      try {
        const newMessageData = JSON.parse(event.data);
        if (socketRef.current && socketRef.current.url.includes(currentChatId)) {
            setMessages((prevMessages) => [...prevMessages, newMessageData]);
        }
      } catch (e) {
        console.error("Error parsing WebSocket message:", e);
      }
    };

    socket.onerror = (error) => {
      console.error(`WebSocket error for chat ID ${currentChatId}:`, error);
      setIsLoadingChat(false);
      setIsSocketConnected(false);
    };

    socket.onclose = (event) => {
      console.log(`WebSocket connection closed for chat ID ${currentChatId}:`, event.reason, event.code);
      setIsSocketConnected(false);
    };

    return () => {
      if (socketRef.current) {
        socketRef.current.onopen = null;
        socketRef.current.onmessage = null;
        socketRef.current.onerror = null;
        socketRef.current.onclose = null;
        if (socketRef.current.readyState === WebSocket.OPEN || socketRef.current.readyState === WebSocket.CONNECTING) {
            socketRef.current.close();
        }
        socketRef.current = null;
      }
    };
  }, [currentChatId, token, user, selectedRecipient]); 

  const handleInputChange = (e) => {
    setMessageInput(e.target.value);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (messageInput.trim() === '' || !socketRef.current || !isSocketConnected || !selectedRecipient || isLoadingChat || !currentChatId) {
      return;
    }
    const messagePayload = messageInput; 
    socketRef.current.send(JSON.stringify(messagePayload));
    setMessageInput('');
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch (e) {
      return "Invalid time";
    }
  };

  const renderContactList = () => {
    if (authLoading && !user) {
      return <p className="sidebar-message">Loading contacts...</p>;
    }
    if (!Array.isArray(contacts) || contacts.length === 0) {
      return <p className="sidebar-message">No contacts available.</p>;
    }

    return contacts.map((contact) => {
      const isActive = selectedRecipient?.id === contact.id;
      return (
        <li
          key={contact.id}
          className={`contact-item ${isActive && !isLoadingChat ? 'active' : ''} ${isLoadingChat && selectedRecipient?.id === contact.id ? 'loading-active' : ''}`}
          onClick={() => handleSelectContact(contact)}
        >
          <div className="contact-avatar">
            {contact.avatar_url ? (
              <img src={contact.avatar_url} alt={getDisplayName(contact)} />
            ) : (
              <span className="avatar-initials">{getAvatarInitials(contact)}</span>
            )}
          </div>
          <div className="contact-info">
            <span className="contact-name">{getDisplayName(contact)}</span>

          </div>
        </li>
      );
    });
  };

  if (authLoading || !user) {
    return <div className="loading-screen">Loading...</div>;
  }
  
  const recipientForHeader = selectedRecipient;

  return (
    <div className="chat-page">
      <header className="chat-header">
           <div className="logo"> 
             <BsChatSquare className="logo-icon" /> 
              TriSec
           </div>        
           <nav className="header-nav">
          <Link to="/settings" className="nav-item"> 
            <IoSettingsOutline style={{ marginRight: '5px', verticalAlign: 'middle' }} /> Settings
          </Link>
          <Link to="/profile" className="nav-item"> 
            <CgProfile style={{ marginRight: '5px', verticalAlign: 'middle' }} /> Profile
          </Link>
          <button onClick={logout} className="nav-item nav-item-logout">
            <BiLogOut style={{ marginRight: '5px', verticalAlign: 'middle' }} /> Logout
          </button>
        </nav>
      </header>

      <main className="chat-main">
        <aside className="chat-sidebar">
          <div className="sidebar-header">
            <BsPeople className="sidebar-icon" />
            <span>Contacts</span>
          </div>
          <div className="username-lookup" style={{ padding: '0 16px 16px' }}>
            <input
            type="text"
            value={lookupUsername}
            onChange={e => setLookupUsername(e.target.value)}
            placeholder="Enter peer’s username…"
            style={{
              width: '100%',
              padding: '8px 12px',
              marginBottom: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
          />
          <button
            onClick={handleLookup}
            disabled={!lookupUsername.trim() || !token}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '4px',
              backgroundColor: '#567',
              color: '#fff',
              border: 'none',
              cursor: lookupUsername.trim() && token ? 'pointer' : 'not-allowed'
            }}
          >
            Start Chat
          </button> 
          </div>
          <ul className="contact-list">{renderContactList()}</ul>
        </aside>

        <section className="chat-area">
          {!recipientForHeader || !currentChatId ? (
             isLoadingChat && recipientForHeader ? (
                <div className="chat-loading-messages"><p>Setting up chat with {getDisplayName(recipientForHeader)}...</p></div>
            ) : (
                <div className="welcome-chat-prompt">
                  <div className="welcome-chat-icon-container">
                    <BsChatDots className="welcome-chat-icon" />
                  </div>
                  <h2 className="welcome-chat-title">Welcome to Chatty!</h2>
                  <p className="welcome-chat-subtitle">
                    Select a conversation from the sidebar to start chatting
                  </p>
                </div>
            )
          ) : (
            <div className={`chat-window`}>
              <div className="chat-window-header">
                <div className="chat-recipient-avatar">
                  {recipientForHeader.avatar_url ? (
                    <img src={recipientForHeader.avatar_url} alt="recipient avatar" />
                  ) : (
                    <span className="avatar-initials">{getAvatarInitials(recipientForHeader)}</span>
                  )}
                </div>
                <div className="chat-recipient-info">
                  <span className="chat-recipient-name">
                    {getDisplayName(recipientForHeader)}
                  </span>
                </div>
              </div>

              <div className="chat-messages-container">
                {isLoadingChat && messages.length === 0 ? (
                    <div className="chat-loading-messages"><p>Loading messages...</p></div>
                ) : messages.length > 0 ? (
                  messages.map((msg) => {
                    if (!user || !recipientForHeader) return null;
                    const isSent = msg.created_by === user.id;
                    const messageSender = isSent ? user : recipientForHeader;
                    
                    const isExplodingHeadEmoji = msg.message === '🤯';

                    return (
                      <div
                        key={msg.id || msg.temp_id || Math.random()}
                        className={`message-row ${isSent ? "sent" : "received"}`}
                      >
                        {!isSent && (
                           <div className="chat-message-avatar">
                             {messageSender.avatar_url ? <img src={messageSender.avatar_url} alt={getDisplayName(messageSender)}/> : <span className="avatar-initials">{getAvatarInitials(messageSender)}</span>}
                           </div>
                        )}
                        <div className={`message-bubble ${isExplodingHeadEmoji ? 'message-emoji-large' : ''}`}>
                          {isExplodingHeadEmoji ? (
                            <span className="emoji-large">🤯</span>
                          ) : (
                            <p>{msg.message}</p>
                          )}
                          <span className="message-timestamp">{formatTimestamp(msg.created_at)}</span>
                        </div>
                        {isSent && (
                          <div className="chat-message-avatar">
                            {messageSender.avatar_url ? <img src={messageSender.avatar_url} alt={getDisplayName(messageSender)}/> : <span className="avatar-initials">{getAvatarInitials(messageSender)}</span>}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="no-messages">No messages yet. Say hello!</p>
                )}
                <div ref={messagesEndRef} />
              </div>

              <form className="message-input-form" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  value={messageInput}
                  onChange={handleInputChange}
<<<<<<< HEAD
                  placeholder={isLoadingChat ? "Loading..." : "Type a message..."}
                  disabled={isLoadingChat || !isSocketConnected || !selectedRecipient || !currentChatId}
                />
                <button type="submit" disabled={isLoadingChat || !isSocketConnected || !selectedRecipient || !currentChatId || !messageInput.trim()}>
=======
                  placeholder={isLoadingChat ? "Loading chat..." : "Type a message..."}
                  disabled={isLoadingChat || !isSocketConnected || !currentChatId}
                />
                <button type="submit" disabled={isLoadingChat || !isSocketConnected || !currentChatId || !messageInput.trim()}>
>>>>>>> 02b80ed12c329c83ffaf4f8362e0f6505329a2df
                  Send
                </button>
              </form>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default ChatPage;