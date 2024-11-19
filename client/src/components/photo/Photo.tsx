import React, { useEffect, useState, useContext } from 'react';
import { Camera, User } from 'lucide-react';
import { UserContext } from '../../context/UserContext';
import axios from '../../api/axios';
const Photo = () => {
  const { user, setUser } = useContext(UserContext);
  const [isUploaded, setIsUploaded] = useState<boolean>(false);
  const [photo, setPhoto] = useState<File | null>(null); // For the uploaded file
  const [photoURL, setPhotoURL] = useState<string | null>(null); // For rendering
  const [loading, setLoading] = useState(true);


  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPhotoURL(url);
    }
  };

  useEffect(() => {

    axios.get(
      `/IMG/${user.user_id}`
    ).then((res) => {
      setPhoto(res.data)
      setPhotoURL(res.data)
    })

  }, [])

  return (
    <div className="w-32 h-32 relative mr-6">
      <input
        type="file"
        accept="image/*"
        onChange={handlePhotoUpload}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        aria-label="Upload photo"
      />
      <div className="w-full h-full rounded-full bg-gray-700 overflow-hidden">
        {photoURL ? (
          <img
            src={photoURL}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <User className="w-16 h-16 text-gray-400" />
          </div>
        )}
      </div>
      <div className="absolute bottom-0 right-0 bg-[#1ED760] rounded-full p-2 shadow-lg">
        <Camera className="w-4 h-4 text-black" />
      </div>
    </div>
  );
};

export default Photo;