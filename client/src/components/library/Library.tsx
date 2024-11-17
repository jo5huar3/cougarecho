import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Home, Settings } from 'lucide-react';
import Sidebar from '../../components/sidebar/Sidebar';

const LibraryPage: React.FC = () => {
  const [accountType, setAccountType] = useState('listener');
  const [searchValue, setSearchValue] = useState('');
  const navigate = useNavigate();
  
  const [playlists, setPlaylists] = useState([
    { id: 1, title: "My Playlist 1", imageUrl: "/api/placeholder/160/160" },
    { id: 2, title: "My Playlist 2", imageUrl: "/api/placeholder/160/160" },
    { id: 3, title: "My Playlist 3", imageUrl: "/api/placeholder/160/160" },
    { id: 4, title: "My Playlist 4", imageUrl: "/api/placeholder/160/160" },
    { id: 5, title: "My Playlist 5", imageUrl: "/api/placeholder/160/160" },
    { id: 6, title: "My Playlist 6", imageUrl: "/api/placeholder/160/160" },
  ]);

  useEffect(() => {
    document.title = "Your Library";
    fetchAccountType();
  }, []);

  const fetchAccountType = () => {
    setTimeout(() => {
      const types = ['listener', 'admin', 'artist'];
      setAccountType(types[Math.floor(Math.random() * types.length)]);
    }, 1000);
  };

  const handleCreatePlaylist = () => {
    navigate('/newplaylist');
  };

  const handleLogout = () => {
    // Add any logout logic here (e.g., clearing tokens, etc.)
    navigate('/#');
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    if (value.length > 0) {
      navigate(`/search?keyword=${encodeURIComponent(value)}`, { replace: true });
    }
  };

  return (
    <div className="bg-[#121212] text-[#EBE7CD] min-h-screen flex font-sans">
      {/* Sidebar */}
      <Sidebar handleCreatePlaylist={handleCreatePlaylist} handleLogout={handleLogout} />

      {/* Main content */}
      <div className="flex-1 flex flex-col p-8 overflow-y-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="What do you want to listen to?"
                className="w-full bg-[#2A2A2A] rounded-full py-2 pl-10 pr-4 text-sm text-[#EBE7CD] focus:outline-none focus:ring-2 focus:ring-white"
                value={searchValue}
                onChange={handleSearchChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchValue.trim() !== '') {
                    navigate(`/search?keyword=${encodeURIComponent(searchValue)}`, { replace: true });
                  }
                }}
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/homepage" className="text-[#1ED760] hover:text-white">
              <Home className="w-6 h-6" />
            </Link>
            <Link to="/useredit" className="text-[#1ED760] hover:text-white">
              <Settings className="w-6 h-6" />
            </Link>
          </div>
        </div>

        {/* Library content */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-6">Your Library</h1>
          <div className="grid grid-cols-3 gap-4">
            {playlists.map((playlist) => (
              <div key={playlist.id} className="bg-[#1A1A1A] rounded-lg p-4 hover:bg-[#282828] transition-colors duration-200 cursor-pointer">
                <img src={playlist.imageUrl} alt={playlist.title} className="w-full aspect-square object-cover rounded-md mb-4" />
                <h3 className="text-lg font-semibold">{playlist.title}</h3>
                <p className="text-sm text-gray-400">Playlist</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LibraryPage;
