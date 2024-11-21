import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import Sidebar from '../../components/sidebar/Sidebar';

interface SongReportData {
  song_name: string;
  artist_name: string;
  total_likes: number;
  total_plays: number;
  created_at: string;
}

const SongRatingReport: React.FC = () => {
  const navigate = useNavigate();
  const [reportData, setReportData] = useState<SongReportData[]>([]);
  const [originalData, setOriginalData] = useState<SongReportData[]>([]);
  const [filteredData, setFilteredData] = useState<SongReportData[]>([]); // For cascading filters
  const [dateRange, setDateRange] = useState<{ startDate: Date; endDate: Date }>({
    startDate: new Date(),
    endDate: new Date(),
  });
  const [totalPlaysRange, setTotalPlaysRange] = useState<number>(0);
  const [totalLikesRange, setTotalLikesRange] = useState<number>(0);
  const [maxPlays, setMaxPlays] = useState<number>(0);
  const [maxLikes, setMaxLikes] = useState<number>(0);
  const [filteredCount, setFilteredCount] = useState<number>(0);
  const [sortConfig, setSortConfig] = useState<{ key: keyof SongReportData; direction: 'asc' | 'desc' } | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token') || '';
      try {
        const response = await axios.get('/song-rating', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const data: SongReportData[] = response.data;
        setOriginalData(data);
        setFilteredData(data);
        setReportData(data);
        setFilteredCount(data.length);

        // Set initial max values for sliders
        const maxPlays = Math.max(...data.map(item => item.total_plays), 0);
        const maxLikes = Math.max(...data.map(item => item.total_likes), 0);
        setMaxPlays(maxPlays);
        setMaxLikes(maxLikes);
        setTotalPlaysRange(maxPlays);
        setTotalLikesRange(maxLikes);

        setErrMsg(null);
      } catch (error: any) {
        console.error('Error fetching song rating report:', error);
        setErrMsg(error.response?.status === 401 ? 'Unauthorized: Please log in again.' : 'Failed to fetch song rating report.');
      }
    };
    fetchData();
  }, []);

  const applyDateRangeFilter = () => {
    const filteredByDate = originalData.filter(row => {
      const uploadDate = new Date(row.created_at);
      return uploadDate >= dateRange.startDate && uploadDate <= dateRange.endDate;
    });

    setFilteredData(filteredByDate); // Save for cascading filters
    setReportData(filteredByDate);
    setFilteredCount(filteredByDate.length);

    // Update slider max values
    const maxPlaysAfterDateFilter = Math.max(...filteredByDate.map(row => row.total_plays), 0);
    const maxLikesAfterDateFilter = Math.max(...filteredByDate.map(row => row.total_likes), 0);
    setMaxPlays(maxPlaysAfterDateFilter);
    setMaxLikes(maxLikesAfterDateFilter);
    setTotalPlaysRange(maxPlaysAfterDateFilter);
    setTotalLikesRange(maxLikesAfterDateFilter);
  };

  const resetDateRangeFilter = () => {
    setDateRange({ startDate: new Date(), endDate: new Date() });
    setFilteredData(originalData); // Reset cascading filters
    setReportData(originalData);
    setFilteredCount(originalData.length);

    // Reset sliders to original max values
    setMaxPlays(Math.max(...originalData.map(row => row.total_plays), 0));
    setMaxLikes(Math.max(...originalData.map(row => row.total_likes), 0));
    setTotalPlaysRange(maxPlays);
    setTotalLikesRange(maxLikes);
  };

  const filterBySliders = (newPlaysRange: number, newLikesRange: number) => {
    let dataToFilter = filteredData;

    if (newPlaysRange < maxPlays) {
      dataToFilter = dataToFilter.filter(row => row.total_plays <= newPlaysRange);
    }

    const dynamicMaxLikes = Math.max(...dataToFilter.map(row => row.total_likes), 0);

    if (newLikesRange < dynamicMaxLikes) {
      dataToFilter = dataToFilter.filter(row => row.total_likes <= newLikesRange);
    }

    setReportData(dataToFilter);
    setFilteredCount(dataToFilter.length);

    setMaxLikes(dynamicMaxLikes);
  };

  const handlePlaysRangeChange = (value: number) => {
    setTotalPlaysRange(value);
    filterBySliders(value, totalLikesRange);
  };

  const handleLikesRangeChange = (value: number) => {
    setTotalLikesRange(value);
    filterBySliders(totalPlaysRange, value);
  };

  const handleSort = (column: keyof SongReportData) => {
    const direction = sortConfig?.direction === 'asc' ? 'desc' : 'asc';
    const sortedData = [...reportData].sort((a, b) => {
      if (a[column] < b[column]) return direction === 'asc' ? -1 : 1;
      if (a[column] > b[column]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    setReportData(sortedData);
    setSortConfig({ key: column, direction });
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="bg-[#121212] text-[#EBE7CD] p-8 flex-grow font-sans">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-semibold">Song Rating Report</h1>
          <button
            onClick={() => navigate('/admin')}
            className="bg-[#4a8f4f] text-[#FAF5CE] px-4 py-2 rounded hover:bg-[#5aa55f] transition-colors"
          >
            Return to Admin Dashboard
          </button>
        </div>

        {errMsg && <div className="text-red-500 mb-4">{errMsg}</div>}

        {/* Date Range Filter */}
        <div className="mb-4">
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
          <div className="flex space-x-4 mt-4">
            <button onClick={applyDateRangeFilter} className="bg-blue-400 text-white px-4 py-2 rounded">
              Apply Date Range
            </button>
            <button onClick={resetDateRangeFilter} className="bg-gray-400 text-white px-4 py-2 rounded">
              Reset Date Range
            </button>
          </div>
        </div>

        {/* Slider Filters */}
        <div className="mb-4">
          <div className="flex space-x-4">
            <div>
              <label>Total Plays:</label>
              <input
                type="range"
                min="0"
                max={maxPlays}
                value={totalPlaysRange}
                onChange={(e) => handlePlaysRangeChange(Number(e.target.value))}
                className="w-full"
              />
              <span>{`≤ ${totalPlaysRange}`}</span>
            </div>
            <div>
              <label>Total Likes:</label>
              <input
                type="range"
                min="0"
                max={maxLikes}
                value={totalLikesRange}
                onChange={(e) => handleLikesRangeChange(Number(e.target.value))}
                className="w-full"
              />
              <span>{`≤ ${totalLikesRange}`}</span>
            </div>
          </div>
        </div>

        {/* Total Results */}
        <div className="mb-4 text-lg font-semibold">
          Total Results Found: {filteredCount}
        </div>

        {/* Song Rating Table */}
        <table className="min-w-full text-left table-auto bg-black text-white rounded shadow-lg">
          <thead>
            <tr>
              {['song_name', 'created_at', 'total_plays', 'total_likes'].map((key) => (
                <th key={key} className="px-4 py-2 border">
                  <span onClick={() => handleSort(key as keyof SongReportData)} className="cursor-pointer">
                    {key === 'song_name' && 'Song Name'}
                    {key === 'created_at' && 'Upload Date'}
                    {key === 'total_plays' && 'Total Plays'}
                    {key === 'total_likes' && 'Total Likes'}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reportData.map((row, index) => (
              <tr key={index} className="hover:bg-[#3A3A3A] transition-colors">
                <td className="border px-4 py-2">
                  <div>
                    <div>{row.song_name}</div>
                    <div className="text-sm text-gray-400 italic">{row.artist_name}</div>
                  </div>
                </td>
                <td className="border px-4 py-2">{new Date(row.created_at).toLocaleDateString()}</td>
                <td className="border px-4 py-2">{row.total_plays}</td>
                <td className="border px-4 py-2">{row.total_likes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SongRatingReport;
