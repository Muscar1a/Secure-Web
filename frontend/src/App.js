// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext'; 
import LoginPage from './components/pages/LoginPage';
import RegisterPage from './components/pages/RegisterPage';
import ChatPage from './components/pages/ChatPage';
import SettingsPage from './components/pages/SettingsPage'; 
import PrivateRoute from './components/PrivateRoute';
import NavBar from './components/elements/Navbar';

const PrivateLayout = () => (
  <>
    <NavBar />
    <Outlet />
  </>
);

function App() {
  return (
    <AuthProvider>
      <ThemeProvider> 
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            <Route 
              element={
                <PrivateRoute>
                  <PrivateLayout />
                </PrivateRoute>
              }
            >
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/settings" element={<SettingsPage />} /> 
            </Route>
            
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;