import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, Menu, PlusCircle, User, X, Music, LogOut, Search, Bell } from 'lucide-react';
import ArtistNotifications from '../../components/notification/Notification';
import axios from '../../api/axios';

interface Notification {
  id: number;
  type: string;
  message: string;
  timestamp: string;
  count: number;
  urgent?: boolean;
}

interface SidebarProps {
  handleCreatePlaylist?: () => void;
  handleLogout?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ handleCreatePlaylist, handleLogout }) => {
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [artistId, setArtistId] = useState<number | null>(null);
  const [hasUnread, setHasUnread] = useState(false); // To track unread notifications
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArtistIdAndNotifications = async () => {
      const userId = localStorage.getItem('user_id');
      const roleId = localStorage.getItem('role_id');
      const token = localStorage.getItem('token') || '';

      if (!userId || roleId !== '2') return; // Only proceed if role_id is 2 (artist)

      try {
        const artistIdResponse = await axios.get(`/artist-id/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const fetchedArtistId = artistIdResponse.data.artist_id;
        setArtistId(fetchedArtistId);

        const notificationsResponse = await axios.get(`/artist/${fetchedArtistId}/notifications`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        setNotifications(notificationsResponse.data);
        setHasUnread(notificationsResponse.data.some((notif: Notification) => notif.count > 0));
      } catch (err) {
        console.error('Error fetching artist ID or notifications:', err);
      }
    };

    fetchArtistIdAndNotifications();
  }, []);

  const handleMenuToggle = () => {
    setIsMenuExpanded((prev) => {
      const newMenuExpandedState = !prev;
      if (!newMenuExpandedState) {
        setShowNotifications(false); // Auto-close notifications panel when sidebar is collapsed
      }
      return newMenuExpandedState;
    });
  };

  const handleNotificationClick = () => {
    setShowNotifications((prev) => !prev); // Toggle notifications panel
    if (!showNotifications) {
      setHasUnread(false); // Remove the red dot once notifications are opened
    }
  };

  const handleSingleNotificationClick = (id: number) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, count: 0 } : notif))
    );
  };

  const defaultHandleCreatePlaylist = () => {
    navigate('/newplaylist');
  };

  const defaultHandleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role_id');
    localStorage.removeItem('user_id');
    navigate('/#');
  };

  return (
    <>
      {/* Sidebar */}
      <div
        className={`w-16 flex flex-col items-center py-4 bg-black border-r border-gray-800 transition-all duration-300 ease-in-out ${
          isMenuExpanded ? 'w-64' : 'w-16'
        }`}
      >
        <div className="flex flex-col items-center space-y-4 mb-8">
          <button
            onClick={handleMenuToggle}
            className="text-[#1ED760] hover:text-white"
            aria-label="Menu"
          >
            {isMenuExpanded ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        <div className="flex-grow"></div>

        <div className="mt-auto flex flex-col items-center space-y-4 mb-4">
          {artistId && isMenuExpanded && (
            <div className="relative w-full">
              <button
                onClick={handleNotificationClick}
                className="w-full text-left px-4 py-2 text-[#EBE7CD] hover:text-[#1ED760] hover:bg-gray-800 flex items-center"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5 mr-3" />
                {hasUnread && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute top-full left-0 w-full mt-2 bg-[#2A2A2A] rounded-lg shadow-lg overflow-hidden">
                  {notifications.length > 0 ? (
                    <ArtistNotifications
                      notifications={notifications}
                      artistId={artistId}
                      onNotificationClick={handleSingleNotificationClick}
                    />
                  ) : (
                    <div className="p-4 text-[#EBE7CD] text-sm text-center">
                      You Do Not Have Any Notifications
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          <button
            onClick={handleCreatePlaylist || defaultHandleCreatePlaylist}
            className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-[#EBE7CD] hover:text-white"
            aria-label="Add"
          >
            <PlusCircle className="w-6 h-6" />
          </button>
          <Link to="/useredit" aria-label="User Profile" className="text-[#1ED760] hover:text-white">
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
                {artistId && (
                  <li className="relative cursor-pointer">
                    <div onClick={handleNotificationClick} className="text-[#EBE7CD] hover:text-[#1ED760] flex items-center">
                      <Bell className="w-5 h-5 mr-3" /> Notifications
                      {hasUnread && (
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                      )}
                    </div>
                    {showNotifications && (
                      <div className="absolute top-full left-0 mt-2 w-full bg-[#2A2A2A] rounded-lg shadow-lg overflow-hidden">
                        {notifications.length > 0 ? (
                          <ArtistNotifications
                            notifications={notifications}
                            artistId={artistId}
                            onNotificationClick={handleSingleNotificationClick}
                          />
                        ) : (
                          <div className="p-4 text-[#EBE7CD] text-sm text-center">
                            You Do Not Have Any Notifications
                          </div>
                        )}
                      </div>
                    )}
                  </li>
                )}
                <li>
                  <Link to="/search" className="text-[#EBE7CD] hover:text-[#1ED760] flex items-center">
                    <Search className="w-5 h-5 mr-3" /> Search
                  </Link>
                </li>
                <li>
                  <Link to="/userlibrary" className="text-[#EBE7CD] hover:text-[#1ED760] flex items-center">
                    <Music className="w-5 h-5 mr-3" /> Your Library
                  </Link>
                </li>
                <li>
                  <button
                    onClick={handleCreatePlaylist || defaultHandleCreatePlaylist}
                    className="text-[#EBE7CD] hover:text-[#1ED760] flex items-center w-full"
                  >
                    <PlusCircle className="w-5 h-5 mr-3" /> Create Playlist
                  </button>
                </li>
              </ul>
            </nav>
            <div className="mt-auto">
              <Link to="/useredit" className="text-[#EBE7CD] hover:text-[#1ED760] flex items-center mt-4">
                <User className="w-5 h-5 mr-3" /> Profile
              </Link>
              <button
                onClick={handleLogout || defaultHandleLogout}
                className="text-[#EBE7CD] hover:text-[#1ED760] flex items-center mt-4 w-full"
              >
                <LogOut className="w-5 h-5 mr-3" /> Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
