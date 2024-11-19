import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import Sidebar from '../../components/sidebar/Sidebar';

interface ArtistReportData {
  artist_id: number;
  artist_name: string;
  total_songs: number;
  total_albums: number;
  total_likes: number;
}

const ArtistSummaryReport: React.FC = () => {
  const navigate = useNavigate();
  const [reportData, setReportData] = useState<ArtistReportData[]>([]);
  const [originalData, setOriginalData] = useState<ArtistReportData[]>([]);
  const [filterVisible, setFilterVisible] = useState<string | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<{ [key: string]: any[] }>({});
  const [sortConfig, setSortConfig] = useState<{ key: keyof ArtistReportData; direction: 'asc' | 'desc' } | null>(null);
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
        setReportData(response.data);
        setOriginalData(response.data);
        setErrMsg(null);
      } catch (error: any) {
        console.error('Error fetching artist summary report:', error);
        setErrMsg(error.response?.status === 401 ? 'Unauthorized: Please log in again.' : 'Failed to fetch artist summary report.');
      }
    };
    fetchData();
  }, []);

  const handleCheckboxFilter = (column: keyof ArtistReportData, value: any) => {
    setSelectedFilters((prev) => {
      const currentFilters = prev[column] || [];
      const updatedFilters = currentFilters.includes(value)
        ? currentFilters.filter((v) => v !== value)
        : [...currentFilters, value];
      return { ...prev, [column]: updatedFilters };
    });
  };

  const applyFilters = () => {
    let filteredData = originalData;
    Object.keys(selectedFilters).forEach((column) => {
      const columnFilters = selectedFilters[column];
      if (columnFilters.length > 0) {
        filteredData = filteredData.filter((row) => columnFilters.includes(row[column as keyof ArtistReportData]));
      }
    });
    setReportData(filteredData);
  };

  const clearFilters = (column: keyof ArtistReportData) => {
    setSelectedFilters((prev) => ({ ...prev, [column]: [] }));
    setReportData(originalData);
  };

  const handleSort = (column: keyof ArtistReportData) => {
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
          <h1 className="text-3xl font-semibold">Artist Summary Report</h1>
          <button onClick={() => navigate('/admin')} className="bg-[#4a8f4f] text-[#FAF5CE] px-4 py-2 rounded hover:bg-[#5aa55f] transition-colors">
            Return to Admin Dashboard
          </button>
        </div>

        {errMsg && <div className="text-red-500 mb-4">{errMsg}</div>}

        <table className="min-w-full text-left table-auto bg-black text-white rounded shadow-lg">
          <thead>
            <tr>
              {['artist_id', 'artist_name', 'total_songs', 'total_albums', 'total_likes'].map((key) => (
                <th key={key} className="px-4 py-2 border">
                  <div className="flex justify-between items-center">
                    <span onClick={() => handleSort(key as keyof ArtistReportData)} className="cursor-pointer">
                      {key.replace('_', ' ').toUpperCase()}
                      {sortConfig?.key === key ? (sortConfig.direction === 'asc' ? ' 🔼' : ' 🔽') : ''}
                    </span>
                    <button onClick={() => setFilterVisible(filterVisible === key ? null : key)} className="ml-2 cursor-pointer">
                      {filterVisible === key ? '▲' : '▼'}
                    </button>
                  </div>
                  {filterVisible === key && (
                    <div className="mt-2 p-2 bg-[#1f1f1f] rounded shadow-md max-h-32 overflow-y-auto">
                      {Array.from(new Set(originalData.map(row => row[key as keyof ArtistReportData]))).map((value, index) => (
                        <div key={index} className="flex items-center mb-1">
                          <input
                            type="checkbox"
                            checked={(selectedFilters[key] || []).includes(value)}
                            onChange={() => handleCheckboxFilter(key as keyof ArtistReportData, value)}
                            className="mr-2"
                          />
                          <label>{String(value)}</label>
                        </div>
                      ))}
                      <div className="flex justify-between mt-2">
                        <button onClick={applyFilters} className="bg-blue-400 text-white px-3 py-1 rounded">
                          Apply
                        </button>
                        <button onClick={() => clearFilters(key as keyof ArtistReportData)} className="bg-red-400 text-white px-3 py-1 rounded">
                          Clear
                        </button>
                      </div>
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reportData.map((row) => (
              <tr key={row.artist_id} className="hover:bg-[#3A3A3A] transition-colors">
                <td className="border px-4 py-2">{row.artist_id}</td>
                <td className="border px-4 py-2">{row.artist_name}</td>
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
