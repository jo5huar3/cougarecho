import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  ColumnDef,
  flexRender,
  ColumnFiltersState,
} from '@tanstack/react-table';
import { DateRangePicker } from 'react-date-range';
import axios from '../../api/axios';
import Sidebar from '../../components/sidebar/Sidebar';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
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
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [filterVisible, setFilterVisible] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ startDate: Date; endDate: Date }>({
    startDate: new Date(),
    endDate: new Date(),
  });
  const [searchValue, setSearchValue] = useState<{ [key: string]: string }>({});
  const [pendingFilters, setPendingFilters] = useState<{ [key: string]: any[] }>({});
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
        if (error.response && error.response.status === 401) {
          setErrMsg('Unauthorized: Please log in again.');
        } else {
          setErrMsg('Failed to fetch user activity report.');
        }
      }
    };

    fetchData();
  }, []);

  const columns = React.useMemo<ColumnDef<UserReportData>[]>(() => [
    {
      accessorKey: 'username',
      header: 'Username',
      cell: info => info.getValue(),
      filterFn: 'includesString',
      enableColumnFilter: true,
    },
    {
      accessorKey: 'account_created_at',
      header: 'Account Creation Day',
      cell: info => new Date(info.getValue()).toLocaleDateString("en-US"),
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

  const applyDateRangeFilter = () => {
    const { startDate, endDate } = dateRange;

    const filteredData = originalData.filter(row => {
      const accountCreationDate = new Date(row.account_created_at);
      return (
        accountCreationDate >= startDate &&
        accountCreationDate <= endDate
      );
    });

    setReportData(filteredData);
    setFilterVisible(null);
  };

  const applyCheckboxFilter = (headerId: string) => {
    const selectedValues = pendingFilters[headerId] || [];
    const filteredData = originalData.filter(row => selectedValues.includes(row[headerId as keyof UserReportData]));
    setReportData(filteredData);
    setFilterVisible(null);
  };

  const handleFilterButtonClick = (headerId: string) => {
    setFilterVisible(prev => (prev === headerId ? null : headerId));
  };

  const handleClearFilter = (headerId: string) => {
    setPendingFilters(prev => ({ ...prev, [headerId]: [] }));
    setReportData(originalData);
    setFilterVisible(null);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar /> {/* Sidebar on the left */}
      <div className="bg-[#121212] text-[#EBE7CD] p-8 flex-grow font-sans">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-semibold">User Activity Report</h1>
          <button
            onClick={() => navigate('/admin')}
            className="bg-[#4a8f4f] text-[#FAF5CE] px-4 py-2 rounded hover:bg-[#5aa55f] transition-colors"
          >
            Return to Admin Dashboard
          </button>
        </div>

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
                        {header.column.getCanFilter() && (
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
                                {header.id === 'account_created_at' ? (
                                  <div className="calendar-container bg-[#1f1f1f] p-2 rounded">
                                    <DateRangePicker
                                      ranges={[{
                                        startDate: dateRange.startDate,
                                        endDate: dateRange.endDate,
                                        key: 'selection'
                                      }]}
                                      onChange={(range) => setDateRange(range.selection)}
                                      showDateDisplay={false}
                                      className="custom-calendar"
                                      rangeColors={["#1ED760"]}
                                    />
                                    <div className="flex justify-between mt-2">
                                      <button
                                        onClick={applyDateRangeFilter}
                                        className="text-sm bg-blue-400 text-white px-3 py-2 rounded"
                                      >
                                        Apply
                                      </button>
                                      <button
                                        onClick={() => handleClearFilter(header.id)}
                                        className="text-sm bg-gray-400 text-white px-3 py-2 rounded"
                                      >
                                        Clear
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div>
                                    <div className="max-h-32 overflow-y-auto mb-2">
                                      {Array.from(new Set(originalData.map(row => row[header.id as keyof UserReportData])))
                                        .filter(value => value !== undefined)
                                        .map((value, index) => (
                                          <div key={index} className="flex items-center">
                                            <input
                                              type="checkbox"
                                              checked={(pendingFilters[header.id] || []).includes(value)}
                                              onChange={(e) => {
                                                const currentFilterValues = pendingFilters[header.id] || [];
                                                const updatedFilterValues = e.target.checked
                                                  ? [...currentFilterValues, value]
                                                  : currentFilterValues.filter(v => v !== value);
                                                setPendingFilters(prev => ({
                                                  ...prev,
                                                  [header.id]: updatedFilterValues,
                                                }));
                                              }}
                                              className="mr-2"
                                            />
                                            <label>{value}</label>
                                          </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-between mt-2">
                                      <button
                                        onClick={() => applyCheckboxFilter(header.id)}
                                        className="text-sm bg-blue-400 text-white px-3 py-2 rounded"
                                      >
                                        Apply
                                      </button>
                                      <button
                                        onClick={() => handleClearFilter(header.id)}
                                        className="text-sm bg-gray-400 text-white px-3 py-2 rounded"
                                      >
                                        Clear
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
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
