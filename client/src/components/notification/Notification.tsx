import React from 'react';
import { Circle, Music, Flag, TrendingUp, DollarSign, VerifiedIcon } from 'lucide-react';

interface Notification {
  id: number;
  type: string;
  message: string;
  timestamp: string;
  count: number;
  urgent?: boolean;
}

interface ArtistNotificationsProps {
  notifications: Notification[];
  artistId: number;
  onNotificationClick: (id: number) => void;
}

const ArtistNotifications: React.FC<ArtistNotificationsProps> = ({ notifications, onNotificationClick }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'flag':
        return <Flag className="w-4 h-4 text-red-400" />;
      case 'verification':
        return <VerifiedIcon className="w-4 h-4 text-green-400" />;
      case 'revenue':
        return <DollarSign className="w-4 h-4 text-blue-400" />;
      default:
        return <Music className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="max-w-md mx-auto bg-[#2A2A2A] rounded-lg shadow-lg overflow-hidden">
      <div className="p-3 bg-[#1A1A1A] border-b border-gray-700">
        <h3 className="text-sm font-semibold text-[#EBE7CD]">Notifications</h3>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-3 border-b border-gray-700 hover:bg-[#383838] cursor-pointer ${
              notification.count > 0 ? 'bg-opacity-10 bg-[#1ED760]' : ''
            }`}
            onClick={() => onNotificationClick(notification.id)}
          >
            <div className="flex items-start space-x-3">
              <div className="mt-1">{getIcon(notification.type)}</div>
              <div className="flex-1">
                <p className="text-sm text-[#EBE7CD]">{notification.message}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(notification.timestamp).toLocaleString()}</p>
              </div>
              {notification.count > 0 && (
                <Circle className="w-2 h-2 text-[#1ED760] fill-current" />
              )}
            </div>
            {notification.urgent && (
              <div className="mt-2 bg-red-900 border border-red-800 p-2 rounded">
                <p className="text-xs text-red-200">Requires immediate attention</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ArtistNotifications;
