import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, ChevronDown, ChevronUp } from 'lucide-react';

interface Song {
  id: string;
  title: string;
  artist: string;
}

interface MusicPlayerProps {
  currentSong: Song;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ currentSong }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
      audioRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);

      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
          audioRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata);
        }
      };
    }
  }, []);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className={`fixed transition-all duration-300 ease-in-out bg-[#121212] text-[#EBE7CD] z-50 ${
        isExpanded ? 'inset-0' : 'bottom-0 left-0 right-0 h-16'
      }`}
    >
      {isExpanded ? (
        <div className="h-full flex flex-col p-8">
          <button
            onClick={() => setIsExpanded(false)}
            className="text-[#1ED760] hover:text-white"
          >
            <ChevronDown className="w-8 h-8" />
          </button>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold">{currentSong.title}</h2>
            <p className="text-gray-400">{currentSong.artist}</p>
          </div>

          <audio
            ref={audioRef}
            src={`/api/songs/${currentSong.id}/stream`}
            controls
            className="w-full"
          />

          <div className="flex items-center justify-between mt-4">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>

          <button
            onClick={togglePlay}
            className="w-16 h-16 bg-[#1ED760] rounded-full flex items-center justify-center hover:bg-[#1DB954] mx-auto mt-6"
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 text-black" />
            ) : (
              <Play className="w-8 h-8 text-black" />
            )}
          </button>
        </div>
      ) : (
        <div className="h-full flex items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsExpanded(true)}
              className="text-[#1ED760] hover:text-white"
            >
              <ChevronUp className="w-6 h-6" />
            </button>
            <div>
              <p className="font-medium">{currentSong.title}</p>
              <p className="text-sm text-gray-400">{currentSong.artist}</p>
            </div>
          </div>

          <audio
            ref={audioRef}
            src={`/api/songs/${currentSong.id}/stream`}
            controls
            className="w-full"
          />
        </div>
      )}
    </div>
  );
};

export default MusicPlayer;
