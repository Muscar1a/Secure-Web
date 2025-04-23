import React, { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';


import { BsChatSquare } from "react-icons/bs";
import { IoSettingsOutline } from "react-icons/io5";
import { CgProfile } from "react-icons/cg"; 
import { BiLogOut } from "react-icons/bi";   


const ChatPage = () => {
  const { user, logout } = useContext(AuthContext);


  return (
    <div className="chat-page-wrapper"> 
      <nav> 
        <div> 
          <div> 
            <div className="flex items-center"> 
              <h1> <BsChatSquare className="logo-icon" /> Chatty </h1> 
            </div>
            <div className="flex items-center"> 
               <button className="nav-item">
                    <IoSettingsOutline className="nav-item-icon"/> Settings
               </button>
                <button className="nav-item">
                    <CgProfile className="nav-item-icon"/> Profile
               </button>


              <button onClick={logout}>
                <BiLogOut className="nav-item-icon"/> 
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div>
        <div>
          <p>Chat interface will be implemented here.</p>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;