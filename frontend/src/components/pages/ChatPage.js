import React, { useContext, useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../../contexts/AuthContext';
import './ChatPage.css';
import { host, ws_host } from '../../utils/APIRoutes';
import { BsChatSquare, BsPeople, BsChatDots } from 'react-icons/bs';
import { IoSettingsOutline } from 'react-icons/io5';
import { CgProfile } from 'react-icons/cg';
import { BiLogOut } from 'react-icons/bi';
import { generateAESKeyAndIV, encryptMessageWithAES, encryptAESKeyWithRSA } from '../../utils/Encryption';
import { decryptPrivateKey, decryptAESKeyWithPrivateKey, decryptMessageWithAES } from '../../utils/Decryption';
import { Link } from 'react-router-dom';
import forge from 'node-forge';



const ChatPage = () => {
  const { user, token, logout, loading: authLoading } = useContext(AuthContext);

  const [contacts, setContacts] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [isSocketConnected, setIsSocketConnected] = useState();

  // ========== For E2EE purpose ==========
  const [isPasswordVerified, setIsPasswordVerified] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(true);
  const [EE2EInput, setEE2EInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  // ========== For E2EE purpose ==========

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  


  // username lookup
  const [lookupUsername, setLookupUsername]   = useState("");
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
    // 1) Try the “already exists” route
    const response = await axios.get(
      `${host}/chat/private/recipient/chat-id/${recipientId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log("Fetched existing chat ID:", response.data.chat_id);
    return response.data.chat_id;
  } catch (error) {
    // 2) Not found → create one
    if (error.response?.status === 404) {
      console.log("Chat not found, creating new chat via GET (as per original).");
      const createResponse = await axios.get(
        `${host}/chat/private/recipient/create-chat/${recipientId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Chat created (via GET):", createResponse.data);

      // **PICK THE NESTED chat_id**
      const newChatId = createResponse.data.chat.chat_id;
      console.log("Extracted new chat ID:", newChatId);
      return newChatId;
    }

    // any other error, rethrow
    console.error("Error fetching/creating chat:", error.response?.data || error.message);
    throw error;
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
          // console.log("New messages fetched:", response.data);
          // setMessages(response.data.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)));
          // console.log("[-] response.data:", response);
          const myEncryptedPrivateKeyPem = user.private_key_pem;
          const myPublicKeyPem = user.public_key_pem;
          const myPrivateKeyPem = decryptPrivateKey(myEncryptedPrivateKeyPem, EE2EInput);

          const decryptedMessages = await Promise.all(
            response.data.map(async (msg) => {
              try {
                const encryptedKey = msg.created_by === user.id
                  ? msg.encrypted_key_sender
                  : msg.encrypted_key_receiver;

                const aesKey = decryptAESKeyWithPrivateKey(encryptedKey, myPrivateKeyPem);
                const plaintext = decryptMessageWithAES(msg.message, aesKey, msg.iv);

                // console.log("Decrypted message:", plaintext);
                return {
                  ...msg,
                  message: plaintext,
                };
              } catch (error) {
                console.error("Error decrypting message:", error);
                return msg; // Return the original message if decryption fails
              };
            })
          )
          const sortedMessages = decryptedMessages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
          setMessages(sortedMessages);
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
      const myEncryptedPrivateKeyPem = user.private_key_pem;
      const myPublicKeyPem = user.public_key_pem;
      const myPrivateKeyPem = decryptPrivateKey(myEncryptedPrivateKeyPem, EE2EInput);

      const data = JSON.parse(event.data);

      try {
        const encryptedAESKey = (data.created_by === user.id)
          ? data.encrypted_key_sender
          : data.encrypted_key_receiver;

        const aesKey = decryptAESKeyWithPrivateKey(encryptedAESKey, myPrivateKeyPem);
        // console.log("Decrypted AES key:", aesKey);
        const plaintext = decryptMessageWithAES(data.message, aesKey, data.iv);
        // console.log("Decrypted message:", plaintext);
        if (socketRef.current && socketRef.current.url.includes(currentChatId)) {
          setMessages((prevMessages) => [...prevMessages, {
            ...data,
            message: plaintext,
            created_at: new Date(data.created_at).toISOString(),
          }]);
        }
      }
      catch (error) {
        console.error("Error parsing message data:", error);
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


  // ========== For E2EE purpose ==========
  const verifyPassword = () => {
    setIsPasswordVerified(true);
    setShowPasswordModal(false);
    setPasswordError("");
  };
  // ========== For E2EE purpose ==========

  const handleInputChange = (e) => {
    setMessageInput(e.target.value);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (messageInput.trim() === '' || !socketRef.current || !isSocketConnected || !selectedRecipient || isLoadingChat || !currentChatId) {
      return;
    }
    // const messageContent = messageInput;
    try {
      const messageContent = messageInput;

      const { key: aesKey, iv } = generateAESKeyAndIV();

      const receiverPublicKeyPem = selectedRecipient.public_key_pem;

      const myPublicKeyPem = user.public_key_pem;
      const myEncryptedPrivateKeyPem = user.private_key_pem;
      const myPrivateKeyPem = decryptPrivateKey(myEncryptedPrivateKeyPem, EE2EInput);
      // console.log("myPrivateKeyPem", myPrivateKeyPem);

      if (!receiverPublicKeyPem || !myPrivateKeyPem || !myPublicKeyPem) {
        console.error("Missing keys");
        return;
      }
      // Encrypt with AES
      const cipherText = encryptMessageWithAES(messageContent, aesKey, iv);
      // Encrypt AES with RSA
      const encryptedKeyForReceiver = encryptAESKeyWithRSA(aesKey, receiverPublicKeyPem);
      const encryptedKeyForSender = encryptAESKeyWithRSA(aesKey, myPublicKeyPem);

      const messagePayload = {
        message: cipherText,
        encrypted_key_sender: encryptedKeyForSender,
        encrypted_key_receiver: encryptedKeyForReceiver,
        iv: forge.util.bytesToHex(iv),
        created_by: user.id,
        id: currentChatId,
      }


      socketRef.current.send(JSON.stringify(messagePayload));
      setMessageInput('');
    } catch (error) {
      console.error("Error sending message:", error);
    }
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

        {!isPasswordVerified && showPasswordModal ? (
          <div className="welcome-chat-prompt">
            <div className="welcome-chat-icon-container">
              <BsChatDots className="welcome-chat-icon" />
            </div>
            <h2 className="welcome-chat-title">Re-enter Password for E2EE</h2>
            <input
              type="password"
              value={EE2EInput}
              onChange={(e) => setEE2EInput(e.target.value)}
              placeholder="Enter your password"
              style={{
                backgroundColor: "var(--input-bg-color)",
                color: "var(--text-color)",
                border: "1px solid var(--input-border-color)",
                borderRadius: "6px",
                padding: "10px",
                width: "100%",
                maxWidth: "300px",
                marginBottom: "10px",
              }}
            />
            {passwordError && <p style={{ color: 'red', marginBottom: '10px' }}>{passwordError}</p>}
            <button
              onClick={verifyPassword}
              className="message-input-form-button"
              style={{
                backgroundColor: "var(--button-primary-bg)",
                color: "var(--button-primary-text)",
                border: "none",
                padding: "10px 20px",
                borderRadius: "20px",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "0.9em",
              }}
            >
              Verify
            </button>
          </div>
        ) : (
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
                          // key={msg.id || msg.temp_id || Math.random()}
                          key={msg.id}
                          className={`message-row ${isSent ? "sent" : "received"}`}
                        >
                          {!isSent && (
                            <div className="chat-message-avatar">
                              {recipientForHeader.avatar_url ? <img src={recipientForHeader.avatar_url} alt={getDisplayName(recipientForHeader)} /> : <span className="avatar-initials">{avatarInitials}</span>}
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
                              {user.avatar_url ? <img src={user.avatar_url} alt={getDisplayName(user)} /> : <span className="avatar-initials">{avatarInitials}</span>}
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
        )}
      </main>
    </div>
  );
};

export default ChatPage;