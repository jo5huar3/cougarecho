import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Settings, Menu, User, Edit2, PlusCircle, Home, X, Music, LogOut } from 'lucide-react';
import axios from '../../api/axios';
import { UserContext } from '../../context/UserContext';
import Sidebar from '../../components/sidebar/Sidebar'; // Import Sidebar component

const UserProfileSettings = () => {
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);
  const [displayName, setDisplayName] = useState('');
  const [oldUsername, setOldUsername] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [accountType, setAccountType] = useState('listener');
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    if (user.user_id === '') {
      navigate('/login');
      return;
    }

    const accountTypeMap = {
      1: 'listener',
      2: 'artist',
      3: 'admin'
    };
    setAccountType(accountTypeMap[user.role_id] || 'listener');
    
    fetchUserProfile();
  }, [user.user_id]);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get(`/user/profile/${user.user_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const { display_name } = response.data;
      setDisplayName(display_name || user.username);
      setLoading(false);
    } catch (err) {
      setError('Failed to load profile');
      setLoading(false);
    }
  };

  const handleCreatePlaylist = () => {
    navigate('/newplaylist');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser({ user_id: '', username: '', role_id: -1 });
    navigate('/#', { 
      state: { 
        showLogoutMessage: true,
        message: "You've been logged out successfully" 
      } 
    });
  };

  const getProfilePath = () => {
    if (!user.user_id) return '/';
    
    switch(user.role_id) {
      case 1:
        return '/listener';
      case 2:
        return '/artist/' + user.user_id;
      case 3:
        return '/admin';
      default:
        return '/';
    }
  };

  const handleNameChange = async () => {
    if (!displayName.trim()) {
      setError('Display name cannot be empty');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put('/user/displayname',
        { user_id: user.user_id, display_name: displayName },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccessMessage('Display name updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error updating display name');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleUsernameChange = async () => {
    if (!oldUsername || !newUsername) {
      setError('Please fill in both username fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put('/user/username',
        {
          user_id: user.user_id,
          old_username: oldUsername,
          new_username: newUsername
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccessMessage('Username changed successfully!');
      setOldUsername('');
      setNewUsername('');
      setUser({ ...user, username: newUsername });
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error updating username');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/user/delete/${user.user_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      localStorage.removeItem('token');
      setUser({ user_id: '', username: '', role_id: -1 });
      navigate('/#', { 
        state: { 
          showLogoutMessage: true,
          message: "Your account has been deleted successfully" 
        } 
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Error deleting account');
      setShowDeleteConfirmation(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#121212] text-[#EBE7CD] min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="bg-[#121212] text-[#EBE7CD] min-h-screen flex font-sans">
      {/* Sidebar */}
      <Sidebar handleCreatePlaylist={handleCreatePlaylist} handleLogout={handleLogout} />

      {/* Main content */}
      <div className="flex-1 flex flex-col p-4">
        <div className="max-w-md mx-auto w-full space-y-6 mt-8">
          <div className="text-3xl font-bold mb-8">{user.username}</div>

          {successMessage && (
            <Alert className="bg-green-700 border-green-600">
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}
          
          {error && (
            <Alert className="bg-red-700 border-red-600">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Name Change Section */}
          <div className="space-y-2">
            <label className="block text-sm">Name:</label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="flex-1 p-3 rounded bg-[#2A2A2A] text-[#EBE7CD]"
                placeholder="Display Name"
              />
              <button
                onClick={handleNameChange}
                className="px-4 rounded bg-[#2D2D2D] text-[#EBE7CD] hover:bg-[#3D3D3D]"
              >
                Change
              </button>
            </div>
          </div>

          {/* Change Username Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Change Username</h2>
            <input
              type="text"
              placeholder="Old Username"
              value={oldUsername}
              onChange={(e) => setOldUsername(e.target.value)}
              className="w-full p-3 rounded bg-[#2A2A2A] text-[#EBE7CD]"
            />
            <input
              type="text"
              placeholder="New Username"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="w-full p-3 rounded bg-[#2A2A2A] text-[#EBE7CD]"
            />
            <button
              onClick={handleUsernameChange}
              className="w-full p-3 rounded bg-[#2D2D2D] text-[#EBE7CD] hover:bg-[#3D3D3D] transition-colors"
            >
              Change Username
            </button>
          </div>

          {/* Delete Account Section */}
          <div className="pt-6">
            <button
              onClick={() => setShowDeleteConfirmation(true)}
              className="w-full p-3 rounded bg-[#2D2D2D] text-[#EBE7CD] hover:bg-[#3D3D3D] transition-colors"
            >
              Delete My Account
            </button>
            <p className="text-xs text-gray-400 text-center mt-2">
              Deleting your account will erase your information :(
            </p>
          </div>

          {showDeleteConfirmation && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-[#2A2A2A] p-6 rounded-lg max-w-sm w-full mx-4">
                <h3 className="text-xl font-bold mb-4">Delete Account</h3>
                <p className="text-sm mb-6">Are you sure you want to delete your account? This action cannot be undone.</p>
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setShowDeleteConfirmation(false)}
                    className="px-4 py-2 rounded bg-[#3D3D3D] text-[#EBE7CD] hover:bg-[#4D4D4D]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileSettings;
