import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Home, Settings, Menu, PlusCircle, User, Edit2, Loader, X, Music, LogOut, Play } from 'lucide-react';
import { UserContext } from '../../context/UserContext';
import axios from '../../api/axios';
import Photo from '../photo/Photo';

interface Album {
  album_id: number;
  album_name: string;
  artist_name: string;
  playCount: number;
  lastPlayed: string;
  album_cover: string; //File | string | null;
}

interface Profile {
  name: string;
  playlists: number;
  avatar: string;
}

const Listener = () => {
  const { user } = useContext(UserContext)
  const [userProfile, setUserProfile] = useState<Profile>();
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const [topAlbums, setTopAlbums] = useState<Album[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  /*
  useEffect(() => {
    const fetchData = async () => {

      try {
        const response = await axios.get(`/listener/${user.user_id}`);
        const profileData = { name: response?.data?.display_name, playlists: response?.data?.playlists, avatar: response?.data?.avatar }
        console.log("Line 39:\n", profileData)
        const imageUrl = typeof profileData?.avatar === 'string'
          ? profileData?.avatar
          : URL.createObjectURL(profileData?.avatar);
        setImageUrl(imageUrl)
        setUserProfile({ ...userProfile, ...profileData });

        //console.log(topAlbums)

      } catch (err) {
        setError('Failed to fetch data. Please try again later.');
        console.error('Error fetching data:', err);
      } finally {
        //setIsLoading(false);
      }
    };
    fetchData();
  }, []);*/

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/album/playcount/3');
        console.log("Get top 3 albums response.data:\n", response.data)
        setTopAlbums(response?.data);


      } catch (error) {
        console.log("ERROR: ", error)
      } finally {
      }
    }
    fetchData();
  }, [])

  /*
  useEffect(() => {
    setIsLoading
    const fetchIMGs = async () => {
      try {
        // Fetch album data
        const albumData = await Promise.all(
          topAlbums.map(async (alb) => {
            //const { data } = await axios.get(`/album/` + alb.album_id);
            const response = await axios.get('/album/' + alb.album_id + '/IMG', {
              responseType: 'blob',
            });

            // Convert Blob to Object URL
            const imageBlobUrl = await URL.createObjectURL(response.data);

            return { ...alb, album_cover: imageBlobUrl };
          })
        );
        //console.log(albumData)
        setTopAlbums(albumData);
      } catch (error) {
        console.error('Error fetching albums:', error);
      } finally {
        setIsLoading(false);
      }
      fetchIMGs();
    }

  }, [])*/

  useEffect(() => {
    setIsLoading(false)
    const searchParams = new URLSearchParams(location.search);
    const query = searchParams.get('q');
    if (query) {
      setSearchValue(query);
    }
  }, [location])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    if (value.length > 0) {
      navigate(`/search?q=${encodeURIComponent(value)}`, { replace: true });
    } else {
      navigate('/listener', { replace: true });
    }
  };

  const handleCreatePlaylist = () => {
    navigate('/newplaylist');
  };

  const handleLogout = () => {
    navigate('/#', { state: { message: "You've been logged out" } });
  };

  const handleAlbumClick = (albumId: number) => {
    navigate(`/album/${albumId}`);
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
      <div className={`w-16 flex flex-col items-center py-4 bg-black border-r border-gray-800 transition-all duration-300 ease-in-out ${isMenuExpanded ? 'w-64' : 'w-16'}`}>
        <div className="flex flex-col items-center space-y-4 mb-8">
          <button onClick={() => setIsMenuExpanded(!isMenuExpanded)} className="text-[#1ED760] hover:text-white" aria-label="Menu">
            <Menu className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-grow"></div>
        <div className="mt-auto flex flex-col items-center space-y-4 mb-4">
          <Link to="/newplaylist" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-[#EBE7CD] hover:text-white" aria-label="Add">
            <PlusCircle className="w-6 h-6" />
          </Link>
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
                <li><Link to="/homepage" className="text-[#EBE7CD] hover:text-[#1ED760] flex items-center"><Home className="w-5 h-5 mr-3" /> Home</Link></li>
                <li><Link to="/search" className="text-[#EBE7CD] hover:text-[#1ED760] flex items-center"><Search className="w-5 h-5 mr-3" /> Search</Link></li>
                <li><Link to="/userlibrary" className="text-[#EBE7CD] hover:text-[#1ED760] flex items-center"><Music className="w-5 h-5 mr-3" /> Your Library</Link></li>
                <li><Link to="/newplaylist" className="text-[#EBE7CD] hover:text-[#1ED760] flex items-center"><PlusCircle className="w-5 h-5 mr-3" /> Create Playlist</Link></li>
              </ul>
            </nav>
            <div className="mt-auto">
              <Link to="/useredit" className="text-[#EBE7CD] hover:text-[#1ED760] flex items-center mt-4">
                <User className="w-5 h-5 mr-3" /> Profile
              </Link>
              <button onClick={handleLogout} className="text-[#EBE7CD] hover:text-[#1ED760] flex items-center mt-4">
                <LogOut className="w-5 h-5 mr-3" /> Log out
              </button>
            </div>
          </div>
        </div>
      )}

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

        {/* Profile section */}
        <div className="bg-[#1A1A1A] rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-32 h-32 bg-gray-700 rounded-full mr-6">
                <Photo />
              </div>
              <div>
                <p className="text-sm text-gray-400">Profile</p>
                <h2 className="text-4xl font-bold">{userProfile?.name}</h2>
                <p className="text-sm text-gray-400">{userProfile?.playlists} Playlists</p>
              </div>
            </div>
            <Link to="/useredit" className="text-gray-400 hover:text-white">
              <Edit2 className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Top Albums section */}
        <div className="bg-[#1A1A1A] rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Top Albums</h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {topAlbums?.map((album) => (
              <div
                key={album.album_id}
                className="bg-[#2A2A2A] rounded-lg p-4 transition-all duration-300 hover:bg-[#3A3A3A] cursor-pointer group"
                onClick={() => handleAlbumClick(album.album_id)}
              >
                <div className="relative">
                  <img
                    src={album?.album_cover}
                    alt={`${album?.album_name} by ${album?.artist_name}`}
                    className="w-full aspect-square object-cover rounded-md mb-3"
                  />
                  <button className="absolute bottom-2 right-2 w-10 h-10 bg-[#1ED760] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                    <Play className="w-5 h-5 text-black fill-current" />
                  </button>
                </div>
                <h4 className="font-semibold text-[#EBE7CD] truncate">{album?.album_name ? album?.album_name : ""}</h4>
                <p className="text-sm text-gray-400 truncate">{album.artist_name ? album.artist_name : ""}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {album.playCount ? album.playCount : 0} plays
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Listener;