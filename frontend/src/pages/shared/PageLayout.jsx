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
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* Top Navigation */}
            <header className="bg-white border-b-4 border-gray-900 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center">
                            <span className="text-2xl font-display font-black text-gray-900 uppercase tracking-tighter">GatePass</span>
                        </div>

                        <div className="flex items-center space-x-2 font-display">
                            {/* User Dropdown */}
                            <div className="relative" ref={menuRef}>
                                <button
                                    onClick={() => setMenuOpen(prev => !prev)}
                                    className="flex items-center gap-3 px-3 py-2 text-sm font-bold text-gray-900 hover:bg-gray-100 transition-colors"
                                >
                                    <div className="w-10 h-10 flex items-center justify-center bg-brand-primary text-white border-2 border-gray-900">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <span className="hidden sm:inline uppercase tracking-widest">{user?.first_name} {user?.last_name}</span>
                                    <ChevronDown className={`w-4 h-4 text-gray-900 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {menuOpen && (
                                    <div className="absolute right-0 mt-2 w-64 bg-white border-2 border-gray-900 shadow-none z-50">
                                        <div className="px-5 py-4 border-b-2 border-gray-900 bg-gray-50">
                                            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Signed in as</p>
                                            <p className="text-sm font-black text-gray-900 truncate uppercase">{user?.first_name} {user?.last_name}</p>
                                            <p className="text-xs text-brand-primary font-bold truncate">{user?.username}</p>
                                        </div>
                                        <Link
                                            to="/change-password"
                                            onClick={() => setMenuOpen(false)}
                                            className="flex items-center gap-3 px-5 py-4 text-sm font-bold text-gray-900 hover:bg-gray-100 transition-colors border-b border-gray-200"
                                        >
                                            <KeyRound className="w-5 h-5" />
                                            CHANGE PASSWORD
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-5 py-4 text-sm font-bold text-white bg-brand-primary hover:bg-brand-hover transition-colors text-left"
                                        >
                                            <LogOut className="w-5 h-5" />
                                            SIGN OUT
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
                    <h1 className="text-4xl font-display font-black text-gray-900 mb-8 uppercase tracking-tighter">{title}</h1>
                )}
                {children}
            </main>
        </div>
    );
};

export default PageLayout;
