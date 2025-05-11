import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

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
    const user = JSON.parse(localStorage.getItem('user') || 'null');

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
        const response = await axios.get('http://localhost:8000/users/me', {
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


  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('chatPageReloaded'); // Xóa flag reload

    setAuthState({
      isAuthenticated: false,
      token: null,
      user: null,
      loading: false,
      checked: true,
    });
  };
  return (
    <AuthContext.Provider value={{ ...authState, setAuthState, logout, loginSuccess }}>
      {children}
    </AuthContext.Provider>
  );
};

