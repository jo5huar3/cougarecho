import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Home, Settings, PlusCircle, User, X, Music, LogOut, Image as ImageIcon } from 'lucide-react';
import Sidebar from '../../components/sidebar/Sidebar';  // Import the Sidebar component

// Mock API with focused song database
const mockApi = {
  searchSongs: (query) => {
    const allSongs = [
      { id: 1, title: 'Song 1', artist: 'Artist 1', duration: 180 },
      { id: 2, title: 'Song 2', artist: 'Artist 2', duration: 210 },
      { id: 3, title: 'New Song', artist: 'New Artist', duration: 260 },
      { id: 4, title: 'Another Track', artist: 'Cool Band', duration: 175 },
      { id: 5, title: 'Great Song', artist: 'Artist 3', duration: 195 }
    ];

    const filteredSongs = allSongs.filter(song => 
      song.title.toLowerCase().includes(query.toLowerCase()) ||
      song.artist.toLowerCase().includes(query.toLowerCase())
    );

    return Promise.resolve(filteredSongs);
  },
  createPlaylist: (playlistData) => Promise.resolve({ id: 1, ...playlistData }),
};

const CreatePlaylistPage = () => {
  const [playlistTitle, setPlaylistTitle] = useState('');
  const [playlistImage, setPlaylistImage] = useState(null);
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const loggedInUser = { username: 'currentUser' };
      if (loggedInUser) {
        setUser(loggedInUser);
      } else {
        navigate('/login');
      }
    };

    checkAuth();
  }, [navigate]);

  const handleSearchSongs = async (query) => {
    setSearchQuery(query.trim());
    if (query.trim().length > 0) {
      try {
        console.log(`Searching songs with query: ${query}`);
        const results = await mockApi.searchSongs(query);
        console.log('Filtered Songs:', results);

        // Filter out songs that are already in the playlist
        const filteredResults = results.filter(
          result => !selectedSongs.some(selected => selected.id === result.id)
        );

        console.log('Search Results after filtering:', filteredResults);
        setSearchResults(filteredResults);

      } catch (err) {
        console.error('Error searching songs:', err);
        setSearchResults([]);
      }
    } else {
      console.log('Query too short');
      setSearchResults([]);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPlaylistImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    navigate('/#', { state: { message: "You've been logged out" } });
  };

  const addSongToPlaylist = (song) => {
    setSelectedSongs(prev => [...prev, { ...song, dateAdded: new Date().toISOString() }]);
    setSearchResults(prev => prev.filter(s => s.id !== song.id));
  };

  const removeSongFromPlaylist = (song) => {
    setSelectedSongs(prev => prev.filter(s => s.id !== song.id));
    if (searchQuery) {
      handleSearchSongs(searchQuery);
    }
  };

  const handleCreatePlaylist = async () => {
    if (!playlistTitle.trim()) {
      setError('Please enter a playlist title');
      return;
    }
    if (selectedSongs.length === 0) {
      setError('Please add at least one song to the playlist');
      return;
    }
    setError('');
    const playlistData = {
      name: playlistTitle,
      image: playlistImage,
      songs: selectedSongs,
      creator: user?.username,
      songCount: selectedSongs.length,
      dateCreated: new Date().toISOString(),
    };
    try {
      await mockApi.createPlaylist(playlistData);
      navigate('/userlibrary');
    } catch (err) {
      setError('Failed to create playlist. Please try again.');
    }
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDateAdded = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-[#121212] text-[#EBE7CD] min-h-screen flex font-sans">
      {/* Sidebar */}
      <Sidebar handleCreatePlaylist={handleCreatePlaylist} handleLogout={handleLogout} />

      {/* Main content */}
      <div className="flex-1 flex flex-col p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex-1 max-w-2xl">
            <h1 className="text-2xl font-bold">Create New Playlist</h1>
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

        {/* Playlist content */}
        <div className="flex-1 bg-[#1A1A1A] rounded-lg p-6">
          <div className="flex items-center mb-6">
            <div className="w-40 h-40 bg-[#2A2A2A] rounded-lg mr-6 relative overflow-hidden">
              {playlistImage ? (
                <img src={playlistImage} alt="Playlist cover" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-[#EBE7CD] opacity-50" />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Playlist Title"
                value={playlistTitle}
                onChange={(e) => setPlaylistTitle(e.target.value)}
                className="text-4xl font-bold bg-transparent border-b border-[#EBE7CD] text-[#EBE7CD] w-full focus:outline-none focus:border-[#1ED760]"
              />
              {error && <p className="text-red-500 mt-2">{error}</p>}
              <p className="text-sm text-[#A0616A] mt-2">by {user?.username}</p>
              <p className="text-sm text-[#EBE7CD] opacity-75 mt-1">{selectedSongs.length} songs</p>
            </div>
          </div>

          {/* Search and add songs */}
          <div className="mb-8">
            <h3 className="text-lg font-bold mb-4">Search Songs</h3>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchSongs(e.target.value)}
                placeholder="Search for songs"
                className="w-full bg-[#2A2A2A] rounded-full py-2 pl-10 pr-4 text-sm text-[#EBE7CD] focus:outline-none focus:ring-2 focus:ring-[#1ED760]"
              />
            </div>
            {searchResults.length > 0 && (
              <div className="bg-[#2A2A2A] rounded-lg p-4 max-h-60 overflow-y-auto">
                {searchResults.map((song) => (
                  <div key={song.id} className="flex justify-between items-center py-2 hover:bg-[#383838] rounded px-2">
                    <div>
                      <div className="text-sm font-semibold">{song.title}</div>
                      <div className="text-xs text-gray-400">{song.artist}</div>
                    </div>
                    <button
                      onClick={() => addSongToPlaylist(song)}
                      className="bg-[#1ED760] text-black px-3 py-1 rounded-full text-sm"
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected songs list */}
          <div className="mb-4">
            <h3 className="text-lg font-bold mb-4">Playlist Songs</h3>
            <div className="grid grid-cols-4 text-sm font-bold text-[#EBE7CD] opacity-75 mb-2">
              <span></span>
              <span>Title</span>
              <span>Date Added</span>
              <span>Duration</span>
            </div>
            {selectedSongs.map((song) => (
              <div key={song.id} className="grid grid-cols-4 text-sm py-2 hover:bg-[#2A2A2A] rounded items-center">
                <button 
                  onClick={() => removeSongFromPlaylist(song)}
                  className="text-red-500 hover:text-red-400"
                >
                  <X className="w-5 h-5" />
                </button>
                <span>{song.title} - {song.artist}</span>
                <span>{formatDateAdded(song.dateAdded)}</span>
                <span>{formatDuration(song.duration)}</span>
              </div>
            ))}
          </div>

          <button
            onClick={handleCreatePlaylist}
            className="mt-6 bg-[#1ED760] text-black px-6 py-2 rounded-full text-lg font-semibold hover:bg-[#1DB954] transition-colors"
          >
            Create Playlist
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePlaylistPage;
