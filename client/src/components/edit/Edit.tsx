import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Settings, Home, Edit2, User } from 'lucide-react';
import Sidebar from '../../components/sidebar/Sidebar'; // Import Sidebar component

const UserProfileSettings = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('Anailemone');
  const [isEditingName, setIsEditingName] = useState(false);
  const [oldEmail, setOldEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [accountType, setAccountType] = useState('listener');
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    document.title = `${name}'s Profile Settings`;
    fetchAccountType();
  }, [name]);

  const fetchAccountType = () => {
    // Mock API call to fetch account type
    setTimeout(() => {
      const types = ['listener', 'admin', 'artist'];
      setAccountType(types[Math.floor(Math.random() * types.length)]);
    }, 1000);
  };

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    sessionStorage.clear();
    navigate('/#', { 
      state: { 
        showLogoutMessage: true,
        message: "You've been logged out successfully" 
      } 
    });
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    if (value.length > 0) {
      navigate(`/search?keyword=${encodeURIComponent(value)}`, { replace: true });
    } else {
      navigate('/useredit', { replace: true });
    }
  };

  const handleCreatePlaylist = () => {
    navigate('/newplaylist');
  };

  const getProfilePath = () => {
    switch(accountType) {
      case 'admin':
        return '/admin';
      case 'artist':
        return '/artist';
      default:
        return '/listener';
    }
  };

  const handleNameSubmit = (e) => {
    e.preventDefault();
    setIsEditingName(false);
    setSuccessMessage('Name updated successfully!');
  };

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords don't match");
    } else {
      setPasswordError('');
      setSuccessMessage('Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const handleEmailChange = () => {
    setSuccessMessage('Email changed successfully!');
    setOldEmail('');
    setNewEmail('');
  };

  const handleDeleteAccount = () => {
    setSuccessMessage('Account deleted successfully!');
    setShowDeleteConfirmation(false);
  };

  return (
    <div className="bg-[#121212] text-[#EBE7CD] min-h-screen flex font-sans">
      {/* Sidebar */}
      <Sidebar handleCreatePlaylist={handleCreatePlaylist} handleLogout={handleLogout} />

      {/* Main content */}
      <div className="flex-1 flex flex-col p-4 overflow-y-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1 mr-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for Song or Artist"
                className="w-full bg-gray-800 rounded-full py-2 pl-10 pr-4 text-sm text-gray-200"
                value={searchValue}
                onChange={handleSearchChange}
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/homepage" className="text-[#1ED760] hover:text-white">
              <Home className="w-6 h-6" />
            </Link>
            <Link to={getProfilePath()} className="text-[#1ED760] hover:text-white">
              <Settings className="w-6 h-6" />
            </Link>
          </div>
        </div>

        {/* Profile Settings */}
        <div className="max-w-md mx-auto w-full space-y-4">
          {successMessage && (
            <div className="bg-green-700 text-white p-3 rounded">
              {successMessage}
            </div>
          )}
          
          <div className="flex items-center justify-between">
            {isEditingName ? (
              <form onSubmit={handleNameSubmit} className="flex-1 mr-2">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-800 rounded py-2 px-3 text-gray-200"
                  autoFocus
                />
              </form>
            ) : (
              <h1 className="text-2xl font-bold">{name}</h1>
            )}
            <button
              onClick={() => setIsEditingName(!isEditingName)}
              aria-label={isEditingName ? "Save name" : "Edit name"}
              className="text-gray-400 hover:text-white"
            >
              <Edit2 className="w-5 h-5" />
            </button>
            <Link to={getProfilePath()} aria-label="Profile">
              <User className="w-5 h-5 text-gray-400" />
            </Link>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mb-2">Change Email</h2>
            <input
              type="email"
              placeholder="Old Email"
              value={oldEmail}
              onChange={(e) => setOldEmail(e.target.value)}
              className="w-full bg-gray-800 rounded py-2 px-3 text-gray-200 mb-2"
            />
            <input
              type="email"
              placeholder="New Email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full bg-gray-800 rounded py-2 px-3 text-gray-200 mb-2"
            />
            <button 
              onClick={handleEmailChange}
              className="w-full bg-gray-700 hover:bg-gray-600 text-gray-200 font-bold py-2 px-4 rounded"
            >
              Change Email
            </button>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Change Password</h2>
            <input
              type="password"
              placeholder="Old Password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full bg-gray-800 rounded py-2 px-3 text-gray-200 mb-2"
            />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-gray-800 rounded py-2 px-3 text-gray-200 mb-2"
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-gray-800 rounded py-2 px-3 text-gray-200 mb-2"
            />
            {passwordError && <p className="text-red-500 text-sm mb-2">{passwordError}</p>}
            <button 
              onClick={handlePasswordChange}
              className="w-full bg-gray-700 hover:bg-gray-600 text-gray-200 font-bold py-2 px-4 rounded"
            >
              Change Password
            </button>
          </div>

          <div>
            <button 
              onClick={() => setShowDeleteConfirmation(true)} 
              className="w-full bg-gray-800 hover:bg-gray-700 text-gray-400 font-bold py-2 px-4 rounded transition duration-300"
            >
              Delete My Account
            </button>
            {showDeleteConfirmation && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-[#282828] p-6 rounded-lg">
                  <h3 className="text-xl font-bold mb-4">Are you absolutely sure?</h3>
                  <p className="mb-4">This action cannot be undone. This will permanently delete your account and remove your data from our servers.</p>
                  <div className="flex justify-end space-x-4">
                    <button 
                      onClick={() => setShowDeleteConfirmation(false)}
                      className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleDeleteAccount}
                      className="px-4 py-2 bg-red-600 rounded hover:bg-red-700"
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 text-center">
            Deleting your account will erase your information :(
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserProfileSettings;
