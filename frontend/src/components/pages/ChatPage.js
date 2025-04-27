import React, { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext'; // Make sure this path is correct
import './ChatPage.css'; // Import the CSS styles

// Import the icons you are using
import { BsChatSquare, BsPeople } from "react-icons/bs"; // Added BsPeople for contacts icon
import { IoSettingsOutline } from "react-icons/io5";
import { CgProfile } from "react-icons/cg";
import { BiLogOut } from "react-icons/bi";

const ChatPage = () => {
  // Get user and logout function from context
  // 'user' object might be useful later (e.g., showing username)
  const { user, logout } = useContext(AuthContext);

  // Placeholder function for rendering contacts - replace with actual data fetching/state later
  const renderContactList = () => {
    // In a real app, you'd fetch contacts and map over them here.
    // Example states you might need:
    // const [contacts, setContacts] = useState([]);
    // const [isLoading, setIsLoading] = useState(true);
    // const [error, setError] = useState(null);

    // For now, just show a placeholder message:
    return <div className="sidebar-message">No contacts available.</div>;
  };

  return (
    // Use the main container class from CSS
    <div className="chat-page">

      {/* Header section */}
      <header className="chat-header">
        {/* Title */}
        <div className="header-title">
          <BsChatSquare style={{ marginRight: '8px', verticalAlign: 'middle' }} /> {/* Icon before title */}
          Chatty
        </div>

        {/* Navigation items */}
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

      {/* Main content area (sidebar + chat area) */}
      <main className="chat-main">

        {/* Sidebar section */}
        <aside className="chat-sidebar">
          <div className="sidebar-header">
            <BsPeople className="sidebar-icon" /> {/* Contacts Icon */}
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

        {/* Chat Area section */}
        <section className="chat-area">
          {/* Default Welcome Message */}
          <div className="welcome-message">
            <div className="welcome-icon">
              <BsChatSquare /> {/* Use chat icon */}
            </div>
            <h2 className="welcome-title">Welcome to Chatty!</h2>
             {/* You could optionally display the username here if available */}
             {/* user && <p>Logged in as {user.username || 'user'}</p> */}
            <p className="welcome-instruction">
              Select a conversation from the sidebar to start chatting
            </p>
          </div>
          {/* Later, you'll conditionally render the actual chat window here */}
        </section>

      </main>
    </div>
  );
};

export default ChatPage;