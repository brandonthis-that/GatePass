import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ScanLine, Car, Users, LogOut, User as UserIcon, UserPlus, Shield } from 'lucide-react';
import AlertsWidget from '../shared/AlertsWidget';

const GuardDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">

            {/* Header Info */}
            <div className="w-full max-w-sm mb-8 flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex items-center text-gray-800">
                    <UserIcon className="w-5 h-5 mr-3 text-blue-600" />
                    <div>
                        <div className="text-sm font-bold text-gray-900">{user?.first_name} {user?.last_name}</div>
                        <div className="text-xs text-gray-500">On Duty • {user?.role?.toUpperCase()}</div>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="p-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-colors"
                >
                    <LogOut className="w-6 h-6" />
                </button>
            </div>

            {/* Alerts */}
            <div className="w-full max-w-sm">
                <AlertsWidget />
            </div>

            {/* Main Touch Actions */}
            <div className="w-full max-w-sm space-y-4">

                <Link
                    to="/guard/asset/verify"
                    className="w-full flex items-center justify-between bg-white hover:bg-gray-50 text-gray-900 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all active:scale-95 border border-gray-200"
                >
                    <div>
                        <h2 className="text-2xl font-bold mb-1 text-blue-600">Verify Asset</h2>
                        <p className="text-gray-500 text-sm">Scan student QR codes</p>
                    </div>
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
                        <ScanLine className="w-8 h-8 text-blue-600" />
                    </div>
                </Link>

                <Link
                    to="/guard/vehicle"
                    className="w-full flex items-center justify-between bg-white hover:bg-gray-50 text-gray-900 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all active:scale-95 border border-gray-200"
                >
                    <div>
                        <h2 className="text-2xl font-bold mb-1 text-green-600">Log Vehicle</h2>
                        <p className="text-gray-500 text-sm">Lookup plates & record entries</p>
                    </div>
                    <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center">
                        <Car className="w-8 h-8 text-green-600" />
                    </div>
                </Link>

                <Link
                    to="/guard/scholars"
                    className="w-full flex items-center justify-between bg-white hover:bg-gray-50 text-gray-900 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all active:scale-95 border border-gray-200"
                >
                    <div>
                        <h2 className="text-2xl font-bold mb-1 text-amber-600">Day Scholars</h2>
                        <p className="text-gray-500 text-sm">Sign in / Sign out students</p>
                    </div>
                    <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center">
                        <Users className="w-8 h-8 text-amber-600" />
                    </div>
                </Link>

                <Link
                    to="/guard/visitor/new"
                    className="w-full flex items-center justify-between bg-white hover:bg-gray-50 text-gray-900 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all active:scale-95 border border-gray-200"
                >
                    <div>
                        <h2 className="text-2xl font-bold mb-1 text-purple-600">New Visitor</h2>
                        <p className="text-gray-500 text-sm">Register visitor entry</p>
                    </div>
                    <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center">
                        <UserPlus className="w-8 h-8 text-purple-600" />
                    </div>
                </Link>

                <Link
                    to="/guard/visitors"
                    className="w-full flex items-center justify-between bg-white hover:bg-gray-50 text-gray-900 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all active:scale-95 border border-gray-200"
                >
                    <div>
                        <h2 className="text-2xl font-bold mb-1 text-indigo-600">Visitor Management</h2>
                        <p className="text-gray-500 text-sm">Approve & track visitors</p>
                    </div>
                    <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center">
                        <Shield className="w-8 h-8 text-indigo-600" />
                    </div>
                </Link>

            </div>

        </div>
    );
};

export default GuardDashboard;
