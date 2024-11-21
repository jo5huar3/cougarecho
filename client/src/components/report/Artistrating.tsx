import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import Sidebar from '../../components/sidebar/Sidebar';

interface ArtistReportData {
  artist_id: number;
  artist_name: string;
  created_at: string;
  total_songs: number;
  total_albums: number;
  total_likes: number;
}

const ArtistSummaryReport: React.FC = () => {
  const navigate = useNavigate();
  const [reportData, setReportData] = useState<ArtistReportData[]>([]);
  const [originalData, setOriginalData] = useState<ArtistReportData[]>([]);
  const [filteredData, setFilteredData] = useState<ArtistReportData[]>([]); // For cascading filters
  const [dateRange, setDateRange] = useState<{ startDate: Date; endDate: Date }>({
    startDate: new Date(),
    endDate: new Date(),
  });
  const [totalSongsRange, setTotalSongsRange] = useState<number>(0);
  const [totalAlbumsRange, setTotalAlbumsRange] = useState<number>(0);
  const [totalLikesRange, setTotalLikesRange] = useState<number>(0);
  const [maxSongs, setMaxSongs] = useState<number>(0);
  const [maxAlbums, setMaxAlbums] = useState<number>(0);
  const [maxLikes, setMaxLikes] = useState<number>(0);
  const [filteredCount, setFilteredCount] = useState<number>(0);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token') || '';
      try {
        const response = await axios.get('/artist-rating', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const data: ArtistReportData[] = response.data;
        setOriginalData(data);
        setFilteredData(data);
        setReportData(data);
        setFilteredCount(data.length);

        // Set initial max values for sliders
        const maxSongs = Math.max(...data.map(item => item.total_songs), 0);
        const maxAlbums = Math.max(...data.map(item => item.total_albums), 0);
        const maxLikes = Math.max(...data.map(item => item.total_likes), 0);
        setMaxSongs(maxSongs);
        setMaxAlbums(maxAlbums);
        setMaxLikes(maxLikes);
        setTotalSongsRange(maxSongs);
        setTotalAlbumsRange(maxAlbums);
        setTotalLikesRange(maxLikes);

        setErrMsg(null);
      } catch (error: any) {
        console.error('Error fetching artist summary report:', error);
        setErrMsg(error.response?.status === 401 ? 'Unauthorized: Please log in again.' : 'Failed to fetch artist summary report.');
      }
    };
    fetchData();
  }, []);

  const applyDateRangeFilter = () => {
    const filteredByDate = originalData.filter(row => {
      const createdAt = new Date(row.created_at);
      return createdAt >= dateRange.startDate && createdAt <= dateRange.endDate;
    });

    setFilteredData(filteredByDate); // Save for cascading filters
    setReportData(filteredByDate);
    setFilteredCount(filteredByDate.length);

    // Update slider max values
    const maxSongsAfterDateFilter = Math.max(...filteredByDate.map(row => row.total_songs), 0);
    const maxAlbumsAfterDateFilter = Math.max(...filteredByDate.map(row => row.total_albums), 0);
    const maxLikesAfterDateFilter = Math.max(...filteredByDate.map(row => row.total_likes), 0);
    setMaxSongs(maxSongsAfterDateFilter);
    setMaxAlbums(maxAlbumsAfterDateFilter);
    setMaxLikes(maxLikesAfterDateFilter);
    setTotalSongsRange(maxSongsAfterDateFilter);
    setTotalAlbumsRange(maxAlbumsAfterDateFilter);
    setTotalLikesRange(maxLikesAfterDateFilter);
  };

  const resetDateRangeFilter = () => {
    setDateRange({ startDate: new Date(), endDate: new Date() });
    setFilteredData(originalData); // Reset cascading filters
    setReportData(originalData);
    setFilteredCount(originalData.length);

    // Reset sliders to original max values
    setMaxSongs(Math.max(...originalData.map(row => row.total_songs), 0));
    setMaxAlbums(Math.max(...originalData.map(row => row.total_albums), 0));
    setMaxLikes(Math.max(...originalData.map(row => row.total_likes), 0));
    setTotalSongsRange(maxSongs);
    setTotalAlbumsRange(maxAlbums);
    setTotalLikesRange(maxLikes);
  };

  const filterBySliders = (newSongsRange: number, newAlbumsRange: number, newLikesRange: number) => {
    let dataToFilter = filteredData;

    if (newSongsRange < maxSongs) {
      dataToFilter = dataToFilter.filter(row => row.total_songs <= newSongsRange);
    }

    const dynamicMaxAlbums = Math.max(...dataToFilter.map(row => row.total_albums), 0);

    if (newAlbumsRange < dynamicMaxAlbums) {
      dataToFilter = dataToFilter.filter(row => row.total_albums <= newAlbumsRange);
    }

    const dynamicMaxLikes = Math.max(...dataToFilter.map(row => row.total_likes), 0);

    if (newLikesRange < dynamicMaxLikes) {
      dataToFilter = dataToFilter.filter(row => row.total_likes <= newLikesRange);
    }

    setReportData(dataToFilter);
    setFilteredCount(dataToFilter.length);

    setMaxAlbums(dynamicMaxAlbums);
    setMaxLikes(dynamicMaxLikes);
  };

  const handleSongsRangeChange = (value: number) => {
    setTotalSongsRange(value);
    filterBySliders(value, totalAlbumsRange, totalLikesRange);
  };

  const handleAlbumsRangeChange = (value: number) => {
    setTotalAlbumsRange(value);
    filterBySliders(totalSongsRange, value, totalLikesRange);
  };

  const handleLikesRangeChange = (value: number) => {
    setTotalLikesRange(value);
    filterBySliders(totalSongsRange, totalAlbumsRange, value);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="bg-[#121212] text-[#EBE7CD] p-8 flex-grow font-sans">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-semibold">Artist Summary Report</h1>
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
              <label>Total Songs:</label>
              <input
                type="range"
                min="0"
                max={maxSongs}
                value={totalSongsRange}
                onChange={(e) => handleSongsRangeChange(Number(e.target.value))}
                className="w-full"
              />
              <span>{`≤ ${totalSongsRange}`}</span>
            </div>
            <div>
              <label>Total Albums:</label>
              <input
                type="range"
                min="0"
                max={maxAlbums}
                value={totalAlbumsRange}
                onChange={(e) => handleAlbumsRangeChange(Number(e.target.value))}
                className="w-full"
              />
              <span>{`≤ ${totalAlbumsRange}`}</span>
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

        {/* Artist Summary Table */}
        <table className="min-w-full text-left table-auto bg-black text-white rounded shadow-lg">
          <thead>
            <tr>
              {['artist_name', 'created_at', 'total_songs', 'total_albums', 'total_likes'].map((key) => (
                <th key={key} className="px-4 py-2 border">
                  <span>
                    {key === 'artist_name' && 'Artist (ID)'}
                    {key === 'created_at' && 'Created At'}
                    {key !== 'artist_name' && key !== 'created_at' && key.replace('_', ' ').toUpperCase()}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reportData.map((row) => (
              <tr key={row.artist_id} className="hover:bg-[#3A3A3A] transition-colors">
                <td className="border px-4 py-2">
                  {row.artist_name} <span className="text-sm text-gray-400">({row.artist_id})</span>
                </td>
                <td className="border px-4 py-2">{new Date(row.created_at).toLocaleDateString()}</td>
                <td className="border px-4 py-2">{row.total_songs}</td>
                <td className="border px-4 py-2">{row.total_albums}</td>
                <td className="border px-4 py-2">{row.total_likes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ArtistSummaryReport;
