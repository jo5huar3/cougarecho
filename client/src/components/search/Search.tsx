// SearchPage.tsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from '../../api/axios';
import { Search, Play } from 'lucide-react';
import MusicPlayer from '../../components/songplayer/Player';
import Sidebar from '../../components/sidebar/Sidebar';

interface SearchResultItem {
  song_id: string;
  song_name: string;
  artist_name: string;
  album_name: string;
  genre_name: string;
  duration: string;
  path: string;
  coverUrl?: string;
  album_id: string;
}

interface SearchResults {
  songs: SearchResultItem[];
  artists: [];
}

const SearchPage: React.FC = () => {
  const [results, setResults] = useState<SearchResults>({ songs: [], artists: [] });
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [currentSong, setCurrentSong] = useState<SearchResultItem | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const searchKeyword = searchParams.get('keyword') || '';

  useEffect(() => {
    const fetchUserId = async () => {
      const userJson = localStorage.getItem('user');
      if (userJson) {
        const userData = JSON.parse(userJson);
        setUserId(userData.user_id);
      }
    };
    fetchUserId();
  }, []);

  const handleSongClick = (song: SearchResultItem) => {
    setCurrentSong(song);
    window.location.href = `/api/songs/${song.song_id}/stream`;
  };

  const handleSearch = async () => {
    if (searchKeyword.trim() === '') {
      setResults({ songs: [], artists: [] });
      return;
    }

    const token = localStorage.getItem('token') || '';

    try {
      const response = await axios.get(`/songs/search`, {
        params: { keyword: searchKeyword },
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      setResults({
        songs: Array.isArray(response.data) ? response.data : [],
        artists: [],
      });
      setErrMsg(null);
    } catch (error: any) {
      console.error('Error performing search:', error);
      if (error.response && error.response.status === 401) {
        setErrMsg('Unauthorized: Please log in again.');
        navigate('/login');
      } else {
        setErrMsg('Failed to fetch search results.');
      }
    }
  };

  useEffect(() => {
    handleSearch();
  }, [searchKeyword]);

  const updateSearchParams = (keyword: string) => {
    const params = new URLSearchParams();
    params.set('keyword', keyword);
    navigate({ search: params.toString() });
  };

  const formatDuration = (duration: string | null) => {
    if (!duration) {
      return '00:00';
    }
    const [minutes, seconds] = duration.split(':');
    return `${minutes || '00'}:${seconds ? seconds.padStart(2, '0') : '00'}`;
  };

  return (
    <div className="bg-[#121212] text-[#EBE7CD] min-h-screen flex font-sans">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col p-8 overflow-y-auto pb-20">
        {/* Search bar */}
        <div className="flex items-center mb-8">
          <div className="relative w-full max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => updateSearchParams(e.target.value)}
              placeholder="Search for Song or Artist"
              id="search-bar"
              className="w-full bg-[#2A2A2A] rounded-full py-2 pl-10 pr-4 text-sm text-[#EBE7CD] focus:outline-none"
            />
          </div>
        </div>

        {/* Search Results */}
        {searchKeyword && (
          <div>
            {results.songs.length > 0 ? (
              <div>
                <h3 className="text-xl font-semibold mb-3">Songs</h3>
                <div className="grid grid-cols-1 gap-2">
                  {results.songs.map((song) => (
                    <div
                      key={song.song_id}
                      className="bg-[#2A2A2A] p-3 rounded-lg flex items-center hover:bg-[#3A3A3A] transition-colors cursor-pointer"
                      onClick={() => handleSongClick(song)}
                    >
                      <Play className="w-4 h-4 mr-3 text-gray-400" />
                      <div className="flex-grow">
                        <p className="font-semibold">{song.song_name || 'Unknown Song'}</p>
                        <p className="text-sm text-gray-400">Artist: {song.artist_name || 'Unknown Artist'}</p>
                        <p className="text-sm text-gray-400">Album: {song.album_name || 'Unknown Album'}</p>
                      </div>
                      <p className="text-sm text-gray-400">{formatDuration(song.duration)}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-400">No results found</p>
            )}
          </div>
        )}
      </div>

      {/* Music Player */}
      {currentSong && (
        <MusicPlayer
          currentSong={{
            id: currentSong.song_id,
            title: currentSong.song_name,
            artist: currentSong.artist_name,
            coverUrl: `/api/albums/${currentSong.album_id}/cover`,
            audioUrl: `/api/songs/${currentSong.song_id}/stream`,
          }}
          userId={userId}
        />
      )}
    </div>
  );
};

export default SearchPage;
