import React, { useState, useRef, useContext } from 'react';
import { Search, Home, Settings, Image as ImageIcon, Edit2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from '../../api/axios';
import { UserContext } from '../../context/UserContext';
import Sidebar from '../../components/sidebar/Sidebar'; // Import the Sidebar component

interface UploadedAlbum {
  name: string;
  songCount: number;
  streams: number;
  likesSaves: number;
  revenue: number;
}

interface Song {
  file: File;
  name: string;
}

const ALLOWED_IMG_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

const UploadPage: React.FC = () => {
  const { user } = useContext(UserContext);
  const [albumName, setAlbumName] = useState<string>('');
  const [albumCover, setAlbumCover] = useState<File | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [message, setMessage] = useState<string>('');
  const [isUploaded, setIsUploaded] = useState<boolean>(false);
  const [showSongModal, setShowSongModal] = useState(false);
  const [currentSongFile, setCurrentSongFile] = useState<File | null>(null);
  const [songName, setSongName] = useState('');
  const [uploadedAlbum, setUploadedAlbum] = useState<UploadedAlbum>({
    name: '',
    songCount: 0,
    streams: 0,
    likesSaves: 0,
    revenue: 0
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleAlbumCoverUpload = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const files = event.target?.files?.[0];
    if (files && ALLOWED_IMG_TYPES.includes(files.type)) {
      setAlbumCover(files);
    } else {
      setMessage('Please upload a valid image file.');
    }
  };

  const handleSongUpload = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const files = event?.target?.files;
    if (files && files[0]) {
      setCurrentSongFile(files[0]);
      setShowSongModal(true);
    }
  };

  const handleAddSong = () => {
    if (currentSongFile && songName.trim()) {
      setSongs(prevSongs => [...prevSongs, { file: currentSongFile, name: songName }]);
      setCurrentSongFile(null);
      setSongName('');
      setShowSongModal(false);
    }
  };

  const handleUpload = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    console.log("user_id: ", user.user_id)

    try {
      const albFormData = new FormData();
      albFormData.append('albumName', albumName)
      albFormData.append('user_id', user.user_id)
      albFormData.append('img', albumCover)
      const alb_response = await axios.post('/album-insert', albFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const album_id = alb_response?.data?.album_id;
      if (album_id) {
        for (const song of songs) {
          try {
            const formData = new FormData();
            formData.append('album_id', album_id)
            formData.append('user_id', user.user_id)
            formData.append('song', song.file);
            formData.append('song_name', song.name);
            await axios.post('/song-insert', formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            });
          } catch (err) {
            console.error(err.message);
          }
        }
      }
      setIsUploaded(true);
      setUploadedAlbum({
        name: albumName,
        songCount: songs.length,
        streams: 0,
        likesSaves: 0,
        revenue: 0
      });
      setMessage('Album successfully uploaded and stored in the database.');
    } catch (err) {
      console.error(err.message);
    }
  };

  return (
    <div className="bg-[#121212] text-[#EBE7CD] min-h-screen flex font-sans">
      <Sidebar /> {/* Replace the inline sidebar with the Sidebar component */}

      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="bg-[#121212] p-4 flex justify-between items-center">
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by song or artist"
                className="w-full bg-[#2A2A2A] rounded-full py-2 pl-10 pr-4 text-sm text-[#EBE7CD]"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/home" className="text-[#1ED760] hover:text-white">
              <Home className="w-6 h-6" />
            </Link>
            <Link to="/settings" className="text-[#1ED760] hover:text-white">
              <Settings className="w-6 h-6" />
            </Link>
          </div>
        </div>

        {/* Upload Content or Uploaded Album View */}
        <div className="flex-1 p-8">
          {/* Rest of your main content, like upload form and album details */}
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
