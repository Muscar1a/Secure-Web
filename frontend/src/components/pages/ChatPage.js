import React, { useContext, useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../../contexts/AuthContext';
// import { useNavigate } from 'react-router-dom';
import './ChatPage.css';
import { host, ws_host } from '../../utils/APIRoutes';
import { BsChatSquare, BsPeople, BsChatDots } from 'react-icons/bs';
import { IoSettingsOutline } from 'react-icons/io5';
import { CgProfile } from 'react-icons/cg';
import { BiLogOut } from 'react-icons/bi';

const ChatPage = () => {
  const { user, token, logout, loading: authLoading } = useContext(AuthContext);
  // const navigate = useNavigate();

  const [contacts, setContacts] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const previousRecipientRef = useRef(null);

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

  const handleSelectContact = async (contact) => {
    if (selectedRecipient?.id === contact.id && !isLoadingChat) return;

    console.log(`Switching chat to: ${contact.username || contact.id}`); // Log username or ID
    setIsLoadingChat(true);
    previousRecipientRef.current = selectedRecipient;
    setSelectedRecipient(contact);

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      console.log("Closing existing WebSocket connection.");
      socketRef.current.close();
      socketRef.current = null;
      setIsSocketConnected(false);
    }
    setCurrentChatId(null);

    try {
      const chatId = await fetchOrCreateChat(contact.id);
      if (chatId) {
        setCurrentChatId(chatId);
      } else {
        console.error("Failed to fetch or create chat ID for recipient:", contact.id);
        setSelectedRecipient(previousRecipientRef.current);
        setIsLoadingChat(false);
      }
    } catch (error) {
      console.error("Error in handleSelectContact during fetchOrCreateChat:", error);
      setSelectedRecipient(previousRecipientRef.current);
      setIsLoadingChat(false);
    }
  };

  const fetchOrCreateChat = async (recipientId) => {
    console.log("--> fetchOrCreateChat called with recipientId:", recipientId);
    try {
      const response = await axios.get(`${host}/chat/private/recipient/chat-id/${recipientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.chat_id;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log("Chat not found, creating new chat.");
        const createResponse = await axios.get(`${host}/chat/private/recipient/create-chat/${recipientId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Chat created:", createResponse.data);
        return createResponse.data.chat_id;
      } else {
        console.error("Error fetching/creating chat:", error);
        return null;
      }
    }
  };

  useEffect(() => {
    if (!currentChatId || !selectedRecipient || !token) {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.close();
      }
      socketRef.current = null;
      setIsSocketConnected(false);
      if (!selectedRecipient) setIsLoadingChat(false);
      return;
    }

    console.log("Attempting to connect WebSocket for chat ID:", currentChatId);
    const wsToken = localStorage.getItem('token');
    if (!wsToken) {
      console.error("WebSocket token not found.");
      setIsLoadingChat(false);
      setIsSocketConnected(false);
      return;
    }

    const socket = new WebSocket(`${ws_host}/ws/chat/private/${currentChatId}?token=${wsToken}`);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("WebSocket connection opened for chat ID:", currentChatId);
      setIsSocketConnected(true);
      const loadOldMessages = async () => {
        try {
          console.log("Fetching messages for new chat ID:", currentChatId);
          const response = await axios.get(`${host}/chat/private/messages/${currentChatId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log("New messages fetched:", response.data);
          setMessages(response.data.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)));
        } catch (error) {
          console.error("No messages found or error fetching for new chat:", error);
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
        console.log("New message received via WebSocket:", newMessageData);
        if (socketRef.current && socketRef.current.url.includes(currentChatId)) {
          setMessages((prevMessages) => [...prevMessages, newMessageData]);
        }
      } catch (e) {
        console.error("Error parsing WebSocket message or updating state:", e, "Raw data:", event.data);
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      setIsLoadingChat(false);
      setIsSocketConnected(false);
    };

    socket.onclose = (event) => {
      console.log("WebSocket connection closed:", event.reason, event.code, "for chat ID:", currentChatId);
      setIsSocketConnected(false);
    };

    return () => {
      if (socketRef.current && socketRef.current.url.includes(currentChatId)) {
        console.log("Closing WebSocket connection from useEffect cleanup for chat ID:", currentChatId);
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [currentChatId, token]);

  const handleInputChange = (e) => {
    setMessageInput(e.target.value);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (messageInput.trim() === '' || !socketRef.current || !isSocketConnected || !selectedRecipient || isLoadingChat) {
      return;
    }
    const messageContent = messageInput;
    socketRef.current.send(JSON.stringify(messageContent));
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

  // Function to get display name
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

  const renderContactList = () => {
    if (authLoading && !user) {
      return <p className="sidebar-message">Loading contacts</p>;
    }
    if (!Array.isArray(contacts) || contacts.length === 0) {
      return <p className="sidebar-message">No contacts available.</p>;
    }

    return contacts.map((contact) => {
      const isActive = selectedRecipient?.id === contact.id;
      const initials = `${contact.first_name ? contact.first_name[0] : ''}${contact.last_name ? contact.last_name[0] : ''}`.toUpperCase() || (contact.username ? contact.username[0].toUpperCase() : 'U');

      return (
        <li
          key={contact.id}
          className={`contact-item ${isActive && !isLoadingChat ? 'active' : ''} ${isLoadingChat && selectedRecipient?.id === contact.id ? 'loading-active' : ''}`}
          onClick={() => handleSelectContact(contact)}
        >
          <div className="contact-avatar">
            {contact.avatar_url ? (
              <img src={contact.avatar_url} alt="avatar" />
            ) : (
              <span className="avatar-initials">{initials}</span>
            )}
          </div>
          <div className="contact-info">
            <span className="contact-name">{getDisplayName(contact)}</span>
            <span className="contact-status">Offline</span>
          </div>
        </li>
      );
    });
  };

  if (authLoading && !user) {
    return <div className="loading-screen">Loading...</div>;
  }

  const recipientForHeader = selectedRecipient;

  return (
    <div className="chat-page">
      <header className="chat-header">
        <div className="header-title">TriSec</div>
        <nav className="header-nav">
          <a href="/settings" className="nav-item">
            <IoSettingsOutline style={{ marginRight: '5px', verticalAlign: 'middle' }} /> Settings
          </a>
          <a href="/profile" className="nav-item">
            <CgProfile style={{ marginRight: '5px', verticalAlign: 'middle' }} /> Profile
          </a>
          <button onClick={logout} className="nav-item nav-item-logout">
            <BiLogOut style={{ marginRight: '5px', verticalAlign: 'middle' }} />
          </button>
        </nav>
      </header>

      <main className="chat-main">
        <aside className="chat-sidebar">
          <div className="sidebar-header">
            <BsPeople className="sidebar-icon" />
            <span>Contacts</span>
          </div>
          <ul className="contact-list">{renderContactList()}</ul>
        </aside>

        <section className="chat-area">
          {!recipientForHeader ? (
            <div className="welcome-chat-prompt">
              <div className="welcome-chat-icon-container">
                <BsChatDots className="welcome-chat-icon" />
              </div>
              <h2 className="welcome-chat-title">Welcome to TriSec!</h2>
              <p className="welcome-chat-subtitle">
                Select a conversation from the sidebar to start chatting
              </p>
            </div>
          ) : (
            <div className={`chat-window ${isLoadingChat ? 'chat-loading-new-conversation' : ''}`}>
              <div className="chat-window-header">
                <div className="chat-recipient-avatar">
                  {recipientForHeader.avatar_url ? (
                    <img src={recipientForHeader.avatar_url} alt="recipient avatar" />
                  ) : (
                    <span className="avatar-initials">
                      {/* MODIFIED: Consistent initials logic */}
                      {`${recipientForHeader.first_name ? recipientForHeader.first_name[0] : ''}${recipientForHeader.last_name ? recipientForHeader.last_name[0] : ''}`.toUpperCase() || (recipientForHeader.username ? recipientForHeader.username[0].toUpperCase() : 'U')}
                    </span>
                  )}
                </div>
                <div className="chat-recipient-info">
                  {/* MODIFIED: Use getDisplayName */}
                  <span className="chat-recipient-name">
                    {getDisplayName(recipientForHeader)}
                  </span>
                  <span className="chat-recipient-status">
                    {isLoadingChat ? "Connecting..." : (isSocketConnected ? "Online" : "Offline")}
                  </span>
                </div>
              </div>

              <div className="chat-messages-container">
                {messages.length > 0 ? (
                  messages.map((msg) => {
                    if (!user || !recipientForHeader) return null;
                    const isSent = msg.created_by === user.id;
                    const messageSender = isSent ? user : recipientForHeader;
                    const senderDisplayName = getDisplayName(messageSender); // Get display name for avatar initials if needed
                    
                    // Use first letter of display name for initials if full name isn't available for initials
                    const avatarInitials = (
                        (messageSender.first_name ? messageSender.first_name[0] : '') +
                        (messageSender.last_name ? messageSender.last_name[0] : '')
                    ).toUpperCase() || (senderDisplayName ? senderDisplayName[0].toUpperCase() : 'U');

                    const isExplodingHeadEmoji = msg.message === '🤯';

                    return (
                      <div
                        key={msg.id || msg.temp_id || Math.random()}
                        className={`message-row ${isSent ? "sent" : "received"}`}
                      >
                        {!isSent && (
                           <div className="chat-message-avatar">
                             {recipientForHeader.avatar_url ? <img src={recipientForHeader.avatar_url} alt={getDisplayName(recipientForHeader)}/> : <span className="avatar-initials">{avatarInitials}</span>}
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
                            {user.avatar_url ? <img src={user.avatar_url} alt={getDisplayName(user)}/> : <span className="avatar-initials">{avatarInitials}</span>}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  !isLoadingChat && <p className="no-messages">No messages yet. Say hello!</p>
                )}
                {isLoadingChat && messages.length > 0 && (
                    <div className="chat-loading-overlay"><p></p></div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <form className="message-input-form" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  value={messageInput}
                  onChange={handleInputChange}
                  placeholder={isLoadingChat ? "Loading chat..." : "Type a message..."}
                  disabled={isLoadingChat || !isSocketConnected || !selectedRecipient}
                />
                <button type="submit" disabled={isLoadingChat || !isSocketConnected || !selectedRecipient || !messageInput.trim()}>
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