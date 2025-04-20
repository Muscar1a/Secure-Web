import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../contexts/AuthContext';
import { IoSettingsOutline } from "react-icons/io5";
import { BsChatSquareText, BsChatSquare } from "react-icons/bs";
import { MdOutlineMailOutline } from "react-icons/md";
import { FiLock, FiEye } from "react-icons/fi";
import './LoginPage.css'
import { FaUserFriends, FaRegImage, FaRegCommentDots } from "react-icons/fa";
import { BsFillGrid3X3GapFill, BsGearFill } from "react-icons/bs";
import { IoNotificationsOutline, IoLocationOutline } from "react-icons/io5";
import { MdGroups, MdSearch } from "react-icons/md";

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuthState } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      //format to FormData to work with FastAPI
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);

      const response = await axios.post('http://localhost:8000/token', formData);
      
      //save token to localStorage
      localStorage.setItem('token', response.data.access_token);
      
      //update auth context
      setAuthState({
        isAuthenticated: true,
        token: response.data.access_token,
        loading: false
      });

      //get user
      const userResponse = await axios.get('http://localhost:8000/users/me', {
        headers: {
          'Authorization': `Bearer ${response.data.access_token}`
        }
      });

      //save user info
      localStorage.setItem('user', JSON.stringify(userResponse.data));
      
      //back to chat page
      navigate('/chat');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.detail || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="login-page">
      <header className="header">
         <div className="logo">
           {typeof BsChatSquare !== 'undefined' && <BsChatSquare className="logo-icon" />} 
            TriSec
         </div>
         <button className="settings-button">
           {typeof IoSettingsOutline !== 'undefined' && <IoSettingsOutline className="settings-icon" />} 
            Settings
         </button>
      </header>

      <main className="main-content">
        <div className="form-container">
          <div className="form-icon-container">
            {typeof BsChatSquareText !== 'undefined' && <BsChatSquareText className="form-icon" />} 
          </div>
          <h2>Welcome Back</h2>
          <p className="subtitle">Sign in to your account</p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="login-username">Email</label> 
              <div className="input-wrapper">
                 {typeof MdOutlineMailOutline !== 'undefined' && <MdOutlineMailOutline className="input-icon" />} {/* Email Icon */}
                 <input
                    id="login-username" 
                    name="username" 
                    type="text" 
                    placeholder="john@email.com"
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    required
                    autoComplete="username"
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
                    type="password" 
                    placeholder="••••••••"
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required
                    autoComplete="current-password"
                  />
                  {typeof FiEye !== 'undefined' && <FiEye className="password-toggle" title="Show password (requires code change)" />}
               </div>
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
        </div>

      </main> 
    </div> 
  );

};

export default Login;
