// Sidebar.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, Settings, Menu, PlusCircle, User, X, Music, LogOut, Search } from 'lucide-react';

interface SidebarProps {
  handleCreatePlaylist?: () => void;
  handleLogout?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ handleCreatePlaylist, handleLogout }) => {
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);
  const navigate = useNavigate();

  const defaultHandleCreatePlaylist = () => {
    navigate('/newplaylist');
  };

  const defaultHandleLogout = () => {
    localStorage.removeItem('token');
    navigate('/#');
  };

  return (
    <>
      {/* Sidebar */}
      <div
        className={`w-16 flex flex-col items-center py-4 bg-black border-r border-gray-800 transition-all duration-300 ease-in-out ${
          isMenuExpanded ? 'w-64' : 'w-16'
        }`}
      >
        <div className="flex flex-col items-center space-y-4 mb-8">
          <button
            onClick={() => setIsMenuExpanded(!isMenuExpanded)}
            className="text-[#1ED760] hover:text-white"
            aria-label="Menu"
          >
            {isMenuExpanded ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        <div className="flex-grow"></div>
        <div className="mt-auto flex flex-col items-center space-y-4 mb-4">
          <button
            onClick={handleCreatePlaylist || defaultHandleCreatePlaylist}
            className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-[#EBE7CD] hover:text-white"
            aria-label="Add"
          >
            <PlusCircle className="w-6 h-6" />
          </button>
          <Link to="/useredit" aria-label="User Profile" className="text-[#1ED760] hover:text-white">
            <User className="w-6 h-6" />
          </Link>
        </div>
      </div>

      {/* Expandable Menu */}
      {isMenuExpanded && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="bg-[#121212] w-64 h-full p-4">
            <button onClick={() => setIsMenuExpanded(false)} className="mb-8 text-[#1ED760]">
              <X className="w-6 h-6" />
            </button>
            <nav>
              <ul className="space-y-4">
                <li>
                  <Link to="/homepage" className="text-[#EBE7CD] hover:text-[#1ED760] flex items-center">
                    <Home className="w-5 h-5 mr-3" /> Home
                  </Link>
                </li>
                <li>
                  <Link to="/search" className="text-[#EBE7CD] hover:text-[#1ED760] flex items-center">
                    <Search className="w-5 h-5 mr-3" /> Search
                  </Link>
                </li>
                <li>
                  <Link to="/userlibrary" className="text-[#EBE7CD] hover:text-[#1ED760] flex items-center">
                    <Music className="w-5 h-5 mr-3" /> Your Library
                  </Link>
                </li>
                <li>
                  <button
                    onClick={handleCreatePlaylist || defaultHandleCreatePlaylist}
                    className="text-[#EBE7CD] hover:text-[#1ED760] flex items-center w-full"
                  >
                    <PlusCircle className="w-5 h-5 mr-3" /> Create Playlist
                  </button>
                </li>
              </ul>
            </nav>
            <div className="mt-auto">
              <Link to="/useredit" className="text-[#EBE7CD] hover:text-[#1ED760] flex items-center mt-4">
                <User className="w-5 h-5 mr-3" /> Profile
              </Link>
              <button
                onClick={handleLogout || defaultHandleLogout}
                className="text-[#EBE7CD] hover:text-[#1ED760] flex items-center mt-4 w-full"
              >
                <LogOut className="w-5 h-5 mr-3" /> Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
