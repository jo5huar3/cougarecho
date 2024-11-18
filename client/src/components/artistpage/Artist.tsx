import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Home, Settings, Menu, PlusCircle, User, Play, Edit2, Loader, X, Music, LogOut } from 'lucide-react';
import { UserContext } from '../../context/UserContext';
import axios from '../../api/axios';
import Photo from '../photo/Photo'; // Adjust path as needed
import Sidebar from '../../components/sidebar/Sidebar';  

// Mock API
const mockApi = {
  fetchArtistProfile: () => new Promise(resolve =>
    setTimeout(() => resolve({ name: 'Tyler, Creator', albums: 2, songs: 36 }), 500)
  ),
  fetchLatestAlbum: () => new Promise(resolve =>
    setTimeout(() => resolve({
      name: 'Trousers',
      streams: 600000,
      likesSaves: 45000
    }), 500)
  ),
};

const Artist = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [artistProfile, setArtistProfile] = useState({ artist_id: '', display_name: '', album_count: 0, song_count: 0 });
  const [latestAlbum, setLatestAlbum] = useState({ name: '', streams: 0, likeSaves: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      console.log(user);
      try {
        const response1 = await axios.get('/artist/' + user.user_id);
        console.log(response1?.data);
        const profileData = await response1?.data;
        setArtistProfile({ ...artistProfile, ...profileData });
      } catch (err) {
        setError('Failed to fetch data. Please try again later.');
        console.error('Error fetching data:', err);
      }
    };
    fetchData();
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/artist/' + user.user_id + '/albumlatest');
        console.log(response?.data);
        const albumData = await response?.data;
        setLatestAlbum({ ...latestAlbum, ...albumData });
      } catch (err) {
        setError('Failed to fetch data. Please try again later.');
        console.error('Error fetching data:', err);
      }
    };
    fetchData();
  }, [user]);

  useEffect(() => {
    setIsLoading(false);
  }, [isLoading]);

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    sessionStorage.clear();

    navigate('/#', {
      state: {
        showLogoutMessage: true,
        message: "You've been logged out successfully"
      }
    });
  };

  const handleCreatePlaylist = () => {
    navigate('/newplaylist');
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    if (value.length > 0) {
      navigate(`/search?keyword=${encodeURIComponent(value)}`, { replace: true });
    } else {
      navigate('/artist', { replace: true });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#121212]">
        <Loader className="w-10 h-10 text-[#1ED760] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#121212]">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-[#121212] text-[#EBE7CD] min-h-screen flex font-sans">
      {/* Sidebar */}
      <Sidebar handleCreatePlaylist={handleCreatePlaylist} handleLogout={handleLogout} />
      {/* Main content */}
      <div className="flex-1 flex flex-col p-8">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search for Song or Artist"
                className="w-full bg-[#2A2A2A] rounded-full py-2 pl-10 pr-4 text-sm text-[#EBE7CD] focus:outline-none focus:ring-2 focus:ring-white"
                value={searchValue}
                onChange={handleSearchChange}
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

        {/* Main rectangle */}
        <div className="flex-1 bg-[#1A1A1A] rounded-lg p-6">
          {/* Profile section */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center">
              <Photo/>
              <div>
                <p className="text-sm text-gray-400">Artist Profile</p>
                <h2 className="text-4xl font-bold mb-2">{artistProfile.display_name}</h2>
                <p className="text-sm text-gray-400 mb-4">{artistProfile.album_count} Albums, {artistProfile.song_count} Songs</p>
                <div className="flex space-x-4">
                  <Link
                    to="/newalbum"
                    className="bg-[#2A2A2A] text-[#EBE7CD] px-4 py-2 rounded-full text-sm font-semibold hover:bg-[#3A3A3A] transition-colors"
                  >
                    Add New Album
                  </Link>
                </div>
              </div>
            </div>
            <Link to="/useredit" className="text-gray-400 hover:text-white">
              <Edit2 className="w-5 h-5" />
            </Link>
          </div>

          {/* Latest Album */}
          <div className="bg-[#2A2A2A] rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">Latest Album</h3>
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-2xl font-bold mb-2">{latestAlbum.name}</h4>
                <div className="space-y-1">
                  <p className="text-sm text-gray-400">Streams: {latestAlbum.streams.toLocaleString()}</p>
                  <p className="text-sm text-gray-400">Likes/Saves: {latestAlbum.likeSaves.toLocaleString()}</p>
                </div>
              </div>
              <button className="bg-[#1ED760] text-black px-4 py-2 rounded-full text-sm hover:bg-[#1DB954] transition-colors">
                Generate Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Artist;
