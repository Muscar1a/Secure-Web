// src/components/pages/LoadingToChatPage.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoadingToChatPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/chat-real'); // Chuyển sang ChatPage thật sự sau 1s
    }, 1000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <h1 className="text-2xl font-semibold">Loading...</h1>
    </div>
  );
}
