import React, { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import './ChatPage.css';
import { BsChatSquare, BsPeople } from "react-icons/bs";
import { IoSettingsOutline } from "react-icons/io5";
import { CgProfile } from "react-icons/cg";
import { BiLogOut } from "react-icons/bi";

const ChatPage = () => {
  const { user, logout, loading } = useContext(AuthContext);

  const renderContactList = () => {
    return <div className="sidebar-message">No contacts available.</div>;
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
            <label htmlFor="show-online">Show online only (0 online)</label>
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
              Welcome to TriSec{user ? `, ${userName}` : ''}!
            </h2>
            <p className="welcome-instruction">
              Select a conversation from the sidebar to start chatting
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ChatPage;