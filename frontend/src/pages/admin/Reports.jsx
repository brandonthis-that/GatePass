import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Printer,
  Calendar, 
  Filter, 
  BarChart3, 
  FileText, 
  TrendingUp,
  Users,
  Car,
  Package,
  UserCheck,
  Eye
} from 'lucide-react';
import api from '../../api/axios';

const AdminReports = () => {
  const [logs, setLogs] = useState([]);
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [guardFilter, setGuardFilter] = useState('all');
  const printRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [dateFilter, typeFilter, guardFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [logsResponse, reportsResponse] = await Promise.all([
        api.get('/api/gate-logs/'),
        api.get('/api/gate-logs/reports/')
      ]);
      
      setLogs(logsResponse.data.results || logsResponse.data);
      setReports(reportsResponse.data);
    } catch (error) {
      console.error('Error fetching reports data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterLogs = () => {
    // Client-side filtering or filtered API calls can be added here
  };

  const handlePrint = () => {
    window.print();
  };

  const getLogTypeIcon = (type) => {
    switch (type) {
      case 'VEHICLE_ENTRY':
      case 'VEHICLE_EXIT':
        return <Car className="w-4 h-4" />;
      case 'ASSET_VERIFY':
        return <Package className="w-4 h-4" />;
      case 'SCHOLAR_IN':
      case 'SCHOLAR_OUT':
        return <UserCheck className="w-4 h-4" />;
      case 'VISITOR_ENTRY':
        return <Users className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getLogTypeBadge = (type) => {
    const base = 'inline-flex items-center px-2 py-1 text-xs font-black uppercase tracking-wider border-2 shadow-[2px_2px_0px_0px_';
    switch (type) {
      case 'VEHICLE_ENTRY':
        return `${base}rgba(22,101,52,1)] bg-green-50 border-green-600 text-green-800`;
      case 'VEHICLE_EXIT':
        return `${base}rgba(220,38,38,1)] bg-red-50 border-red-600 text-red-800`;
      case 'ASSET_VERIFY':
        return `${base}rgba(37,99,235,1)] bg-blue-50 border-blue-600 text-blue-800`;
      case 'SCHOLAR_IN':
        return `${base}rgba(147,51,234,1)] bg-purple-50 border-purple-600 text-purple-800`;
      case 'SCHOLAR_OUT':
        return `${base}rgba(234,88,12,1)] bg-orange-50 border-orange-600 text-orange-800`;
      case 'VISITOR_ENTRY':
        return `${base}rgba(202,138,4,1)] bg-yellow-50 border-yellow-600 text-yellow-800`;
      default:
        return `${base}rgba(75,85,99,1)] bg-gray-100 border-gray-600 text-gray-800`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f4f5] flex items-center justify-center font-sans">
        <div className="bg-white border-4 border-gray-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 flex flex-col items-center">
          <div className="animate-spin h-16 w-16 border-4 border-gray-900 border-t-brand-primary rounded-full mx-auto mb-6"></div>
          <p className="text-xl font-display font-black text-gray-900 uppercase">Loading Reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f4f5] font-sans">
      {/* Header */}
      <div className="bg-white border-b-4 border-gray-900 shadow-[0_4px_0_0_rgba(0,0,0,1)] sticky top-0 z-10 no-print">
        <div className="px-6 py-4 max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center">
            <Link
              to="/admin"
              className="mr-4 p-2 border-2 border-gray-900 bg-white hover:bg-gray-100 shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:translate-y-[1px] hover:shadow-[1px_1px_0_0_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none transition-all"
            >
              <ArrowLeft className="w-6 h-6 text-gray-900" />
            </Link>
            <div>
              <h1 className="text-3xl font-display font-black text-gray-900 uppercase tracking-tight">Reports & Analytics</h1>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-1">Gate logs and security audit reports</p>
            </div>
          </div>
          <button
            onClick={handlePrint}
            className="flex items-center justify-center px-6 py-3 border-2 border-gray-900 bg-white text-gray-900 font-bold uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:shadow-none transition-all"
          >
            <Printer className="w-5 h-5 mr-2" />
            Print Report
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Summary Cards */}
        {reports && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <div className="bg-white p-6 border-4 border-gray-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center">
                <div className="p-3 border-2 border-blue-600 bg-blue-50 shadow-[2px_2px_0px_0px_rgba(37,99,235,1)]">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-5">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Total Events</p>
                  <p className="text-3xl font-display font-black text-gray-900 leading-none mt-1">{reports.total_events}</p>
                </div>
              </div>
            </div>

            {reports.breakdown && reports.breakdown.slice(0, 3).map((item, index) => (
              <div key={index} className="bg-white p-6 border-4 border-gray-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center">
                  <div className="p-3 border-2 border-green-600 bg-green-50 shadow-[2px_2px_0px_0px_rgba(22,101,52,1)]">
                    {getLogTypeIcon(item.log_type)}
                  </div>
                  <div className="ml-5">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                      {item.log_type.replace(/_/g, ' ')}
                    </p>
                    <p className="text-3xl font-display font-black text-gray-900 leading-none mt-1">{item.count}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Event Type Breakdown */}
        {reports && reports.breakdown && (
          <div className="bg-white border-4 border-gray-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-10 overflow-hidden">
            <div className="p-6 border-b-4 border-gray-900 bg-gray-50">
              <h2 className="text-xl font-display font-black text-gray-900 uppercase tracking-tight">Event Type Breakdown</h2>
            </div>
            <div className="p-6 space-y-5">
              {reports.breakdown.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center min-w-0 flex-1 mr-6">
                    <div className="p-2 border-2 border-gray-900 bg-white shadow-[2px_2px_0_0_rgba(0,0,0,1)] mr-4 shrink-0">
                      {getLogTypeIcon(item.log_type)}
                    </div>
                    <span className="text-sm font-black text-gray-900 uppercase tracking-wide truncate">
                      {item.log_type.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 shrink-0">
                    <span className="text-sm font-bold text-gray-600 w-20 text-right">{item.count} events</span>
                    <div className="w-32 bg-gray-200 h-3 border-2 border-gray-900">
                      <div
                        className="bg-gray-900 h-full"
                        style={{ width: `${(item.count / reports.total_events) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-black text-gray-900 w-10 text-right">
                      {Math.round((item.count / reports.total_events) * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white border-4 border-gray-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 mb-8">
          <div className="flex items-center mb-5">
            <Filter className="w-5 h-5 text-gray-900 mr-3" />
            <h3 className="text-base font-black text-gray-900 uppercase tracking-wider">Filter Logs</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-900 font-bold text-gray-900 focus:ring-0 focus:border-brand-primary bg-gray-50 shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Event Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-900 font-bold text-gray-900 focus:ring-0 focus:border-brand-primary bg-gray-50 shadow-[2px_2px_0_0_rgba(0,0,0,1)] uppercase"
              >
                <option value="all">All Types</option>
                <option value="VEHICLE_ENTRY">Vehicle Entry</option>
                <option value="VEHICLE_EXIT">Vehicle Exit</option>
                <option value="ASSET_VERIFY">Asset Verification</option>
                <option value="SCHOLAR_IN">Scholar Sign-in</option>
                <option value="SCHOLAR_OUT">Scholar Sign-out</option>
                <option value="VISITOR_ENTRY">Visitor Entry</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Guard</label>
              <select
                value={guardFilter}
                onChange={(e) => setGuardFilter(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-900 font-bold text-gray-900 focus:ring-0 focus:border-brand-primary bg-gray-50 shadow-[2px_2px_0_0_rgba(0,0,0,1)] uppercase"
              >
                <option value="all">All Guards</option>
              </select>
            </div>
          </div>
        </div>

        {/* Gate Logs Table */}
        <div className="bg-white border-4 border-gray-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          <div className="px-6 py-5 border-b-4 border-gray-900 bg-gray-50">
            <h2 className="text-xl font-display font-black text-gray-900 uppercase tracking-tight">Gate Activity Logs</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b-4 border-gray-900 bg-gray-900 text-white">
                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest">
                    Timestamp
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest">
                    Event Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest">
                    Guard
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest">
                    Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-gray-200">
                {logs.slice(0, 50).map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 font-mono">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={getLogTypeBadge(log.log_type)}>
                          <span className="mr-1">{getLogTypeIcon(log.log_type)}</span>
                          {log.log_type.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-gray-900 uppercase tracking-wide">
                      {log.guard_name || 'SYSTEM'}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-700 max-w-xs truncate uppercase">
                      {log.asset_type && `Asset: ${log.asset_type}`}
                      {log.plate_number && `Vehicle: ${log.plate_number}`}
                      {log.student_name && `Student: ${log.student_name}`}
                      {log.plate_number_raw && `Unregistered: ${log.plate_number_raw}`}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-500 max-w-xs truncate">
                      {log.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {logs.length === 0 && (
            <div className="p-12 text-center">
              <FileText className="mx-auto h-16 w-16 text-gray-300 mb-6" />
              <h3 className="text-xl font-display font-black text-gray-900 uppercase tracking-tight">No logs found</h3>
              <p className="mt-2 text-sm font-bold text-gray-500 uppercase tracking-widest">
                No gate activity has been recorded yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReports;