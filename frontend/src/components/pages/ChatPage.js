import React, { use, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import './ChatPage.css';
import { BsChatSquare, BsPeople } from "react-icons/bs";
import { IoSettingsOutline } from "react-icons/io5";
import { CgProfile } from "react-icons/cg";
import { BiLogOut } from "react-icons/bi";
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { host } from '../../utils/APIRoutes';
import axios from 'axios';
import { allUsersRoute } from '../../utils/APIRoutes';
import Contacts from '../elements/Contacts';

import ChatContainer from '../elements/ChatContainer';
import Welcome from '../elements/Welcome';


const ChatPage = () => {
  const { user, logout, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const socket = useRef();
  const [contacts, setContacts] = React.useState([]);
  const [currentUser, setCurrentUser] = React.useState(undefined);
  const [currentChat, setCurrentChat] = React.useState(undefined);

  // console.log('Before contacts:', typeof contacts);
  useEffect(() => {
    const checkUser = async () => {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        navigate("/login");
      } else {
        setCurrentUser(JSON.parse(storedUser));
      }
    };

    checkUser();
  }, []);


  useEffect(() => {
    if (currentUser) {
      socket.current = io(host, {
        path: "/socket.io",
        transports: ["websocket", "polling"]
      });
      socket.current.emit("add-user", currentUser._id);

      // Listen for user-connected event to update contacts
      socket.current.on("user-connected", (userData) => {
        setContacts((prevContacts) => {
          // Avoid duplicates by checking if user already exists
          if (!prevContacts.some(contact => contact._id === userData._id)) {
            return [...prevContacts, userData];
          }
          return prevContacts;
        });
      });

      return () => {
        if (socket.current) {
          socket.current.disconnect();
        }
      };

    }
    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [currentUser]);


  useEffect(() => {
    const fetchContacts = async () => {
      if (currentUser) {
        const response = await axios.get(`${allUsersRoute}/${currentUser.id}`);
        // console.log('API response:', response.data);
        setContacts(response.data.users);
      }
    };
    fetchContacts();
  }, [currentUser]);

  const handleChatChange = (chat) => {
    setCurrentChat(chat);
  };

  // console.log('Contacts:', contacts);
  const renderContactList = () => {
    if (contacts.length === 0) {
      return <div className="sidebar-message">No contacts available.</div>;
    }

    return (
      <Contacts
        contacts={contacts}
        currentUser={currentUser}
        changeChat={handleChatChange}
      />
    );

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
            {renderContactList()}
          </ul>
        </aside>

        <section className="chat-area">
          <div className="welcome-message">
            <div className="welcome-icon">
              <BsChatSquare />
            </div>
            <h2 className="welcome-title">
              {currentChat === undefined ? (
                <Welcome />
              ) : (
                <ChatContainer currentChat={currentChat} socket={socket} />
              )}
              
              {/* Welcome to TriSec{user ? `, ${userName}` : ''}! */}
            </h2>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ChatPage;