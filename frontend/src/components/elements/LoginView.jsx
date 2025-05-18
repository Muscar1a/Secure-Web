import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { IoSettingsOutline } from 'react-icons/io5';
import { BsChatSquare } from 'react-icons/bs';
import { FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { MdOutlineMailOutline } from 'react-icons/md';
import { FaUserFriends, FaRegImage, FaRegCommentDots } from "react-icons/fa";
import { BsFillGrid3X3GapFill, BsGearFill } from "react-icons/bs";
import { IoNotificationsOutline, IoLocationOutline } from "react-icons/io5";
import { MdGroups, MdSearch } from "react-icons/md";

const LoginView = ({
    username,
    password,
    error,
    loading,
    setUsername,
    setPassword,
    handleSubmit
}) => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="login-page">
        <header className="header">
           <div className="logo">
             {typeof BsChatSquare !== 'undefined' && <BsChatSquare className="logo-icon" />} 
              TriSec 
           </div>
           <Link to="/settings" className="nav-item settings-button"> {/* Sử dụng class nav-item cho nhất quán nếu có và settings-button */}
             {typeof IoSettingsOutline !== 'undefined' && <IoSettingsOutline className="settings-icon" style={{ marginRight: '5px', verticalAlign: 'middle' }} />} 
             Settings
           </Link>
        </header>
  
        <main className="main-content">
          <div className="form-container">
            <h2>Welcome Back</h2>
            <p className="subtitle">Sign in to your account</p>
  
            {error && <div className="error-message">{error}</div>}
  
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label htmlFor="login-username">Username</label> 
                <div className="input-wrapper">
                   {typeof MdOutlineMailOutline !== 'undefined' && <MdOutlineMailOutline className="input-icon" />}
                   <input
                      id="login-username" 
                      name="username" 
                      type="text" 
                      placeholder="Username or Email" // Có thể cho phép nhập cả email
                      value={username} 
                      onChange={(e) => setUsername(e.target.value)} 
                      required
                   />
                </div>
              </div>
  
              <div className="input-group">
                 <label htmlFor="login-password">Password</label>
                 <div className="input-wrapper">
                    {typeof FiLock !== 'undefined' && <FiLock className="input-icon" />} 
                    <input
                      id="login-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}  
                      placeholder="••••••••"
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    {showPassword ? (
                        <FiEyeOff className="password-toggle" onClick={togglePasswordVisibility} title="Hide password" />
                    ) : (
                        <FiEye className="password-toggle" onClick={togglePasswordVisibility} title="Show password" />
                    )}
                 </div>
              </div>
              
              {/* THÊM LINK QUÊN MẬT KHẨU Ở ĐÂY */}
              <div className="forgot-password-link">
                <Link to="/forgot-password">Forgot Password?</Link>
              </div>
  
              <button type="submit" className="submit-button" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
  
            <div className="signup-link">
              Don't have an account? <Link to="/register">Create account</Link>
            </div>
          </div> 
          <div className="community-container">
            <div className="community-grid">
              <div className="community-item"><FaUserFriends /></div>
              <div className="community-item"><FaRegCommentDots /></div>
              <div className="community-item"><FaRegImage /></div>
              <div className="community-item"><IoNotificationsOutline /></div>
              <div className="community-item"><BsGearFill /></div>
              <div className="community-item"><MdGroups /></div>
              <div className="community-item"><MdSearch /></div>
              <div className="community-item"><IoLocationOutline /></div>
              <div className="community-item"><BsFillGrid3X3GapFill /></div>
            </div>
            <h3>Welcome back!</h3> 
            <p>Sign in to continue your journey with us and reconnect with your community.</p>
          </div>
  
        </main> 
      </div> 
    );
  
};

export default LoginView;