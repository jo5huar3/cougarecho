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
  const [dateRange, setDateRange] = useState<{ startDate: Date; endDate: Date }>({
    startDate: new Date(),
    endDate: new Date(),
  });
  const [errMsg, setErrMsg] = useState<string | null>(null);

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
        setReportData(data);
        setOriginalData(data);
        setErrMsg(null);
      } catch (error: any) {
        console.error('Error fetching user activity report:', error);
        setErrMsg(error.response?.status === 401 ? 'Unauthorized: Please log in again.' : 'Failed to fetch user activity report.');
      }
    };
    fetchData();
  }, []);

  const applyDateRangeFilter = () => {
    const { startDate, endDate } = dateRange;
    const filteredData = originalData.filter(row => {
      const accountCreationDate = new Date(row.account_created_at);
      return accountCreationDate >= startDate && accountCreationDate <= endDate;
    });
    setReportData(filteredData);
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
        <div className="filter-container mb-8">
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
          <button onClick={applyDateRangeFilter} className="bg-blue-400 text-white px-3 py-2 rounded mt-2">
            Apply Date Range Filter
          </button>
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
