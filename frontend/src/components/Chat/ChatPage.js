import React, { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';

const ChatPage = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Chat App</h1>
            </div>
            <div className="flex items-center">
              <p className="text-gray-700 mr-4">Welcome, {user?.username}</p>
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 p-4 flex items-center justify-center">
            <p className="text-gray-500 text-xl">Chat interface will be implemented here.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;