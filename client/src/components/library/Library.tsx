import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Home, Settings, PlusCircle, User, Play, Music, LogOut } from 'lucide-react';
import axios from '../../api/axios';
import Sidebar from '../../components/sidebar/Sidebar'; // Adjust the path if necessary

interface Playlist {
  playlist_id: number;
  title: string;
  avatar: string | null;
  created_at: string;
  updated_at: string;
  user_id: number;
}

const LibraryPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const navigate = useNavigate();

  // Fetch user playlists on component mount
  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log("Token:", token);

        if (!token) {
          navigate('/login');
          return;
        }

        const tokenParts = token.split('.');
        const payload = JSON.parse(atob(tokenParts[1]));
        const userId = payload.user_id;
        
        console.log("Making request for user:", userId);
        
        const response = await axios.get(`/playlists/user/${userId}`);
        console.log("Playlists response:", response.data);

        if (Array.isArray(response.data)) {
          setPlaylists(response.data);
          setError(null);
        } else {
          setError('Invalid response format from server');
        }
      } catch (err: any) {
        console.error('Error fetching playlists:', err.response || err);
        setError(err.response?.data?.error || 'Failed to load playlists');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaylists();
  }, [navigate]);

  const handleCreatePlaylist = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const tokenParts = token.split('.');
      const payload = JSON.parse(atob(tokenParts[1]));
      const userId = payload.user_id;
      
      const response = await axios.post('/playlist/new', {
        title: 'New Playlist',
        userId: userId,
      });

      if (response.data.playlistId) {
        const updatedResponse = await axios.get(`/playlists/user/${userId}`);
        setPlaylists(updatedResponse.data);
      }
    } catch (err) {
      console.error('Error creating playlist:', err);
      setError('Failed to create playlist');
    }
  };

  const handlePlaylistClick = (playlistId: number) => {
    navigate(`/playlist/${playlistId}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="bg-[#121212] text-[#EBE7CD] min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#1ED760] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#121212] text-[#EBE7CD] min-h-screen flex font-sans">
      {/* Sidebar */}
      <Sidebar handleCreatePlaylist={handleCreatePlaylist} handleLogout={handleLogout} />

      {/* Main content */}
      <div className="flex-1 flex flex-col p-8 overflow-y-auto">
        {/* Top bar */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Library</h1>
          <button 
            onClick={handleCreatePlaylist}
            className="bg-[#1ED760] text-black px-4 py-2 rounded-full hover:scale-105 transition-transform"
          >
            <span className="flex items-center">
              <PlusCircle className="w-5 h-5 mr-2" /> Create Playlist
            </span>
          </button>
        </div>

        {/* Library content */}
        <div className="flex-1">
          {error && (
            <div className="bg-red-500 text-white p-4 rounded-lg mb-4">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {playlists.map((playlist) => (
              <div 
                key={playlist.playlist_id} 
                onClick={() => handlePlaylistClick(playlist.playlist_id)}
                className="bg-[#181818] p-4 rounded-md cursor-pointer transition duration-200 ease-in-out transform hover:scale-105 hover:bg-[#282828]"
              >
                <div className="relative pb-[100%] mb-4">
                  <img 
                    src={playlist.avatar || "/api/placeholder/160/160"} 
                    alt={playlist.title}
                    className="absolute object-cover w-full h-full rounded" 
                  />
                  <div className="absolute top-2 right-2">
                    <Play className="w-10 h-10 bg-[#1ED760] text-black rounded-full p-2 transition duration-200 ease-in-out transform hover:scale-105" />
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-2 truncate">{playlist.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LibraryPage;
