import React, { useContext, useState, useEffect, useRef } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { ThemeContext } from '../../contexts/ThemeContext'; // Nếu bạn dùng nút Back có style theme
import axios from 'axios';
import { host } from '../../utils/APIRoutes';
import './ProfilePage.css';
import { FaCamera, FaUser, FaEnvelope, FaCalendarAlt, FaPencilAlt } from 'react-icons/fa';
import { IoArrowBack } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const { user, token, updateUserContext, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [newAvatarFile, setNewAvatarFile] = useState(null);
  const [previewAvatarUrl, setPreviewAvatarUrl] = useState(null);
  const [description, setDescription] = useState('');
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setCurrentUser(user);
      setPreviewAvatarUrl(user.avatar_url || null);
      setDescription(user.description || '');
    }
  }, [user]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewAvatarFile(file);
      setPreviewAvatarUrl(URL.createObjectURL(file));
      setError('');
      setSuccessMessage('');
    }
  };

  const handleAvatarUpload = async () => {
    if (!newAvatarFile) {
      setError("Please select an image file first.");
      return;
    }
    if (!currentUser || !token) {
      setError("User not authenticated.");
      return;
    }
    setIsLoading(true);
    setError('');
    setSuccessMessage('');
    const formData = new FormData();
    formData.append('avatar', newAvatarFile);

    try {
      const response = await axios.put(`${host}/users/me/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      const updatedUserPartial = response.data; // Giả sử API trả về { avatar_url: "new_url" }
      updateUserContext(updatedUserPartial); // Cập nhật context
      setCurrentUser(prev => ({ ...prev, ...updatedUserPartial }));
      setPreviewAvatarUrl(updatedUserPartial.avatar_url);
      setNewAvatarFile(null);
      setSuccessMessage('Avatar updated successfully!');
    } catch (err) {
      console.error("Avatar upload failed:", err.response?.data?.detail || err.message);
      setError(err.response?.data?.detail || "Avatar upload failed.");
      setPreviewAvatarUrl(currentUser.avatar_url || null); // Revert preview
    } finally {
      setIsLoading(false);
    }
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const handleSaveDescription = async () => {
    if (!currentUser || !token) {
      setError("User not authenticated.");
      return;
    }
    setIsLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      const response = await axios.post(`${host}/users/me/description`, 
        { description: description }, 
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const updatedUserPartial = response.data; // Giả sử API trả về { description: "new_desc" }
      updateUserContext(updatedUserPartial);
      setCurrentUser(prev => ({ ...prev, ...updatedUserPartial }));
      setIsEditingDescription(false);
      setSuccessMessage('Description updated successfully!');
    } catch (err) {
      console.error("Description update failed:", err.response?.data?.detail || err.message);
      setError(err.response?.data?.detail || "Failed to update description.");
    } finally {
      setIsLoading(false);
    }
  };


  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      // API của bạn đang trả về 'YYYY-MM-DD', không cần toLocaleDateString phức tạp
      return dateString.split('T')[0]; // Lấy phần YYYY-MM-DD
    } catch (e) {
      return dateString;
    }
  };
  
  const memberSinceDate = currentUser?.created_at ? formatDate(currentUser.created_at) : formatDate(new Date().toISOString().split('T')[0]);

  const goBack = () => {
    navigate(-1); // Hoặc navigate('/chat')
  };

  if (authLoading || !currentUser) { 
    return <div className="profile-loading">Loading profile...</div>;
  }

  const displayName = (currentUser.first_name && currentUser.last_name) 
                      ? `${currentUser.first_name} ${currentUser.last_name}` 
                      : currentUser.username || "User";
  
  const avatarFallbackInitial = displayName ? displayName[0].toUpperCase() : "U";


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

        {error && <p className="profile-message error">{error}</p>}
        {successMessage && <p className="profile-message success">{successMessage}</p>}

        <div className="profile-avatar-section">
          <div className="profile-avatar-wrapper">
            <img 
              src={previewAvatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random&size=128&font-size=0.5&bold=true&color=fff`} 
              alt="Profile Avatar" 
              className="profile-avatar-img"
            />
            <button 
              className="profile-avatar-edit-button" 
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              disabled={isLoading}
              title="Change photo"
            >
              <FaCamera />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept="image/png, image/jpeg, image/gif"
              onChange={handleAvatarChange}
              disabled={isLoading}
            />
          </div>
          <p className="profile-avatar-caption">Click the camera icon to update your photo</p>
          {newAvatarFile && (
            <button 
              onClick={handleAvatarUpload} 
              className="profile-action-button save-avatar"
              disabled={isLoading}
            >
              {isLoading ? 'Saving Photo...' : 'Save Photo'}
            </button>
          )}
        </div>

        <div className="profile-info-group">
          <label htmlFor="fullName"><FaUser className="profile-info-icon" /> Full Name</label>
          <input type="text" id="fullName" value={displayName} readOnly />
        </div>

        <div className="profile-info-group">
          <label htmlFor="emailAddress"><FaEnvelope className="profile-info-icon" /> Email Address</label>
          <input type="text" id="emailAddress" value={currentUser.email || "N/A"} readOnly />
        </div>

        <div className="profile-info-group">
          <div className="description-header">
            <label htmlFor="description"><FaPencilAlt className="profile-info-icon" /> Description about you</label>
            {!isEditingDescription ? (
                <button onClick={() => setIsEditingDescription(true)} className="edit-description-button" disabled={isLoading}>
                    Edit
                </button>
            ) : (
                <button onClick={handleSaveDescription} className="profile-action-button save-description" disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Save'}
                </button>
            )}
          </div>
          {isEditingDescription ? (
            <textarea
              id="description"
              value={description}
              onChange={handleDescriptionChange}
              placeholder="Tell us something about yourself..."
              rows="4"
              disabled={isLoading}
            ></textarea>
          ) : (
            <p className="description-text">{description || "No description provided."}</p>
          )}
           {isEditingDescription && (
             <button onClick={() => {setIsEditingDescription(false); setDescription(currentUser.description || '');}} className="cancel-edit-button" disabled={isLoading}>
                Cancel
            </button>
           )}
        </div>


        <div className="profile-account-info-section">
          <h3 className="profile-section-title">Account Details</h3>
          <div className="profile-account-info-item">
            <span><FaCalendarAlt className="profile-info-icon" /> Member Since</span>
            <span>{memberSinceDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;