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
import AlertsWidget from '../shared/AlertsWidget';

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
            totalUsers: Array.isArray(usersRes.data) ? usersRes.data.length : (usersRes.data.count ?? 0),
            totalAssets: assetsRes.data.count ?? 0,
            totalVehicles: vehiclesRes.data.count ?? 0,
            totalLogs: logsResponse.data.count ?? 0,
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
      borderColor: 'border-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      shadowColor: 'rgba(37,99,235,1)'
    },
    {
      title: 'Reports & Analytics',
      description: 'View gate logs and generate reports',
      icon: BarChart3,
      link: '/admin/reports',
      borderColor: 'border-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      shadowColor: 'rgba(22,101,52,1)'
    },
    {
      title: 'Guard Functions',
      description: 'Access guard operations',
      icon: Shield,
      link: '/guard',
      borderColor: 'border-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      shadowColor: 'rgba(147,51,234,1)'
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f4f5] flex items-center justify-center font-sans">
        <div className="bg-white border-4 border-gray-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 flex flex-col items-center">
          <div className="animate-spin h-16 w-16 border-4 border-gray-900 border-t-brand-primary rounded-full mx-auto mb-6"></div>
          <p className="text-xl font-display font-black text-gray-900 uppercase">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f4f5] font-sans">
      {/* Header */}
      <div className="bg-white border-b-4 border-gray-900 shadow-[0_4px_0_0_rgba(0,0,0,1)] sticky top-0 z-10">
        <div className="px-6 py-4 max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-black text-gray-900 uppercase tracking-tight">Admin Dashboard</h1>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-1">Welcome back, {user.first_name} {user.last_name}</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center justify-center px-6 py-3 border-2 border-red-600 bg-red-600 text-white font-bold uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(153,27,27,1)] hover:bg-red-700 hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(153,27,27,1)] active:translate-y-[4px] active:shadow-none transition-all"
          >
            <LogOut className="w-5 h-5 mr-2" />
            LOGOUT
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Alerts */}
        <div className="mb-8">
          <AlertsWidget />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          
          <div className="bg-white p-6 border-4 border-gray-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center">
              <div className="p-3 border-2 border-blue-600 bg-blue-50 shadow-[2px_2px_0px_0px_rgba(37,99,235,1)]">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-5">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Total Users</p>
                <p className="text-3xl font-display font-black text-gray-900 leading-none mt-1">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 border-4 border-gray-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center">
              <div className="p-3 border-2 border-green-600 bg-green-50 shadow-[2px_2px_0px_0px_rgba(22,101,52,1)]">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-5">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Assets</p>
                <p className="text-3xl font-display font-black text-gray-900 leading-none mt-1">{stats.totalAssets}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 border-4 border-gray-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center">
              <div className="p-3 border-2 border-purple-600 bg-purple-50 shadow-[2px_2px_0px_0px_rgba(147,51,234,1)]">
                <Car className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-5">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Vehicles</p>
                <p className="text-3xl font-display font-black text-gray-900 leading-none mt-1">{stats.totalVehicles}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 border-4 border-gray-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center">
              <div className="p-3 border-2 border-yellow-600 bg-yellow-50 shadow-[2px_2px_0px_0px_rgba(202,138,4,1)]">
                <FileText className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-5">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Logs Today</p>
                <p className="text-3xl font-display font-black text-gray-900 leading-none mt-1">{stats.todayLogs}</p>
              </div>
            </div>
          </div>

        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.link}
              className="bg-white p-6 border-4 border-gray-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:shadow-none transition-all group"
            >
              <div className="flex items-center mb-5">
                <div className={`p-3 border-2 ${action.borderColor} ${action.bgColor} group-hover:border-gray-900 group-hover:bg-gray-100 transition-colors shadow-[2px_2px_0px_0px_${action.shadowColor}] group-hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}>
                  <action.icon className={`w-6 h-6 ${action.iconColor} group-hover:text-gray-900 transition-colors`} />
                </div>
              </div>
              <h3 className="text-xl font-display font-black text-gray-900 uppercase tracking-tight mb-2">{action.title}</h3>
              <p className="text-sm font-bold text-gray-600 uppercase tracking-widest">{action.description}</p>
            </Link>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="bg-white border-4 border-gray-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          <div className="p-6 border-b-4 border-gray-900 bg-gray-50">
            <h2 className="text-xl font-display font-black text-gray-900 uppercase tracking-tight">Recent Gate Activity</h2>
          </div>
          <div className="p-0">
            {recentLogs.length > 0 ? (
              <div className="divide-y-2 divide-gray-200">
                {recentLogs.map((log) => (
                  <div key={log.id} className="p-6 hover:bg-gray-50 transition-colors flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="p-3 border-2 border-gray-900 bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <FileText className="w-5 h-5 text-gray-900" />
                      </div>
                      <div className="ml-5">
                        <p className="text-base font-black text-gray-900 uppercase tracking-wider">
                          {log.log_type.replace('_', ' ')}
                        </p>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">
                          {log.guard_name || 'SYSTEM'} • {new Date(log.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-base font-bold text-gray-500 uppercase tracking-widest">No recent activity</p>
              </div>
            )}
            <div className="p-6 border-t-2 border-gray-200 bg-white text-center">
              <Link
                to="/admin/reports"
                className="inline-flex items-center justify-center font-bold text-brand-primary uppercase tracking-widest hover:text-red-700 transition-colors"
              >
                VIEW FULL LOGS
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;;