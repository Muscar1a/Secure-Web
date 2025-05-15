// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext'; // Import ThemeProvider
import LoginPage from './components/pages/LoginPage';
import RegisterPage from './components/pages/RegisterPage';
import ChatPage from './components/pages/ChatPage';
import SettingsPage from './components/pages/SettingsPage';
import PrivateRoute from './components/PrivateRoute';

// Layout cho các trang private (đã đăng nhập)
// NavBar ở đây sẽ được áp dụng theme
const PrivateLayout = () => (
  <>
    <Outlet />
  </>
);

// (Tùy chọn) Layout cho các trang public nếu bạn muốn có cấu trúc chung
// Nếu không, bạn có thể render LoginPage, RegisterPage, SettingsPage trực tiếp
const PublicLayout = () => (
    <>
        {/* Có thể có một PublicNavBar ở đây nếu cần, nó cũng sẽ được áp dụng theme */}
        <Outlet />
    </>
);


function App() {
  return (
    <AuthProvider>
      <ThemeProvider> {/* <<<< ThemeProvider BAO BỌC TOÀN BỘ Router */}
        <Router>
          <Routes>
            {/* Public routes - SẼ ĐƯỢC ÁP DỤNG THEME */}
            <Route element={<PublicLayout />}> {/* Hoặc render trực tiếp không cần PublicLayout */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/settings" element={<SettingsPage />} /> 
            </Route>

            {/* Private routes - SẼ ĐƯỢC ÁP DỤNG THEME */}
            <Route 
              element={
                <PrivateRoute>
                  <PrivateLayout />
                </PrivateRoute>
              }
            >
              <Route path="/chat" element={<ChatPage />} />
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