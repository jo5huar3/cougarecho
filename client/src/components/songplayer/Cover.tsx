import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AlbumCover = ({ songId }) => {
  const [albumCoverUrl, setAlbumCoverUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!songId) return;

    const fetchAlbumCover = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch the album cover URL using Axios
        const response = await axios.get(`/api/songs/${songId}/album-cover`);
        if (response.status === 200) {
          setAlbumCoverUrl(response.data.url || '');
        } else {
          setAlbumCoverUrl('');
        }
      } catch (err) {
        console.error('Error fetching album cover:', err);
        setError('Failed to load album cover');
      } finally {
        setLoading(false);
      }
    };

    fetchAlbumCover();
  }, [songId]);

  if (loading) return <div>Loading album cover...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="album-cover">
      {albumCoverUrl ? (
        <img
          src={albumCoverUrl}
          alt="Album Cover"
          className="album-cover-image"
          style={{
            width: '300px',
            height: '300px',
            borderRadius: '10px',
            objectFit: 'cover',
          }}
        />
      ) : (
        <div>No album cover available</div>
      )}
    </div>
  );
};

export default AlbumCover;
