import React, { useState, useRef, useContext } from 'react';
import { Search, Home, Settings, Menu, User, PlusCircle, X, Music, LogOut, Upload, Image as ImageIcon, Edit2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from '../../api/axios';
import { UserContext } from '../../context/UserContext';

const NEW_ALBUM_URL = '/newalbum';

interface UploadedAlbum {
  name: string;
  songCount: number;
  streams: number;
  likesSaves: number;
  revenue: number;
}

const ALLOWED_IMG_TYPES = ['image/jpeg', 'image/png'];
const ALLOWED_AUDIO_TYPES = ['audio/mpeg'];

const UploadPage: React.FC = () => {
  const { user } = useContext(UserContext);
  const [isMenuExpanded, setIsMenuExpanded] = useState<boolean>(false);
  const [albumName, setAlbumName] = useState<string>('');
  const [albumCover, setAlbumCover] = useState<File | null>(null);
  const [songs, setSongs] = useState<File[]>([]);
  const [isUploaded, setIsUploaded] = useState<boolean>(false);
  const [uploadedAlbum, setUploadedAlbum] = useState<UploadedAlbum>({
    name: '',
    songCount: 0,
    streams: 0,
    likesSaves: 0,
    revenue: 0
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Upload album image
  const handleAlbumCoverUpload = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file && ALLOWED_IMG_TYPES.includes(file.type)) {
      setAlbumCover(file);
    } else {
      alert('Please upload a valid image file (JPEG/PNG).');
    }
  };

  // Upload song files
  const handleSongUpload = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const files = event.target.files;
    if (files) {
      const mp3Files = Array.from(files).filter(file => ALLOWED_AUDIO_TYPES.includes(file.type));
      if (mp3Files.length !== files.length) {
        alert('Please upload only MP3 files.');
      } else {
        setSongs(prevSongs => [...prevSongs, ...mp3Files]);
      }
    }
  };

  // Handle album and song upload
  const handleUpload = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
  
    if (!albumName || !albumCover || songs.length === 0) {
      alert('Please provide an album title, cover image, and at least one song.');
      return;
    }
  
    try {
      const albumFormData = new FormData();
      albumFormData.append('albumName', albumName);
      albumFormData.append('user_id', user.user_id);
      albumFormData.append('img', albumCover);
  
      // Upload the album cover and details
      const albumResponse = await axios.post('/album-insert', albumFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
  
      const album_id = albumResponse?.data?.album_id;
      console.log("album_id: ", album_id);
      if (album_id) {
        for (const song of songs) {
          const songFormData = new FormData();
          songFormData.append('album_id', album_id);
          songFormData.append('user_id', user.user_id);
          songFormData.append('song', song);
  
          try {
            await axios.post('/song-insert', songFormData, {
              headers: { 'Content-Type': 'multipart/form-data' }
            });
          } catch (songError) {
            console.error('Song upload error:', songError);
            if (songError.response && songError.response.status === 403) {
              alert(`ERROR: ${songError.response.data.error}`);
              return;
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
        alert('Album successfully uploaded.');
      }
    } catch (albumError) {
      console.error('Album upload error:', albumError);
      if (albumError.response && albumError.response.status === 403) {
        alert(`ERROR: ${albumError.response.data.error}`);
      } else {
        alert('Error uploading album. Please try again.');
      }
    }
  };
  
  

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
          <button className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-[#EBE7CD] hover:text-white" aria-label="Add">
            <PlusCircle className="w-6 h-6" />
          </button>
          <Link to="/useredit" aria-label="User Profile" className="text-[#1ED760] hover:text-white">
            <User className="w-6 h-6" />
          </Link>
        </div>
      </div>

      {/* Main Content */}
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

        {/* Upload Content */}
        <div className="flex-1 p-8">
          <div className="bg-[#1A1A1A] rounded-lg p-6 max-w-2xl mx-auto">
            {!isUploaded ? (
              // Upload Form
              <>
                <div className="flex items-start space-x-6 mb-6">
                  <div
                    className="w-40 h-40 bg-[#282828] rounded-md flex-shrink-0 flex items-center justify-center cursor-pointer"
                    onClick={() => coverInputRef.current?.click()}
                  >
                    {albumCover ? (
                      <img src={URL.createObjectURL(albumCover)} alt="Album Cover" className="w-full h-full object-cover rounded-md" />
                    ) : (
                      <ImageIcon className="w-12 h-12 text-gray-400" />
                    )}
                  </div>
                  <input
                    type="file"
                    ref={coverInputRef}
                    onChange={handleAlbumCoverUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <div className="flex-grow">
                    <input
                      type="text"
                      value={albumName}
                      onChange={(e) => setAlbumName(e.target.value)}
                      placeholder="Enter Album Title"
                      className="text-4xl font-bold text-white mb-4 bg-transparent border-b border-gray-600 focus:outline-none focus:border-[#1ED760] w-full"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-[#282828] text-[#EBE7CD] rounded-full py-2 px-4 flex items-center space-x-2 hover:bg-[#3E3E3E] transition-colors"
                    >
                      <PlusCircle className="w-5 h-5" />
                      <span>Click to Upload MP3s</span>
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleSongUpload}
                      accept=".mp3,audio/mpeg"
                      multiple
                      className="hidden"
                    />
                  </div>
                </div>
                {songs.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-xl font-semibold mb-2">Uploaded Songs:</h3>
                    <ul className="list-disc list-inside">
                      {songs.map((song, index) => (
                        <li key={index} className="text-gray-300">{song.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <button
                  onClick={handleUpload}
                  className="mt-6 bg-[#1ED760] text-black font-bold py-2 px-4 rounded-full hover:bg-[#1DB954] transition-colors"
                >
                  Upload Album
                </button>
              </>
            ) : (
              // Uploaded Album View
              <>
                {/* Uploaded Album View Code */}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
