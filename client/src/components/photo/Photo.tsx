import React, { useState } from 'react';
import { Camera, User } from 'lucide-react';

const Photo = () => {
  const [photoURL, setPhotoURL] = useState(null);

  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPhotoURL(url);
    }
  };

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