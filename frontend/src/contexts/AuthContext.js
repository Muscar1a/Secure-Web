import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { host } from '../utils/APIRoutes';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    token: null,
    user: null,
    loading: true
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    // const user = JSON.parse(localStorage.getItem('user') || 'null');
    const verifyToken = async () => {
      if (!token) {
        setAuthState({
          isAuthenticated: false,
          token: null,
          user: null,
          loading: false
        });
        return;
      }

      try {
        //verify token
        const response = await axios.get(`${host}/users/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        setAuthState({
          isAuthenticated: true,
          token,
          user: response.data,
          loading: false
        });
      } catch (error) {
        //if token is invalid, clear localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        setAuthState({
          isAuthenticated: false,
          token: null,
          user: null,
          loading: false
        });
      }
    };

    verifyToken();
  }, []);


  const loginSuccess = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));

    setAuthState({
      isAuthenticated: true,
      token,
      user,
      loading: false,
      checked: true,
    });
  };


  const logout = async () => {
    try {
      // 1) Tell the backend to revoke tokens
      await axios.post(
        `${host}/auth/logout`,
        {},  // no body needed
        {
          headers: { Authorization: `Bearer ${authState.token}` }
        }
      );
    } catch (err) {
      // Log the error for debugging purposes
      console.error('Logout error:', err);
    }

    // 2) Clear local storage and reset state
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("chatPageReloaded");

    setAuthState({
      isAuthenticated: false,
      token: null,
      user: null,
      loading: false,
      checked: true,
    });

    // 3) Optionally redirect to login
    window.location.href = "/login";
  };
  
  return (
    <AuthContext.Provider value={{ ...authState, setAuthState, logout, loginSuccess }}>
      {children}
    </AuthContext.Provider>
  );
};

