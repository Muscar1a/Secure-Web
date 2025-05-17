import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import { host } from '../../utils/APIRoutes'; // Đảm bảo đường dẫn đúng
import './ForgotPasswordPage.css'; // Sẽ tạo file này
import { IoSettingsOutline } from 'react-icons/io5'; // Icon Settings
import { BsChatSquare } from 'react-icons/bs'; // Icon logo
import { MdOutlineMailOutline } from 'react-icons/md';
import { FiLock, FiEye, FiEyeOff, FiKey } from 'react-icons/fi'; // Thêm FiKey cho token

const ForgotPasswordPage = () => {
  const [mode, setMode] = useState('request');
  const [email, setEmail] = useState('');
  const [token, setTokenState] = useState(''); 
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const navigate = useNavigate();
  const { urlToken } = useParams(); 
  const location = useLocation(); 

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const tokenFromQuery = queryParams.get('token');

    if (urlToken) { 
      setTokenState(urlToken);
      setMode('reset');
    } else if (tokenFromQuery) { 
      setTokenState(tokenFromQuery);
      setMode('reset');
    }
  }, [urlToken, location.search]);


  const handleRequestResetSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);
    try {
      const response = await axios.post(`${host}/auth/request-password-reset`, { email });
      setSuccessMessage(response.data.msg || "If that email is registered, you’ll receive reset instructions.");
    } catch (err) {
      console.error('Request password reset error:', err.response?.data || err.message);
      setError(err.response?.data?.detail || 'Failed to request password reset. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (newPassword !== confirmNewPassword) {
      setError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 8) { 
        setError('Password must be at least 8 characters long.');
        return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${host}/auth/reset-password`, {
        token: token, 
        new_password: newPassword,
      });
      setSuccessMessage(response.data.msg || "Password has been reset successfully.");
      setTimeout(() => {
        navigate('/login', { state: { message: 'Password reset successfully! Please login with your new password.' } });
      }, 3000); 
    } catch (err) {
      console.error('Reset password error:', err.response?.data || err.message);
      setError(err.response?.data?.detail || 'Failed to reset password. The token might be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">
      <header className="header">
        <Link to="/login" className="logo-link">
          <div className="logo">
            <BsChatSquare className="logo-icon" />
             TriSec         
             </div>
        </Link>
        <Link to="/settings" className="settings-link-wrapper">
          <button className="settings-button" type="button">
            <IoSettingsOutline className="settings-icon" />
            Settings
          </button>
        </Link>
      </header>

      <main className="main-content">
        <div className="form-container">
          {mode === 'request' && (
            <>
              <h2>Forgot Password?</h2>
              <p className="subtitle">Enter your email to receive reset instructions.</p>
              {error && <div className="error-message">{error}</div>}
              {successMessage && <div className="success-message">{successMessage}</div>}
              <form onSubmit={handleRequestResetSubmit}>
                <div className="input-group">
                  <label htmlFor="email">Email Address</label>
                  <div className="input-wrapper">
                    <MdOutlineMailOutline className="input-icon" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
                <button type="submit" className="submit-button" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
              <div className="form-link">
                Remembered your password? <Link to="/login">Sign In</Link>
              </div>
            </>
          )}

          {mode === 'reset' && (
            <>
              <h2>Reset Your Password</h2>
              <p className="subtitle">Enter the token from your email and your new password.</p>
              {error && <div className="error-message">{error}</div>}
              {successMessage && <div className="success-message">{successMessage}</div>}
              <form onSubmit={handleResetPasswordSubmit}>
                <div className="input-group">
                  <label htmlFor="reset-token">Reset Token</label>
                  <div className="input-wrapper">
                    <FiKey className="input-icon" />
                    <input
                      id="reset-token"
                      name="token"
                      type="text"
                      placeholder="Enter token from email"
                      value={token}
                      onChange={(e) => setTokenState(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label htmlFor="new-password">New Password</label>
                  <div className="input-wrapper">
                    <FiLock className="input-icon" />
                    <input
                      id="new-password"
                      name="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                    {showNewPassword ? (
                      <FiEyeOff className="password-toggle" onClick={() => setShowNewPassword(!showNewPassword)} />
                    ) : (
                      <FiEye className="password-toggle" onClick={() => setShowNewPassword(!showNewPassword)} />
                    )}
                  </div>
                </div>

                <div className="input-group">
                  <label htmlFor="confirm-new-password">Confirm New Password</label>
                  <div className="input-wrapper">
                    <FiLock className="input-icon" />
                    <input
                      id="confirm-new-password"
                      name="confirmNewPassword"
                      type={showConfirmNewPassword ? 'text' : 'password'}
                      placeholder="Confirm new password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                    {showConfirmNewPassword ? (
                      <FiEyeOff className="password-toggle" onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)} />
                    ) : (
                      <FiEye className="password-toggle" onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)} />
                    )}
                  </div>
                </div>
                <button type="submit" className="submit-button" disabled={loading}>
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
               <div className="form-link">
                Suddenly remembered? <Link to="/login">Sign In</Link>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default ForgotPasswordPage;