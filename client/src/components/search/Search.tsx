import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import { Search, Play } from 'lucide-react';
import Sidebar from '../../components/sidebar/Sidebar';

interface Song {
  song_id: number;
  song_name: string;
  artist_name: string;
  album_name: string;
}
s
const SearchPage: React.FC = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<number | null>(null);

  const searchKeyword = searchParams.get('keyword') || '';

  const handleSearch = async () => {
    if (searchKeyword.trim() === '') {
      setSongs([]);
      return;
    }

    try {
      // Hardcoded songs for testing
      const hardcodedSongs: Song[] = [
        {
          song_id: 44,
          song_name: "Test Song 1",
          artist_name: "Artist 1",
          album_name: "Album 1"
        },
        {
          song_id: 2,
          song_name: "Test Song 2",
          artist_name: "Artist 2",
          album_name: "Album 2"
        },
        {
          song_id: 3,
          song_name: "Test Song 3",
          artist_name: "Artist 3",
          album_name: "Album 3"
        }
      ];

      setSongs(hardcodedSongs);
    } catch (error) {
      console.error('Error performing search:', error);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [searchKeyword]);

  const handleSongClick = (song: Song) => {
    setCurrentlyPlayingId(song.song_id);
    window.location.href = `/api/songs/${song.song_id}/stream`;
  };

  const updateSearchParams = (keyword: string) => {
    const params = new URLSearchParams();
    params.set('keyword', keyword);
    navigate({ search: params.toString() });
  };

  return (
    <div className="bg-[#121212] text-[#EBE7CD] min-h-screen flex font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col p-8 overflow-y-auto">
        <div className="flex items-center mb-8">
          <div className="relative w-full max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => updateSearchParams(e.target.value)}
              placeholder="Search for Song or Artist"
              className="w-full bg-[#2A2A2A] rounded-full py-2 pl-10 pr-4 text-sm text-[#EBE7CD] focus:outline-none"
            />
          </div>
        </div>

        {searchKeyword && (
          <div>
            {songs.length > 0 ? (
              <div>
                <h3 className="text-xl font-semibold mb-3">Songs</h3>
                <div className="grid grid-cols-1 gap-2">
                  {songs.map((song) => (
                    <div
                      key={song.song_id}
                      className={`bg-[#2A2A2A] p-3 rounded-lg flex items-center hover:bg-[#3A3A3A] transition-colors cursor-pointer
                        ${currentlyPlayingId === song.song_id ? 'bg-[#3A3A3A]' : ''}`}
                      onClick={() => handleSongClick(song)}
                    >
                      <Play className={`w-4 h-4 mr-3 ${currentlyPlayingId === song.song_id ? 'text-[#1ED760]' : 'text-gray-400'}`} />
                      <div className="flex-grow">
                        <p className={`font-semibold ${currentlyPlayingId === song.song_id ? 'text-[#1ED760]' : ''}`}>
                          {song.song_name}
                        </p>
                        <p className="text-sm text-gray-400">Artist: {song.artist_name}</p>
                        <p className="text-sm text-gray-400">Album: {song.album_name}</p>
                      </div>
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
    </div>
  );
};

export default SearchPage;