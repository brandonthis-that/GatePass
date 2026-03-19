import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { 
  Users, 
  BarChart3, 
  Shield, 
  Car, 
  Package, 
  UserCheck, 
  FileText, 
  LogOut 
} from 'lucide-react';
import api from '../../api/axios';

const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAssets: 0,
    totalVehicles: 0,
    totalLogs: 0,
    todayLogs: 0,
  });
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch recent logs
        const logsResponse = await api.get('/api/gate-logs/?limit=5');
        setRecentLogs(logsResponse.data.results || logsResponse.data);

        // Fetch basic counts (you might need to add these endpoints or use existing ones)
        try {
          const [usersRes, assetsRes, vehiclesRes] = await Promise.all([
            api.get('/api/users/'),
            api.get('/api/assets/'),
            api.get('/api/vehicles/'),
          ]);
          
          setStats(prev => ({
            ...prev,
            totalUsers: usersRes.data.length || 0,
            totalAssets: assetsRes.data.length || 0,
            totalVehicles: vehiclesRes.data.length || 0,
            totalLogs: logsResponse.data.length || 0,
          }));
        } catch (statsError) {
          console.warn('Some stats could not be loaded:', statsError);
        }
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const quickActions = [
    {
      title: 'User Management',
      description: 'Manage students, guards, and admins',
      icon: Users,
      link: '/admin/users',
      color: 'bg-blue-500'
    },
    {
      title: 'Reports & Analytics',
      description: 'View gate logs and generate reports',
      icon: BarChart3,
      link: '/admin/reports',
      color: 'bg-green-500'
    },
    {
      title: 'Guard Functions',
      description: 'Access guard operations',
      icon: Shield,
      link: '/guard',
      color: 'bg-purple-500'
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user.first_name} {user.last_name}</p>
            </div>
            <button
              onClick={logout}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Registered Assets</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAssets}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Car className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Registered Vehicles</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalVehicles}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <FileText className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Gate Logs Today</p>
                <p className="text-2xl font-bold text-gray-900">{stats.todayLogs}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.link}
              className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow"
            >
              <div className="flex items-center mb-4">
                <div className={`p-3 ${action.color} rounded-lg`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h3>
              <p className="text-gray-600">{action.description}</p>
            </Link>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Recent Gate Activity</h2>
          </div>
          <div className="p-6">
            {recentLogs.length > 0 ? (
              <div className="space-y-4">
                {recentLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between border-b pb-4 last:border-b-0">
                    <div className="flex items-center">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <FileText className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {log.log_type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                        </p>
                        <p className="text-xs text-gray-500">
                          {log.guard_name || 'System'} • {new Date(log.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No recent activity</p>
            )}
            <div className="mt-4 text-center">
              <Link
                to="/admin/reports"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View All Logs →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;