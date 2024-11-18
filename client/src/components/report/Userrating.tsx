import React, { useState, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  ColumnDef,
  flexRender,
  ColumnFiltersState,
} from '@tanstack/react-table';
import axios from '../../api/axios';
import Sidebar from '../../components/sidebar/Sidebar';

interface UserReportData {
  user_id: number;
  username: string;
  songs_played: number;
  playlists_created: number;
  likes_given: number;
}

const UserActivityReport: React.FC = () => {
  const [reportData, setReportData] = useState<UserReportData[]>([]);
  const [originalData, setOriginalData] = useState<UserReportData[]>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [filterVisible, setFilterVisible] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState<{ [key: string]: string }>({});
  const [pendingFilters, setPendingFilters] = useState<{ [key: string]: any[] }>({});
  const [errMsg, setErrMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token') || '';

      try {
        // Fetch the user activity data from backend API
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
        if (error.response && error.response.status === 401) {
          setErrMsg('Unauthorized: Please log in again.');
        } else {
          setErrMsg('Failed to fetch user activity report.');
        }
      }
    };

    // Fetch user activity data when component mounts
    fetchData();
  }, []);

  const columns = React.useMemo<ColumnDef<UserReportData>[]>(() => [
    {
      accessorKey: 'user_id',
      header: 'User ID',
      cell: info => info.getValue(),
      filterFn: 'includesString',
      enableColumnFilter: true,
    },
    {
      accessorKey: 'username',
      header: 'Username',
      cell: info => info.getValue(),
      filterFn: 'includesString',
      enableColumnFilter: true,
    },
    {
      accessorKey: 'songs_played',
      header: 'Total Plays',
      cell: info => info.getValue(),
      filterFn: 'includesString',
      enableColumnFilter: true,
    },
    {
      accessorKey: 'playlists_created',
      header: 'Playlists Created',
      cell: info => info.getValue(),
      filterFn: 'includesString',
      enableColumnFilter: true,
    },
    {
      accessorKey: 'likes_given',
      header: 'Total Likes',
      cell: info => info.getValue(),
      filterFn: 'includesString',
      enableColumnFilter: true,
    },
  ], []);

  const table = useReactTable({
    data: reportData,
    columns,
    state: {
      columnFilters,
    },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const applyFilter = (header) => {
    const filterValues = pendingFilters[header.id] && pendingFilters[header.id].length > 0 ? pendingFilters[header.id] : undefined;
    if (filterValues) {
      const filteredData = originalData.filter(row => filterValues.includes(row[header.column.id]));
      filteredData.sort((a, b) => {
        const indexA = filterValues.indexOf(a[header.column.id]);
        const indexB = filterValues.indexOf(b[header.column.id]);
        return indexA - indexB;
      });
      setReportData(filteredData);
    } else {
      setReportData(originalData);
    }
    setFilterVisible(null);
  };

  const handleFilterButtonClick = (headerId) => {
    setFilterVisible(prev => (prev === headerId ? null : headerId));
    setPendingFilters({ [headerId]: pendingFilters[headerId] || [] });
    setSearchValue({ [headerId]: searchValue[headerId] || '' });
  };

  const handleClearFilter = (header) => {
    if ((pendingFilters[header.id] || []).length === 0 && searchValue[header.id]) {
      setSearchValue(prev => ({ ...prev, [header.id]: '' }));
    } else {
      setPendingFilters(prev => ({ ...prev, [header.id]: [] }));
      setSearchValue(prev => ({ ...prev, [header.id]: '' }));
      setReportData(originalData);
      setFilterVisible(null);
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar /> {/* Sidebar on the left */}
      <div className="bg-[#121212] text-[#EBE7CD] p-8 flex-grow font-sans">
        <h1 className="text-3xl font-semibold mb-8">User Activity Report</h1>

        {/* Error Message */}
        {errMsg && (
          <div className="text-red-500 mb-4">{errMsg}</div>
        )}

        <div className="mb-8 table-container">
          <table className="min-w-full text-left table-auto bg-black text-white rounded shadow-lg">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className="px-4 py-2 border relative">
                      <div className="flex items-center justify-between">
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanFilter() ? (
                          <div className="relative ml-2">
                            <span
                              onClick={() => handleFilterButtonClick(header.id)}
                              className="cursor-pointer"
                            >
                              {filterVisible === header.id ? '▲' : '▼'}
                            </span>
                            {filterVisible === header.id && (
                              <div
                                className={`absolute z-10 mt-2 p-2 bg-[#1f1f1f] text-[#EBE7CD] rounded shadow-md w-64 ${
                                  headerGroup.headers[headerGroup.headers.length - 1].id === header.id
                                    ? 'right-0'
                                    : 'left-0'
                                }`}
                              >
                                <div className="flex items-center mb-2">
                                  <input
                                    type="checkbox"
                                    checked={
                                      pendingFilters[header.id] &&
                                      pendingFilters[header.id].length === originalData.filter(row => row[header.column.id] !== undefined).length
                                    }
                                    onChange={(e) => {
                                      const allValues = Array.from(new Set(originalData.map(row => row[header.column.id])));
                                      setPendingFilters(prev => ({
                                        ...prev,
                                        [header.id]: e.target.checked ? allValues : []
                                      }));
                                    }}
                                    className="mr-2"
                                  />
                                  <input
                                    type="text"
                                    value={searchValue[header.id] || ''}
                                    onChange={(e) =>
                                      setSearchValue((prev) => ({
                                        ...prev,
                                        [header.id]: e.target.value,
                                      }))
                                    }
                                    placeholder="Search"
                                    className="w-full px-2 py-1 border rounded bg-[#333] text-[#EBE7CD] max-w-[calc(100%-32px)]"
                                    style={{ maxWidth: 'calc(100% - 32px)' }}
                                  />
                                </div>
                                <div className="max-h-32 overflow-y-auto mb-2">
                                  {Array.from(
                                    new Set(originalData.map((row) => row[header.column.id]))
                                  )
                                    .filter((value) =>
                                      value
                                        .toString()
                                        .toLowerCase()
                                        .includes((searchValue[header.id] || '').toLowerCase())
                                    )
                                    .sort((a, b) => {
                                      if (typeof a === 'string' && typeof b === 'string') {
                                        return a.localeCompare(b); // Sort alphabetically if strings
                                      } else if (typeof a === 'number' && typeof b === 'number') {
                                        return a - b; // Sort numerically if numbers
                                      }
                                      return 0;
                                    })
                                    .map((value, index) => (
                                      <div key={index} className="flex items-center">
                                        <input
                                          type="checkbox"
                                          id={`${header.id}-filter-${index}`}
                                          checked={(pendingFilters[header.id] || []).includes(value)}
                                          onChange={(e) => {
                                            const currentFilterValue =
                                              pendingFilters[header.id] || [];
                                            const newFilterValue = e.target.checked
                                              ? [...currentFilterValue, value]
                                              : currentFilterValue.filter((v) => v !== value);
                                            setPendingFilters((prev) => ({
                                              ...prev,
                                              [header.id]: newFilterValue,
                                            }));
                                          }}
                                          className="mr-2"
                                        />
                                        <label htmlFor={`${header.id}-filter-${index}`}>
                                          {value}
                                        </label>
                                      </div>
                                    ))}
                                </div>
                                <div className="flex justify-between mt-2 space-x-0.5">
                                  <button
                                    onClick={() => applyFilter(header)}
                                    className="text-sm bg-blue-400 text-white px-3 py-2 rounded"
                                  >
                                    OK
                                  </button>
                                  <button
                                    onClick={() => handleClearFilter(header)}
                                    className="text-sm bg-red-400 text-white px-3 py-2 rounded"
                                  >
                                    Clear
                                  </button>
                                  <button
                                    onClick={() => {
                                      setFilterVisible(null);
                                    }}
                                    className="text-sm bg-gray-400 text-white px-3 py-2 rounded"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : null}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map(row => (
                <tr key={row.id} className="hover:bg-[#3A3A3A] transition-colors">
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="border px-4 py-2">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserActivityReport;
