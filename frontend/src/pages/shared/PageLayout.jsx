import React, { useContext, useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { LogOut, User, KeyRound, ChevronDown } from 'lucide-react';

const PageLayout = ({ children, title }) => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Top Navigation */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <span className="text-xl font-bold text-blue-600">GatePass</span>
                        </div>

                        <div className="flex items-center space-x-2">
                            {/* User Dropdown */}
                            <div className="relative" ref={menuRef}>
                                <button
                                    onClick={() => setMenuOpen(prev => !prev)}
                                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <span className="hidden sm:inline">{user?.first_name} {user?.last_name}</span>
                                    <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {menuOpen && (
                                    <div className="absolute right-0 mt-1 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                                        <div className="px-4 py-2.5 border-b border-gray-100">
                                            <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Signed in as</p>
                                            <p className="text-sm font-semibold text-gray-800 truncate">{user?.first_name} {user?.last_name}</p>
                                            <p className="text-xs text-gray-500 truncate">{user?.username}</p>
                                        </div>
                                        <Link
                                            to="/change-password"
                                            onClick={() => setMenuOpen(false)}
                                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            <KeyRound className="w-4 h-4 text-gray-400" />
                                            Change Password
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8">
                {title && (
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">{title}</h1>
                )}
                {children}
            </main>
        </div>
    );
};

export default PageLayout;
