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
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans">

            {/* Header Info */}
            <div className="w-full max-w-sm mb-8 flex justify-between items-center bg-white p-4 border-4 border-gray-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center text-gray-900">
                    <div className="w-10 h-10 border-2 border-gray-900 bg-brand-primary flex flex-col items-center justify-center mr-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <UserIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <div className="text-sm font-black uppercase tracking-widest">{user?.first_name} {user?.last_name}</div>
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-0.5">ON DUTY • {user?.role}</div>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="p-3 border-2 border-red-600 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(220,38,38,1)] active:translate-y-[2px] active:shadow-none"
                >
                    <LogOut className="w-5 h-5" />
                </button>
            </div>

            {/* Alerts */}
            <div className="w-full max-w-sm mb-4">
                <AlertsWidget />
            </div>

            {/* Main Touch Actions */}
            <div className="w-full max-w-sm space-y-6">

                <Link
                    to="/guard/asset/verify"
                    className="w-full flex items-center justify-between bg-white p-6 border-4 border-gray-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:shadow-none transition-all group"
                >
                    <div>
                        <h2 className="text-2xl font-display font-black text-blue-600 uppercase tracking-tight mb-1 group-hover:text-gray-900 transition-colors">Verify Asset</h2>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest group-hover:text-gray-700">Scan student QR codes</p>
                    </div>
                    <div className="w-16 h-16 border-2 border-blue-600 bg-blue-50 flex items-center justify-center group-hover:border-gray-900 group-hover:bg-gray-100 transition-colors shadow-[2px_2px_0px_0px_rgba(37,99,235,1)] group-hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <ScanLine className="w-8 h-8 text-blue-600 group-hover:text-gray-900" />
                    </div>
                </Link>

                <Link
                    to="/guard/vehicle"
                    className="w-full flex items-center justify-between bg-white p-6 border-4 border-gray-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:shadow-none transition-all group"
                >
                    <div>
                        <h2 className="text-2xl font-display font-black text-green-600 uppercase tracking-tight mb-1 group-hover:text-gray-900 transition-colors">Log Vehicle</h2>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest group-hover:text-gray-700">Lookup plates & entries</p>
                    </div>
                    <div className="w-16 h-16 border-2 border-green-600 bg-green-50 flex items-center justify-center group-hover:border-gray-900 group-hover:bg-gray-100 transition-colors shadow-[2px_2px_0px_0px_rgba(22,101,52,1)] group-hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <Car className="w-8 h-8 text-green-600 group-hover:text-gray-900" />
                    </div>
                </Link>

                <Link
                    to="/guard/scholars"
                    className="w-full flex items-center justify-between bg-white p-6 border-4 border-gray-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:shadow-none transition-all group"
                >
                    <div>
                        <h2 className="text-2xl font-display font-black text-amber-600 uppercase tracking-tight mb-1 group-hover:text-gray-900 transition-colors">Day Scholars</h2>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest group-hover:text-gray-700">Sign in / out students</p>
                    </div>
                    <div className="w-16 h-16 border-2 border-amber-600 bg-amber-50 flex items-center justify-center group-hover:border-gray-900 group-hover:bg-gray-100 transition-colors shadow-[2px_2px_0px_0px_rgba(217,119,6,1)] group-hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <Users className="w-8 h-8 text-amber-600 group-hover:text-gray-900" />
                    </div>
                </Link>

                <Link
                    to="/guard/visitor/new"
                    className="w-full flex items-center justify-between bg-white p-6 border-4 border-gray-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:shadow-none transition-all group"
                >
                    <div>
                        <h2 className="text-2xl font-display font-black text-purple-600 uppercase tracking-tight mb-1 group-hover:text-gray-900 transition-colors">New Visitor</h2>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest group-hover:text-gray-700">Register visitor entry</p>
                    </div>
                    <div className="w-16 h-16 border-2 border-purple-600 bg-purple-50 flex items-center justify-center group-hover:border-gray-900 group-hover:bg-gray-100 transition-colors shadow-[2px_2px_0px_0px_rgba(147,51,234,1)] group-hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <UserPlus className="w-8 h-8 text-purple-600 group-hover:text-gray-900" />
                    </div>
                </Link>

                <Link
                    to="/guard/visitors"
                    className="w-full flex items-center justify-between bg-white p-6 border-4 border-gray-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:shadow-none transition-all group"
                >
                    <div>
                        <h2 className="text-2xl font-display font-black text-indigo-600 uppercase tracking-tight mb-1 group-hover:text-gray-900 transition-colors">Visitor Access</h2>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest group-hover:text-gray-700">Approve & track visitors</p>
                    </div>
                    <div className="w-16 h-16 border-2 border-indigo-600 bg-indigo-50 flex items-center justify-center group-hover:border-gray-900 group-hover:bg-gray-100 transition-colors shadow-[2px_2px_0px_0px_rgba(79,70,229,1)] group-hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <Shield className="w-8 h-8 text-indigo-600 group-hover:text-gray-900" />
                    </div>
                </Link>

            </div>

        </div>
    );
};

export default GuardDashboard;
