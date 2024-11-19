import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Search, Home, Settings, Menu, PlusCircle, User, Play, Pause, Edit2, Check, X, Music, LogOut } from 'lucide-react';
import axios from '../../api/axios';

const PlaylistPage = () => {
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [playingSongId, setPlayingSongId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [playlist, setPlaylist] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlaylist = async () => {
      if (!id) return;
      setIsLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get(`/playlist/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        setPlaylist(response.data);
        setEditedTitle(response.data.title || '');
      } catch (err) {
        console.error('Error fetching playlist:', err);
        setError(err.response?.data?.message || 'Failed to load playlist');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaylist();
  }, [id, navigate]);

  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length >= 2) {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`/songs/search?keyword=${encodeURIComponent(query)}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const filteredResults = response.data.filter(result => 
          !playlist?.songs?.some(song => song.song_id === result.song_id)
        );
        setSearchResults(filteredResults);
      } catch (err) {
        console.error('Search error:', err);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleUpdateTitle = async () => {
    if (!editedTitle.trim() || !id) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`/playlist/${id}/title`, 
        { title: editedTitle },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setPlaylist(prev => ({
        ...prev,
        ...response.data
      }));
      setIsEditing(false);
      setError(null);
    } catch (err) {
      console.error('Update error:', err);
      setError('Failed to update playlist title');
    }
  };

  const handleAddSong = async (song) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/playlist/${id}/song`,
        { song_id: song.song_id },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Refresh playlist data
      const playlistResponse = await axios.get(`/playlist/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setPlaylist(playlistResponse.data);
      setSearchResults(prev => prev.filter(s => s.song_id !== song.song_id));
    } catch (err) {
      console.error('Add song error:', err);
      setError('Failed to add song');
    }
  };

  const handleDeleteSong = async (song_id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/playlist/${id}/song/${song_id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setPlaylist(prev => ({
        ...prev,
        songs: prev.songs.filter(song => song.song_id !== song_id)
      }));
    } catch (err) {
      console.error('Delete song error:', err);
      setError('Failed to delete song');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#1ED760] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#121212] text-[#EBE7CD] min-h-screen flex font-sans">
      {/* Sidebar */}
      <div className={`w-16 flex flex-col items-center py-4 bg-black border-r border-gray-800 transition-all duration-300 ease-in-out ${isMenuExpanded ? 'w-64' : 'w-16'}`}>
        <div className="flex flex-col items-center space-y-4 mb-8">
          <button 
            onClick={() => setIsMenuExpanded(!isMenuExpanded)} 
            className="text-[#1ED760] hover:text-white transition-colors" 
            aria-label="Menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-grow"></div>
        <div className="mt-auto flex flex-col items-center space-y-4 mb-4">
          <Link 
            to="/newplaylist" 
            className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-[#EBE7CD] hover:text-white transition-colors" 
            aria-label="Add"
          >
            <PlusCircle className="w-6 h-6" />
          </Link>
          <Link 
            to="/useredit" 
            aria-label="User Profile" 
            className="text-[#1ED760] hover:text-white transition-colors"
          >
            <User className="w-6 h-6" />
          </Link>
        </div>
      </div>

      {/* Expanded menu overlay */}
      {isMenuExpanded && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50"
          onClick={() => setIsMenuExpanded(false)}
        >
          <div 
            className="bg-[#121212] w-64 h-full p-4"
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={() => setIsMenuExpanded(false)} 
              className="mb-8 text-[#1ED760] hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <nav>
              <ul className="space-y-4">
                <li>
                  <Link to="/homepage" className="text-[#EBE7CD] hover:text-[#1ED760] flex items-center transition-colors">
                    <Home className="w-5 h-5 mr-3" /> Home
                  </Link>
                </li>
                <li>
                  <Link to="/search" className="text-[#EBE7CD] hover:text-[#1ED760] flex items-center transition-colors">
                    <Search className="w-5 h-5 mr-3" /> Search
                  </Link>
                </li>
                <li>
                  <Link to="/userlibrary" className="text-[#EBE7CD] hover:text-[#1ED760] flex items-center transition-colors">
                    <Music className="w-5 h-5 mr-3" /> Your Library
                  </Link>
                </li>
                <li>
                  <Link to="/newplaylist" className="text-[#EBE7CD] hover:text-[#1ED760] flex items-center transition-colors">
                    <PlusCircle className="w-5 h-5 mr-3" /> Create Playlist
                  </Link>
                </li>
              </ul>
            </nav>
            <div className="mt-auto">
              <Link to="/useredit" className="text-[#EBE7CD] hover:text-[#1ED760] flex items-center mt-4 transition-colors">
                <User className="w-5 h-5 mr-3" /> Profile
              </Link>
              <button 
                onClick={handleLogout} 
                className="text-[#EBE7CD] hover:text-[#1ED760] flex items-center mt-4 transition-colors w-full"
              >
                <LogOut className="w-5 h-5 mr-3" /> Log out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 p-8">
        {error && (
          <div className="bg-red-500 text-white p-4 rounded-lg mb-4">
            {error}
          </div>
        )}

        {playlist && (
          <>
            {/* Playlist Header */}
            <div className="flex items-start space-x-6 mb-8">
              <div className="w-48 h-48 bg-gray-800 rounded-lg flex items-center justify-center">
                {playlist.avatar ? (
                  <img 
                    src={playlist.avatar} 
                    alt="Playlist cover" 
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <Music className="w-16 h-16 text-gray-600" />
                )}
              </div>
              
              <div className="flex-1">
                <p className="text-sm text-gray-400 mb-2">Playlist</p>
                {isEditing ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      className="bg-gray-800 text-white text-4xl font-bold px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                      autoFocus
                    />
                    <button 
                      onClick={handleUpdateTitle} 
                      className="text-green-500 hover:text-green-400"
                    >
                      <Check className="w-6 h-6" />
                    </button>
                    <button 
                      onClick={() => {
                        setIsEditing(false);
                        setEditedTitle(playlist.title);
                      }} 
                      className="text-red-500 hover:text-red-400"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <h1 className="text-4xl font-bold text-white">
                      {playlist.title}
                    </h1>
                    <button 
                      onClick={() => setIsEditing(true)} 
                      className="ml-3 text-gray-400 hover:text-white"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                  </div>
                )}
                <div className="mt-2 text-gray-400">
                  Created by {playlist.creator_name}
                </div>
                <div className="text-gray-400">
                  {playlist.songs?.length || 0} songs
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search for songs to add"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full bg-gray-800 text-white pl-10 pr-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="mt-4 bg-gray-800 rounded-lg p-4 max-w-2xl">
                  <h3 className="text-white font-semibold mb-2">Search Results</h3>
                  {searchResults.map((song) => (
                    <div 
                      key={song.song_id} 
                      className="flex justify-between items-center py-2 hover:bg-gray-700 rounded px-2"
                    >
                      <div>
                        <div className="text-white">{song.song_name}</div>
                        <div className="text-sm text-gray-400">{song.artist_name}</div>
                      </div>
                      <button
                        onClick={() => handleAddSong(song)}
                        className="bg-[#1ED760] text-black px-3 py-1 rounded-full text-sm hover:bg-[#1DB954]"
                      >
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Songs List */}
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="grid grid-cols-[auto,1fr,1fr,auto] gap-4 text-gray-400 text-sm border-b border-gray-700 pb-2 mb-2">
                <div>#</div>
                <div>Title</div>
                <div>Album</div>
                <div>Duration</div>
              </div>
              {playlist.songs?.length > 0 ? (
                playlist.songs.map((song, index) => (
                  <div
                    key={song.song_id}
                    className="grid grid-cols-[auto,1fr,1fr,auto] gap-4 text-white py-2 hover:bg-gray-700 rounded group"
                  >
                    <div className="flex items-center">
                      <button 
                        onClick={() => setPlayingSongId(playingSongId === song.song_id ? null : song.song_id)}
                        className="w-4 h-4 flex items-center justify-center"
                      >
                        {playingSongId === song.song_id ? (
                          <Pause className="w-4 h-4 text-[#1ED760]" />
                        ) : (
                          <Play className="w-4 h-4 opacity-0 group-hover:opacity-100 text-white" />
                        )}
                      </button>
                    </div>
                    <div>
                      <div className="font-medium">{song.song_name}</div>
                      <div className="text-sm text-gray-400">{song.artist_name}</div>
                    </div>
                    <div className="text-gray-400">{song.album_name}</div>
                    <div className="flex items-center space-x-2">
                      <span>
                        {Math.floor(song.duration / 60)}:
                        {(song.duration % 60).toString().padStart(2, '0')}
                      </span>
                      <button
                        onClick={() => handleDeleteSong(song.song_id)}
                        className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-gray-400 text-center py-8">
                  No songs in this playlist yet. Search for songs to add.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PlaylistPage;