import React, { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext'; // Make sure this path is correct
import './ChatPage.css'; // Import the CSS styles

import { BsChatSquare, BsPeople } from "react-icons/bs"; // Added BsPeople for contacts icon
import { IoSettingsOutline } from "react-icons/io5";
import { CgProfile } from "react-icons/cg";
import { BiLogOut } from "react-icons/bi";

const ChatPage = () => {

  const { user, logout } = useContext(AuthContext);

  const renderContactList = () => {
    // const [contacts, setContacts] = useState([]);
    // const [isLoading, setIsLoading] = useState(true);
    // const [error, setError] = useState(null);

    // For now, just show a placeholder message:
    return <div className="sidebar-message">No contacts available.</div>;
  };

  return (
    // Use the main container class from CSS
    <div className="chat-page">

      <header className="chat-header">
        <div className="header-title">
          <BsChatSquare style={{ marginRight: '8px', verticalAlign: 'middle' }} /> {/* Icon before title */}
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
            {/* Render the contact list (currently shows placeholder) */}
            {renderContactList()}
          </ul>
        </aside>

        <section className="chat-area">
          <div className="welcome-message">
            <div className="welcome-icon">
              <BsChatSquare /> 
            </div>
            <h2 className="welcome-title">Welcome to TriSec!</h2>
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