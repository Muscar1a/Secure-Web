import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './RegisterPage.css'; 

import { IoSettingsOutline } from "react-icons/io5";      
import { BsGrid3X3GapFill, BsChatSquareDots } from "react-icons/bs"; 
import { FaRegUser } from "react-icons/fa";                 
import { MdOutlineMailOutline } from "react-icons/md";     
import { FiLock, FiEye, FiEyeOff } from "react-icons/fi";   
import { FaUserFriends, FaRegImage, FaRegCommentDots } from "react-icons/fa";
import { BsFillGrid3X3GapFill, BsGearFill } from "react-icons/bs";
import { IoNotificationsOutline, IoLocationOutline } from "react-icons/io5";
import { MdGroups, MdSearch } from "react-icons/md";


const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); 
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); 
  const navigate = useNavigate();

  const { username, email, password, confirmPassword } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    //check matching pass
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/register', { 
        username,
        email,
        password
      });

      console.log('Registration successful:', response.data);

      //back to login page
      navigate('/login', { state: { message: 'Registration successful! Please login.' } });
    } catch (err) {
      console.error('Registration error:', err);
      // Try to get a more specific error message from the backend response
      const errorMessage = err.response?.data?.detail || err.response?.data?.message || err.message || 'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page"> 
      <header className="header">
         <div className="logo">
           <BsGrid3X3GapFill className="logo-icon" /> 
            TriSec
         </div>
         <button className="settings-button">
           <IoSettingsOutline className="settings-icon" /> 
         </button>
      </header>

      <main className="main-content">
        <div className="form-container">
          <div className="form-icon-container">
             <BsChatSquareDots className="form-icon" /> 
          </div>
          <h2>Create Account</h2>
          <p className="subtitle">Get started with your free account</p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="username">Username</label>
              <div className="input-wrapper">
                <FaRegUser className="input-icon" /> 
                <input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="e.g., john_doe"
                  value={username}
                  onChange={handleChange}
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="email">Email</label>
              <div className="input-wrapper">
                 <MdOutlineMailOutline className="input-icon" /> 
                 <input
                   id="email"
                   name="email"
                   type="email"
                   placeholder="you@example.com"
                   value={email}
                   onChange={handleChange}
                   required
                   autoComplete="email"
                 />
              </div>
            </div>

            <div className="input-group">
               <label htmlFor="password">Password</label>
               <div className="input-wrapper">
                  <FiLock className="input-icon" /> 
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'} 
                    placeholder="********"
                    value={password}
                    onChange={handleChange}
                    required
                    autoComplete="new-password"
                  />
                  {showPassword ? (
                      <FiEyeOff className="password-toggle" onClick={togglePasswordVisibility} />
                  ) : (
                      <FiEye className="password-toggle" onClick={togglePasswordVisibility} />
                  )}
               </div>
            </div>

            <div className="input-group">
               <label htmlFor="confirmPassword">Confirm Password</label>
               <div className="input-wrapper">
                  <FiLock className="input-icon" /> 
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="********"
                    value={confirmPassword}
                    onChange={handleChange}
                    required
                    autoComplete="new-password"
                  />
                  {showConfirmPassword ? (
                     <FiEyeOff className="password-toggle" onClick={toggleConfirmPasswordVisibility} />
                  ) : (
                     <FiEye className="password-toggle" onClick={toggleConfirmPasswordVisibility} />
                  )}
               </div>
            </div>

            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>


          <div className="signin-link">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </div> 

        <div className="community-container">
          <div className="community-grid">
            {/* Row 1 */}
            <div className="community-item"><FaUserFriends /></div>
            <div className="community-item"><FaRegCommentDots /></div>
            <div className="community-item"><FaRegImage /></div>
            {/* Row 2 */}
            <div className="community-item"><IoNotificationsOutline /></div>
            <div className="community-item"><BsGearFill /></div>
            <div className="community-item"><MdGroups /></div>
            {/* Row 3 */}
            <div className="community-item"><MdSearch /></div>
            <div className="community-item"><IoLocationOutline /></div>
            <div className="community-item"><BsFillGrid3X3GapFill /></div>
          </div>
          <h3>Join our community</h3> 
          <p>Connect with friends, share moments, and stay in touch with your loved ones.</p> {/* Or login page text */}
        </div>

      </main> 
    </div> 
  );
};

export default Register;