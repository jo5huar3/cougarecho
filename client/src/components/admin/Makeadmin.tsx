import React, { useState } from 'react';
import axios from '../../api/axios'; // Ensure axios is properly configured to interact with your backend
import { Link, useNavigate } from 'react-router-dom';
import { Search, Home, Settings, Menu, User, X, LogOut } from 'lucide-react';

const CreateAdmin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);
  const navigate = useNavigate();

  // Password validation function
  const validatePassword = (password: string): string | null => {
    const minLength = 8;
    const hasCapital = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*]/.test(password);

    if (password.length < minLength) {
      return 'Password must be at least 8 characters long';
    }
    if (!hasCapital) {
      return 'Password must contain at least one capital letter!';
    }
    if (!hasNumber) {
      return 'Password must contain at least one number';
    }
    if (!hasSpecial) {
      return 'Password must contain at least one special character (!@#$%^&*)';
    }
    return null;
  };

  // Handler to create admin account
  const handleCreateAdmin = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    // Reset error and success messages
    setError('');
    setSuccessMessage('');

    // Validate password
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    try {
      // Make an API request to create an admin account
      const response = await axios.post('/create-admin', {
        username,
        password,
        role_id: 3 // Setting role_id to 3 to designate as admin
      });

      if (response.data?.token) {
        setSuccessMessage('Admin account created successfully');
        setUsername('');
        setPassword('');
        setConfirmPassword('');

        // Redirect to admin dashboard after 2 seconds
        setTimeout(() => {
          navigate('/admin');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create admin account. Please try again.');
    }
  };

  // Handle logout functionality
  const handleLogout = () => {
    navigate('/#', {
      state: {
        showLogoutMessage: true,
        message: "You've been logged out successfully",
      },
    });
  };

  return (
    <div className="bg-[#121212] text-[#EBE7CD] min-h-screen flex font-sans">
      {/* Sidebar */}
      <div
        className={`w-16 flex flex-col items-center py-4 bg-black border-r border-gray-800 transition-all duration-300 ease-in-out ${
          isMenuExpanded ? 'w-64' : 'w-16'
        }`}
      >
        <div className="flex flex-col items-center space-y-4 mb-8">
          <button
            onClick={() => setIsMenuExpanded(!isMenuExpanded)}
            className="text-[#1ED760] hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-grow"></div>
        <div className="mt-auto flex flex-col items-center space-y-4 mb-4">
          <Link to="/admin" className="text-[#1ED760] hover:text-white">
            <User className="w-6 h-6" />
          </Link>
        </div>
      </div>

      {/* Expandable Menu */}
      {isMenuExpanded && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="bg-[#121212] w-64 h-full p-4">
            <button onClick={() => setIsMenuExpanded(false)} className="mb-8 text-[#1ED760]">
              <X className="w-6 h-6" />
            </button>
            <nav>
              <ul className="space-y-4">
                <li>
                  <Link to="/homepage" className="text-[#EBE7CD] hover:text-[#1ED760] flex items-center">
                    <Home className="w-5 h-5 mr-3" /> Home
                  </Link>
                </li>
                <li>
                  <Link to="/search" className="text-[#EBE7CD] hover:text-[#1ED760] flex items-center">
                    <Search className="w-5 h-5 mr-3" /> Search
                  </Link>
                </li>
                <li>
                  <Link to="/admin" className="text-[#EBE7CD] hover:text-[#1ED760] flex items-center">
                    <User className="w-5 h-5 mr-3" /> Admin Dashboard
                  </Link>
                </li>
              </ul>
            </nav>
            <div className="mt-auto">
              <button
                onClick={handleLogout}
                className="text-[#EBE7CD] hover:text-[#1ED760] flex items-center mt-4 w-full"
              >
                <LogOut className="w-5 h-5 mr-3" /> Log out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col p-8">
        {/* Top bar */}
        <div className="flex justify-end items-center space-x-4 mb-8">
          <Link to="/homepage" className="text-[#1ED760] hover:text-white">
            <Home className="w-6 h-6" />
          </Link>
          <Link to="/admin" className="text-[#1ED760] hover:text-white">
            <Settings className="w-6 h-6" />
          </Link>
        </div>

        {/* Create Admin Form */}
        <div className="max-w-md mx-auto w-full">
          <h2 className="text-3xl font-bold mb-8">Create New Admin</h2>

          {successMessage && (
            <div className="mb-6 bg-green-800 text-[#EBE7CD] p-4 rounded-md">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleCreateAdmin} className="space-y-6">
            <div>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-4 rounded-full bg-[#165C3A] text-[#FAF5CE] placeholder-[#8BC4A9]"
                required
              />
            </div>

            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 rounded-full bg-[#165C3A] text-[#FAF5CE] placeholder-[#8BC4A9]"
                required
              />
            </div>

            <div>
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-4 rounded-full bg-[#165C3A] text-[#FAF5CE] placeholder-[#8BC4A9]"
                required
              />
            </div>

            {error && (
              <div className="bg-red-900 text-[#EBE7CD] p-4 rounded-md">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full p-4 rounded-full bg-[#4a8f4f] text-[#FAF5CE] hover:bg-[#5aa55f] transition-colors"
            >
              Create Admin Account
            </button>
          </form>

          <div className="mt-6">
            <Link to="/admin" className="text-[#1ED760] hover:underline text-center block">
              Back to Admin Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAdmin;