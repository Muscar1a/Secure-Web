import React, { useContext } from 'react';
import { ThemeContext } from '../../contexts/ThemeContext';
import './Settings.css';
import { useNavigate } from 'react-router-dom';
import { IoArrowBack, IoCheckmarkCircleOutline, IoCloseCircleOutline } from 'react-icons/io5';
import { themes as themeList } from '../../utils/themeUtils';

const SettingsPage = () => {
  const { currentTheme, selectedPreviewTheme, previewTheme, applySelectedTheme, cancelPreviewTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const handleThemePreview = (themeName) => {
    previewTheme(themeName);
  };

  const handleApplyTheme = () => {
    applySelectedTheme();
  };

  const handleCancelThemeSelection = () => {
    cancelPreviewTheme();
  };
  
  const goBack = () => {
    if (selectedPreviewTheme !== currentTheme) {
        cancelPreviewTheme();
    }
    navigate(-1);
  };

  const previewMessageReceived = {
    sender: { name: "John Doe", avatarInitial: "J" },
    text: "Hey! How's it going?",
    time: "12:00 PM",
    isSent: false,
  };
  const previewMessageSent = {
    sender: { name: "You", avatarInitial: "Y" },
    text: "I'm doing great! Just working on some new features.",
    time: "12:00 PM",
    isSent: true,
  };

  const previewWrapperClass = `chat-preview-area-wrapper preview-theme-${selectedPreviewTheme}`;

  return (
    <div className="settings-page-container">
      <div className="settings-page-header">
        <button onClick={goBack} className="settings-back-button">
          <IoArrowBack /> Back
        </button>
      </div>

      <div className="settings-content">
        <h3 className="settings-section-title">Theme</h3>
        <p className="settings-section-subtitle">Choose a theme for your chat interface</p>

        <div className="theme-selector-grid">
          {Object.keys(themeList).map((themeKey) => {
            const theme = themeList[themeKey];
            return (
              <div
                key={themeKey}
                className={`theme-option ${selectedPreviewTheme === themeKey ? 'preview-active' : ''} ${currentTheme === themeKey ? 'currently-applied' : ''}`}
                onClick={() => handleThemePreview(themeKey)}
                title={theme.name}
              >
                <div className="theme-preview-colors">
                  {theme.previewColors.map((color, index) => (
                    <div
                      key={index}
                      className="theme-preview-color-swatch"
                      style={{ backgroundColor: color }}
                    ></div>
                  ))}
                </div>
                <span className="theme-name">{theme.name}</span>
              </div>
            );
          })}
        </div>
        
        {selectedPreviewTheme !== currentTheme && (
            <div className="theme-apply-actions">
                <button onClick={handleApplyTheme} className="apply-theme-button">
                    <IoCheckmarkCircleOutline /> Apply Theme
                </button>
                <button onClick={handleCancelThemeSelection} className="cancel-theme-button">
                    <IoCloseCircleOutline /> Cancel
                </button>
            </div>
        )}

        <h3 className="settings-section-title preview-title-section">Preview</h3>
        <div className={previewWrapperClass}> 
            <div className="chat-preview-area">
                <div className="preview-chat-window">
                    <div className="preview-chat-header">
                        <div className="preview-avatar-placeholder">{previewMessageReceived.sender.avatarInitial}</div>
                        <div className="preview-recipient-info">
                            <span className="preview-recipient-name">{previewMessageReceived.sender.name}</span>
                            <span className="preview-recipient-status">Online</span>
                        </div>
                    </div>
                    <div className="preview-message-row received">
                        <div className="preview-avatar-placeholder">{previewMessageReceived.sender.avatarInitial}</div>
                        <div className="preview-message-bubble received-bubble">
                            <p>{previewMessageReceived.text}</p>
                            <span className="preview-message-timestamp">{previewMessageReceived.time}</span>
                        </div>
                    </div>
                    <div className="preview-message-row sent">
                        <div className="preview-message-bubble sent-bubble">
                            <p>{previewMessageSent.text}</p>
                            <span className="preview-message-timestamp">{previewMessageSent.time}</span>
                        </div>
                        <div className="preview-avatar-placeholder">{previewMessageSent.sender.avatarInitial}</div>
                    </div>
                    <div className="preview-message-input-form">
                        <input type="text" placeholder="Type a message..." readOnly/>
                        <button>Send</button>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;