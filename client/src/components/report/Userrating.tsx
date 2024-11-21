import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import Sidebar from '../../components/sidebar/Sidebar';
import './UserActivityReport.css';

interface UserReportData {
  username: string;
  songs_played: number;
  playlists_created: number;
  account_created_at: string;
}

const UserActivityReport: React.FC = () => {
  const navigate = useNavigate();
  const [reportData, setReportData] = useState<UserReportData[]>([]);
  const [originalData, setOriginalData] = useState<UserReportData[]>([]);
  const [filteredData, setFilteredData] = useState<UserReportData[]>([]); // For cascading filters
  const [dateRange, setDateRange] = useState<{ startDate: Date; endDate: Date }>({
    startDate: new Date(),
    endDate: new Date(),
  });
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [playRange, setPlayRange] = useState<number>(0);
  const [playlistRange, setPlaylistRange] = useState<number>(0);
  const [maxPlays, setMaxPlays] = useState<number>(0);
  const [maxPlaylists, setMaxPlaylists] = useState<number>(0);
  const [filteredCount, setFilteredCount] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token') || '';
      try {
        const response = await axios.get('/user-rating', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const data: UserReportData[] = response.data;
        setOriginalData(data);
        setFilteredData(data);
        setReportData(data);
        setFilteredCount(data.length);

        // Set initial maximum values for sliders
        const maxPlays = Math.max(...data.map(item => item.songs_played), 0);
        const maxPlaylists = Math.max(...data.map(item => item.playlists_created), 0);
        setMaxPlays(maxPlays);
        setMaxPlaylists(maxPlaylists);
        setPlayRange(maxPlays);
        setPlaylistRange(maxPlaylists);

        setErrMsg(null);
      } catch (error: any) {
        console.error('Error fetching user activity report:', error);
        setErrMsg(error.response?.status === 401 ? 'Unauthorized: Please log in again.' : 'Failed to fetch user activity report.');
      }
    };
    fetchData();
  }, []);

  const applyDateRangeFilter = () => {
    const filteredByDate = originalData.filter(row => {
      const accountCreationDate = new Date(row.account_created_at);
      return (
        accountCreationDate >= dateRange.startDate &&
        accountCreationDate <= dateRange.endDate
      );
    });

    setFilteredData(filteredByDate); // Save for cascading filters
    setReportData(filteredByDate);
    setFilteredCount(filteredByDate.length);

    // Update sliders dynamically based on date filter
    const maxPlaysAfterDateFilter = Math.max(...filteredByDate.map(row => row.songs_played), 0);
    const maxPlaylistsAfterDateFilter = Math.max(...filteredByDate.map(row => row.playlists_created), 0);
    setMaxPlays(maxPlaysAfterDateFilter);
    setMaxPlaylists(maxPlaylistsAfterDateFilter);
    setPlayRange(maxPlaysAfterDateFilter);
    setPlaylistRange(maxPlaylistsAfterDateFilter);
  };

  const resetDateRangeFilter = () => {
    setDateRange({ startDate: new Date(), endDate: new Date() }); // Reset start day to current day
    setFilteredData(originalData); // Reset cascading filters
    setReportData(originalData);
    setFilteredCount(originalData.length);

    // Reset sliders to original max values
    setMaxPlays(Math.max(...originalData.map(row => row.songs_played), 0));
    setMaxPlaylists(Math.max(...originalData.map(row => row.playlists_created), 0));
    setPlayRange(maxPlays);
    setPlaylistRange(maxPlaylists);
  };

  const filterBySliders = (newPlayRange: number, newPlaylistRange: number) => {
    let dataToFilter = filteredData; // Use the filtered data from the day-range filter

    // Apply Total Plays filter
    if (newPlayRange < maxPlays) {
      dataToFilter = dataToFilter.filter(row => row.songs_played <= newPlayRange);
    }

    // Update max value for Playlists Created slider based on filtered data
    const dynamicMaxPlaylists = Math.max(...dataToFilter.map(row => row.playlists_created), 0);

    // Apply Playlists Created filter
    if (newPlaylistRange < dynamicMaxPlaylists) {
      dataToFilter = dataToFilter.filter(row => row.playlists_created <= newPlaylistRange);
    }

    // Update state
    setReportData(dataToFilter);
    setFilteredCount(dataToFilter.length);

    // Dynamically update the max values for sliders
    setMaxPlaylists(dynamicMaxPlaylists);
  };

  const handlePlayRangeChange = (value: number) => {
    setPlayRange(value);
    filterBySliders(value, playlistRange);
  };

  const handlePlaylistRangeChange = (value: number) => {
    setPlaylistRange(value);
    filterBySliders(playRange, value);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="bg-[#121212] text-[#EBE7CD] p-8 flex-grow font-sans">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-semibold">User Activity Report</h1>
          <button onClick={() => navigate('/admin')} className="bg-[#4a8f4f] text-[#FAF5CE] px-4 py-2 rounded hover:bg-[#5aa55f] transition-colors">
            Return to Admin Dashboard
          </button>
        </div>

        {errMsg && <div className="text-red-500 mb-4">{errMsg}</div>}

        {/* Date Range Filter */}
        <div className="filter-container mb-4">
          <div className="flex space-x-4">
            <div>
              <label>Start Date:</label>
              <input
                type="date"
                value={dateRange.startDate.toISOString().substring(0, 10)}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: new Date(e.target.value) }))}
                className="bg-[#1f1f1f] text-white p-2 rounded"
              />
            </div>
            <div>
              <label>End Date:</label>
              <input
                type="date"
                value={dateRange.endDate.toISOString().substring(0, 10)}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: new Date(e.target.value) }))}
                className="bg-[#1f1f1f] text-white p-2 rounded"
              />
            </div>
          </div>
          <div className="flex justify-start mt-4 space-x-4">
            <button onClick={applyDateRangeFilter} className="bg-blue-400 text-white px-4 py-2 rounded">
              Apply Date Range
            </button>
            <button onClick={resetDateRangeFilter} className="bg-gray-400 text-white px-4 py-2 rounded">
              Reset Date Range
            </button>
          </div>
        </div>

        {/* Slider Filters */}
        <div className="slider-filter mb-4">
          <div className="flex space-x-4">
            <div>
              <label>Total Plays:</label>
              <input
                type="range"
                min="0"
                max={maxPlays}
                value={playRange}
                onChange={(e) => handlePlayRangeChange(Number(e.target.value))}
                className="w-full"
              />
              <span>{`≤ ${playRange}`}</span>
            </div>
            <div>
              <label>Playlists Created:</label>
              <input
                type="range"
                min="0"
                max={maxPlaylists}
                value={playlistRange}
                onChange={(e) => handlePlaylistRangeChange(Number(e.target.value))}
                className="w-full"
              />
              <span>{`≤ ${playlistRange}`}</span>
            </div>
          </div>
        </div>

        {/* Total Results */}
        <div className="mb-4 text-lg font-semibold">
          Total Results Found: {filteredCount}
        </div>

        {/* User Activity Table */}
        <table className="min-w-full text-left table-auto bg-black text-white rounded shadow-lg">
          <thead>
            <tr>
              <th className="px-4 py-2 border">Username</th>
              <th className="px-4 py-2 border">Account Creation Day</th>
              <th className="px-4 py-2 border">Total Plays</th>
              <th className="px-4 py-2 border">Playlists Created</th>
            </tr>
          </thead>
          <tbody>
            {reportData.map((row, index) => (
              <tr key={index} className="hover:bg-[#3A3A3A] transition-colors">
                <td className="border px-4 py-2">{row.username}</td>
                <td className="border px-4 py-2">{new Date(row.account_created_at).toLocaleDateString("en-US")}</td>
                <td className="border px-4 py-2">{row.songs_played}</td>
                <td className="border px-4 py-2">{row.playlists_created}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserActivityReport;
