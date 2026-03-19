import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ScanLine, Car, Users, LogOut, User as UserIcon, UserPlus, Shield } from 'lucide-react';

const GuardDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">

            {/* Header Info */}
            <div className="w-full max-w-sm mb-8 flex justify-between items-center bg-gray-800 p-4 rounded-2xl shadow-lg border border-gray-700">
                <div className="flex items-center text-gray-200">
                    <UserIcon className="w-5 h-5 mr-3 text-blue-400" />
                    <div>
                        <div className="text-sm font-semibold">{user?.first_name} {user?.last_name}</div>
                        <div className="text-xs text-gray-400">On Duty • {user?.role.toUpperCase()}</div>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl transition-colors"
                >
                    <LogOut className="w-6 h-6" />
                </button>
            </div>

            {/* Main Touch Actions */}
            <div className="w-full max-w-sm space-y-4">

                <Link
                    to="/guard/asset/verify"
                    className="w-full flex items-center justify-between bg-blue-600 hover:bg-blue-500 text-white p-6 rounded-3xl shadow-lg shadow-blue-900/50 transition-all active:scale-95 border border-blue-400/30"
                >
                    <div>
                        <h2 className="text-2xl font-bold mb-1">Verify Asset</h2>
                        <p className="text-blue-200 text-sm">Scan student QR codes</p>
                    </div>
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                        <ScanLine className="w-8 h-8" />
                    </div>
                </Link>

                <Link
                    to="/guard/vehicle"
                    className="w-full flex items-center justify-between bg-zinc-800 hover:bg-zinc-700 text-white p-6 rounded-3xl shadow-lg transition-all active:scale-95 border border-zinc-700"
                >
                    <div>
                        <h2 className="text-2xl font-bold mb-1">Log Vehicle</h2>
                        <p className="text-zinc-400 text-sm">Lookup plates & record entries</p>
                    </div>
                    <div className="w-16 h-16 bg-zinc-700/50 rounded-2xl flex items-center justify-center">
                        <Car className="w-8 h-8 text-green-400" />
                    </div>
                </Link>

                <Link
                    to="/guard/scholars"
                    className="w-full flex items-center justify-between bg-zinc-800 hover:bg-zinc-700 text-white p-6 rounded-3xl shadow-lg transition-all active:scale-95 border border-zinc-700"
                >
                    <div>
                        <h2 className="text-2xl font-bold mb-1">Day Scholars</h2>
                        <p className="text-zinc-400 text-sm">Sign in / Sign out students</p>
                    </div>
                    <div className="w-16 h-16 bg-zinc-700/50 rounded-2xl flex items-center justify-center">
                        <Users className="w-8 h-8 text-amber-400" />
                    </div>
                </Link>

                <Link
                    to="/guard/visitor/new"
                    className="w-full flex items-center justify-between bg-purple-600 hover:bg-purple-500 text-white p-6 rounded-3xl shadow-lg shadow-purple-900/50 transition-all active:scale-95 border border-purple-400/30"
                >
                    <div>
                        <h2 className="text-2xl font-bold mb-1">New Visitor</h2>
                        <p className="text-purple-200 text-sm">Register visitor entry</p>
                    </div>
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                        <UserPlus className="w-8 h-8" />
                    </div>
                </Link>

                <Link
                    to="/guard/visitors"
                    className="w-full flex items-center justify-between bg-indigo-600 hover:bg-indigo-500 text-white p-6 rounded-3xl shadow-lg shadow-indigo-900/50 transition-all active:scale-95 border border-indigo-400/30"
                >
                    <div>
                        <h2 className="text-2xl font-bold mb-1">Visitor Management</h2>
                        <p className="text-indigo-200 text-sm">Approve & track visitors</p>
                    </div>
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                        <Shield className="w-8 h-8" />
                    </div>
                </Link>

            </div>

        </div>
    );
};

export default GuardDashboard;
