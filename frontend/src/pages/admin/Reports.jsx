import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download, 
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
    // This would be implemented client-side filtering or by making filtered API calls
    // For now, we'll show all logs but this could be enhanced
  };

  const exportToCSV = () => {
    const headers = ['Timestamp', 'Type', 'Guard', 'Details', 'Notes'];
    const csvContent = [
      headers.join(','),
      ...logs.map(log => [
        new Date(log.timestamp).toISOString(),
        log.log_type,
        log.guard_name || 'System',
        log.notes || '',
        ''
      ].map(field => `"${field}"`).join(','))
    ].join('\\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gate-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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

  const getLogTypeColor = (type) => {
    switch (type) {
      case 'VEHICLE_ENTRY':
        return 'bg-green-100 text-green-800';
      case 'VEHICLE_EXIT':
        return 'bg-red-100 text-red-800';
      case 'ASSET_VERIFY':
        return 'bg-blue-100 text-blue-800';
      case 'SCHOLAR_IN':
        return 'bg-purple-100 text-purple-800';
      case 'SCHOLAR_OUT':
        return 'bg-orange-100 text-orange-800';
      case 'VISITOR_ENTRY':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link 
                to="/admin" 
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
                <p className="text-gray-600">Gate logs and security audit reports</p>
              </div>
            </div>
            <button 
              onClick={exportToCSV}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Summary Cards */}
        {reports && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Events</p>
                  <p className="text-2xl font-bold text-gray-900">{reports.total_events}</p>
                </div>
              </div>
            </div>

            {reports.breakdown && reports.breakdown.slice(0, 3).map((item, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    {getLogTypeIcon(item.log_type)}
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      {item.log_type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">{item.count}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Event Type Breakdown */}
        {reports && reports.breakdown && (
          <div className="bg-white p-6 rounded-xl shadow-sm border mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Event Type Breakdown</h2>
            <div className="space-y-3">
              {reports.breakdown.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 bg-gray-100 rounded-lg mr-3">
                      {getLogTypeIcon(item.log_type)}
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {item.log_type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600">{item.count} events</span>
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{
                          width: `${(item.count / reports.total_events) * 100}%`
                        }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500 w-12">
                      {Math.round((item.count / reports.total_events) * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm border mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Guard</label>
              <select
                value={guardFilter}
                onChange={(e) => setGuardFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Guards</option>
                {/* This would be populated with actual guard names */}
              </select>
            </div>
          </div>
        </div>

        {/* Gate Logs Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Gate Activity Logs</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Guard
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.slice(0, 50).map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="mr-2">
                          {getLogTypeIcon(log.log_type)}
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLogTypeColor(log.log_type)}`}>
                          {log.log_type.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.guard_name || 'System'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {log.asset_type && `Asset: ${log.asset_type}`}
                      {log.plate_number && `Vehicle: ${log.plate_number}`}
                      {log.student_name && `Student: ${log.student_name}`}
                      {log.plate_number_raw && `Unregistered: ${log.plate_number_raw}`}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {log.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {logs.length === 0 && (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No logs found</h3>
              <p className="mt-1 text-sm text-gray-500">
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