import React from 'react';
import { Link } from 'react-router-dom';
import { BsGrid3X3GapFill } from 'react-icons/bs';
import { IoSettingsOutline } from 'react-icons/io5';
import { BsChatSquare, BsChatSquareDots } from 'react-icons/bs';
import { FaRegUser, FaUserFriends, FaRegCommentDots, FaRegImage } from 'react-icons/fa';
import { MdOutlineMailOutline } from 'react-icons/md';
import { FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { MdGroups, MdSearch } from 'react-icons/md';
import { IoLocationOutline, IoNotificationsOutline } from 'react-icons/io5';
import { BsFillGrid3X3GapFill } from 'react-icons/bs';
import { BsGearFill } from 'react-icons/bs';
const RegisterView = ({
    formData,
    username,
    email,
    password,
    confirmPassword,
    error,
    loading,
    handleChange,
    handleSubmit,
    showPassword,
    showConfirmPassword,
    togglePasswordVisibility,
    toggleConfirmPasswordVisibility
}) => {
    return (
        <div className="register-page">
            <header className="header">
           <div className="logo">
             {typeof BsChatSquare !== 'undefined' && <BsChatSquare className="logo-icon" />} 
              TriSec
           </div>
          <a href="/settings" className="nav-item">
            <IoSettingsOutline style={{ marginRight: '5px', verticalAlign: 'middle' }} /> Settings
          </a>
            </header>

            <main className='main-content'>
                <div className='form-container'>
                    <h2>Create Account</h2>
                    <p className="subtitle">Get started with your free account</p>

                    {error && <div className="error-message">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label htmlFor="username" className='sr-only'>Username</label>
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
                        <span className='signin-link'>
                        Already have an account? <Link to="/login">Sign in</Link>
                    </span>
                    </form>


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

export default RegisterView;