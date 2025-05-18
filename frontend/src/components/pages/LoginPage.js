import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../contexts/AuthContext';
import './LoginPage.css'
import LoginView from '../elements/LoginView';
import { host } from '../../utils/APIRoutes';

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
      const params = new URLSearchParams();
      params.append('username', username);
      params.append('password', password);

      const response = await axios.post(
        `${host}/auth/token`,
        params,
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );

      //save token to localStorage
      localStorage.setItem('token', response.data.access_token);
      
      //update auth context
      setAuthState({
        isAuthenticated: true,
        token: response.data.access_token,
        loading: false
      });

      //get user
      const userResponse = await axios.get(`${host}/users/me`, {
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
  
  // Props to pas to the view component
  const viewProps = {
    username,
    password,
    error,
    loading,
    setUsername,
    setPassword,
    handleSubmit
  };

  return <LoginView {...viewProps} />;
};

export default Login;
