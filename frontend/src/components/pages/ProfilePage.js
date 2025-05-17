import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import './ProfilePage.css';
import { FaUser, FaEnvelope, FaCalendarAlt } from 'react-icons/fa';
import { IoArrowBack } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const { user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (user) {
      setCurrentUser(user);
    }
  }, [user]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return dateString.split('T')[0]; 
    } catch (e) {
      return dateString;
    }
  };
  
  const memberSinceDate = currentUser?.created_at ? formatDate(currentUser.created_at) : 'N/A';

  const goBack = () => {
    navigate(-1);
  };

  if (authLoading || !currentUser) {
    return <div className="profile-loading">Loading profile...</div>;
  }

  const displayName = (currentUser.first_name && currentUser.last_name) 
                      ? `${currentUser.first_name} ${currentUser.last_name}` 
                      : currentUser.username || "User";
  
  return (
    <div className="profile-page-container">
      <div className="profile-page-header">
        <button onClick={goBack} className="profile-back-button">
          <IoArrowBack /> Back
        </button>
      </div>

      <div className="profile-card">
        <h2 className="profile-title-main">Profile</h2>
        <p className="profile-subtitle">Your profile information</p>

        <div className="profile-avatar-section">
          <div className="profile-avatar-wrapper view-only">
            <img 
              src={currentUser.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random&size=128&font-size=0.5&bold=true&color=fff`} 
              alt="Profile Avatar" 
              className="profile-avatar-img"
            />
          </div>
        </div>

        <div className="profile-info-group">
          <label htmlFor="fullName"><FaUser className="profile-info-icon" /> Full Name</label>
          <input type="text" id="fullName" value={displayName} readOnly />
        </div>

        <div className="profile-info-group">
          <label htmlFor="emailAddress"><FaEnvelope className="profile-info-icon" /> Email Address</label>
          <input type="text" id="emailAddress" value={currentUser.email || "N/A"} readOnly />
        </div>

        <div className="profile-account-info-section">
          <h3 className="profile-section-title">Account Details</h3>
          <div className="profile-account-info-item">
            <span><FaCalendarAlt className="profile-info-icon" /> Member Since</span>
            <span>{memberSinceDate}</span>
          </div>
          <div className="profile-account-info-item">
            <span>Username</span>
            <span>{currentUser.username || "N/A"}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;