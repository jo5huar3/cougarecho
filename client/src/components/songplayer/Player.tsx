import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Heart, ChevronDown, ChevronUp, Flag, Volume2 } from 'lucide-react';
import axios from 'axios';

const MusicPlayer = ({ currentSong, currentUser }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [songProgress, setSongProgress] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isFlagged, setIsFlagged] = useState(false);
  const [volume, setVolume] = useState(1); // Volume ranges from 0.0 to 1.0
  const [albumCoverUrl, setAlbumCoverUrl] = useState(''); // URL for album cover
  const audioRef = useRef(null);

  // Fallback for currentUser using local storage
  const [user, setUser] = useState(currentUser || null);

  useEffect(() => {
    if (!currentUser) {
      const userId = localStorage.getItem('user_id');
      if (userId) {
        setUser({ id: userId });
      }
    }
  }, [currentUser]);

  // Fetch album cover for the current song
  useEffect(() => {
    if (currentSong) {
      const fetchAlbumCover = async () => {
        try {
          const response = await axios.get(`/api/songs/${currentSong.id}/album-cover`, {
            responseType: 'blob', // Ensure binary data is handled correctly
          });
          if (response.status === 200) {
            // Use the static endpoint for the album cover URL
            setAlbumCoverUrl(`/api/songs/${currentSong.id}/album-cover`);
          } else {
            setAlbumCoverUrl(''); // Reset if no cover is found
          }
        } catch (error) {
          console.error('Error fetching album cover:', error);
          setAlbumCoverUrl(''); // Reset in case of error
        }
      };

      fetchAlbumCover();
    }
  }, [currentSong]);

  // Fetch the like status of the current song
  useEffect(() => {
    const fetchLikeStatus = async () => {
      if (currentSong && user) {
        try {
          const response = await axios.get(`/api/songs/${currentSong.id}/like-status`, {
            params: { userId: user.id },
          });
          setIsLiked(response.data.isLiked);
        } catch (error) {
          console.error('Error fetching like status:', error);
        }
      }
    };

    fetchLikeStatus();
  }, [currentSong, user]);

  // Initialize audio and attach it to the current song
  useEffect(() => {
    if (currentSong) {
      if (!audioRef.current) {
        audioRef.current = new Audio();
      }
      if (audioRef.current.src !== currentSong.audioUrl) {
        audioRef.current.src = currentSong.audioUrl; // Set the song only once
      }
      if (isPlaying) {
        audioRef.current.play();
      }
    }
  }, [currentSong]);

  // Play/Pause the audio based on `isPlaying` state
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Update progress bar as the song plays
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const updateProgress = () => {
        setSongProgress((audio.currentTime / audio.duration) * 100);
      };

      audio.addEventListener('timeupdate', updateProgress);
      return () => audio.removeEventListener('timeupdate', updateProgress);
    }
  }, []);

  // Update volume without changing the song source
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const toggleExpanded = () => setIsExpanded(!isExpanded);
  const togglePlay = () => setIsPlaying(!isPlaying);

  // Handle like/unlike toggle
  const toggleLike = async () => {
    if (!currentSong || !user) {
      alert('No song selected or user not logged in.');
      return;
    }

    try {
      const response = await axios.post('/api/toggle-like', {
        userId: user.id,
        songId: currentSong.id,
      });

      if (response.status === 200 || response.status === 201) {
        setIsLiked((prevLiked) => !prevLiked);
        alert(isLiked ? 'Song unliked!' : 'Song liked!');
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  // Handle flag/unflag toggle
  const toggleFlag = async () => {
    if (!currentSong || !user) {
      alert('No song selected or user not logged in.');
      return;
    }

    try {
      const flag = !isFlagged;

      const response = await axios.post('/api/toggle-flag', {
        userId: user.id,
        songId: currentSong.id,
        flag,
      });

      if (response.status === 200) {
        setIsFlagged(flag);
        alert(flag ? 'Song flagged successfully.' : 'Song unflagged successfully.');
      }
    } catch (error) {
      console.error('Error toggling flag:', error);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  if (!currentSong) {
    return <div>No song selected. Please select a song to play.</div>;
  }

  return (
    <div
      className={`fixed transition-all duration-300 bg-[#121212] text-[#EBE7CD] z-50 
      ${isExpanded ? 'inset-0' : 'bottom-0 left-0 right-0 h-16'}`}
    >
      {/* Expanded Music Player */}
      {isExpanded && (
        <div className="h-full flex flex-col p-8">
          <div className="flex justify-between items-center mb-8">
            <button onClick={toggleExpanded} className="text-[#1ED760] hover:text-white">
              <ChevronDown className="w-8 h-8" />
            </button>
          </div>
          <div className="flex-grow flex flex-col items-center justify-center space-y-6">
            <div className="w-64 h-64 bg-[#282828] rounded-lg overflow-hidden">
              {albumCoverUrl ? (
                <img src={albumCoverUrl} alt="Album Cover" className="w-full h-full object-cover" />
              ) : (
                <div className="text-gray-400 flex items-center justify-center w-full h-full">
                  No Album Cover
                </div>
              )}
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold">{currentSong.title}</h2>
              <p className="text-gray-400">{currentSong.artist}</p>
            </div>
          </div>
          {/* Like, Flag, and Volume controls */}
          <div className="flex justify-center items-center space-x-4 mt-6">
            <button onClick={toggleLike} className="focus:outline-none">
              <Heart
                className={`w-8 h-8 ${
                  isLiked ? 'fill-[#1ED760] text-[#1ED760]' : 'text-gray-400 hover:text-white'
                }`}
              />
            </button>
            <button onClick={toggleFlag} className="focus:outline-none">
              <Flag
                className={`w-8 h-8 ${
                  isFlagged ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-white'
                }`}
              />
            </button>
            <div className="flex items-center space-x-2">
              <Volume2 className="text-gray-400" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="w-24"
              />
            </div>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-[#282828] rounded-full h-1 mt-4">
            <div className="bg-[#1ED760] h-1 rounded-full" style={{ width: `${songProgress}%` }} />
          </div>
          {/* Playback controls */}
          <div className="flex justify-center items-center space-x-8 mt-6">
            <button className="w-12 h-12 bg-[#282828] rounded-full flex items-center justify-center hover:text-[#1ED760]">
              <SkipBack className="w-6 h-6" />
            </button>
            <button
              onClick={togglePlay}
              className="w-16 h-16 bg-[#1ED760] rounded-full flex items-center justify-center hover:bg-[#1DB954]"
            >
              {isPlaying ? <Pause className="w-8 h-8 text-black" /> : <Play className="w-8 h-8 text-black" />}
            </button>
            <button className="w-12 h-12 bg-[#282828] rounded-full flex items-center justify-center hover:text-[#1ED760]">
              <SkipForward className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* Minimized Music Player */}
      {!isExpanded && (
        <div className="flex justify-between items-center px-4">
          <button onClick={toggleExpanded} className="text-[#1ED760] hover:text-white">
            <ChevronUp />
          </button>
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-[#282828] overflow-hidden">
              {albumCoverUrl ? (
                <img src={albumCoverUrl} alt="Album Cover" />
              ) : (
                <div className="text-gray-400 flex items-center justify-center w-full h-full">
                  No Cover
                </div>
              )}
            </div>
            <div>
              <p>{currentSong.title}</p>
              <p>{currentSong.artist}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={toggleLike} className="focus:outline-none">
              <Heart
                className={`w-5 h-5 ${
                  isLiked ? 'fill-[#1ED760] text-[#1ED760]' : 'text-gray-400 hover:text-white'
                }`}
              />
            </button>
            <button onClick={toggleFlag} className="focus:outline-none">
              <Flag
                className={`w-5 h-5 ${
                  isFlagged ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-white'
                }`}
              />
            </button>
            <button
              onClick={togglePlay}
              className="bg-[#1ED760] rounded-full w-8 h-8 flex items-center justify-center hover:bg-[#1DB954]"
            >
              {isPlaying ? <Pause className="w-4 h-4 text-black" /> : <Play className="w-4 h-4 text-black" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MusicPlayer;
