import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './components/pages/LoginPage';
import Register from './components/pages/RegisterPage';
import ChatPage from './components/pages/ChatPage';
import PrivateRoute from './components/PrivateRoute';
import NavBar from './components/elements/Navbar';




function App() {
  return (
    <div>
    <AuthProvider>
      <NavBar/>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/chat" 
            element={
              <PrivateRoute>
                <ChatPage />
              </PrivateRoute>
            } 
          />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
    </div>
  );
}

export default App;