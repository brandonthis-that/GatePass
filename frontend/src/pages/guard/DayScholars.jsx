import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { ChevronLeft, Search, UserCheck, UserMinus, ShieldAlert } from 'lucide-react';

const DayScholars = () => {
    const [scholars, setScholars] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    const fetchScholars = async () => {
        try {
            setLoading(true);
            const res = await api.get('/api/day-scholars/');
            setScholars(res.data.results || res.data);
        } catch {
            setError("Failed to load scholars. Tap to retry.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchScholars();
    }, []);

    const handleToggleStatus = async (id, currentStatus) => {
        // Optimistic UI update
        setScholars(prev => prev.map(s => {
            if (s.id === id) {
                return { ...s, day_scholar_status: currentStatus === 'OFF_CAMPUS' ? 'ON_CAMPUS' : 'OFF_CAMPUS' };
            }
            return s;
        }));

        try {
            const endpoint = currentStatus === 'OFF_CAMPUS' ? 'sign-in' : 'sign-out';
            await api.post(`/api/day-scholars/${id}/${endpoint}/`);
        } catch (err) {
            console.error(err);
            // Revert on failure
            fetchScholars();
        }
    };

    const filteredScholars = scholars.filter(s => {
        const search = searchTerm.toLowerCase();
        return (
            (s.first_name && s.first_name.toLowerCase().includes(search)) ||
            (s.last_name && s.last_name.toLowerCase().includes(search)) ||
            (s.student_id && s.student_id.toLowerCase().includes(search))
        );
    }).sort((a, b) => {
        const search = searchTerm.toLowerCase();
        if (!search) return 0;
        
        const aIdMatch = a.student_id && a.student_id.toLowerCase().includes(search);
        const bIdMatch = b.student_id && b.student_id.toLowerCase().includes(search);
        
        if (aIdMatch && !bIdMatch) return -1;
        if (!aIdMatch && bIdMatch) return 1;
        return 0;
    });

    return (
        <div className="min-h-screen bg-[#f4f4f5] font-sans flex flex-col items-center p-4 sm:p-8 pb-24">

            <div className="w-full max-w-2xl mb-8 sticky top-4 z-10">
                <div className="flex space-x-4 mb-4">
                    <button
                        onClick={() => navigate('/guard')}
                        className="flex items-center justify-center w-14 h-14 bg-white border-4 border-gray-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:shadow-none transition-all"
                        aria-label="Back"
                    >
                        <ChevronLeft className="w-8 h-8 text-gray-900" />
                    </button>

                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-6 w-6 text-gray-900" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-12 pr-4 py-4 h-14 bg-white border-4 border-gray-900 leading-5 placeholder-gray-500 focus:outline-none focus:ring-0 focus:bg-yellow-50 text-xl font-bold uppercase tracking-wide shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-colors"
                            placeholder="NAME OR ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="w-full max-w-2xl">
                {error && (
                    <div onClick={fetchScholars} className="p-4 bg-red-100 border-4 border-red-600 text-red-800 shadow-[4px_4px_0_0_rgba(220,38,38,1)] font-bold uppercase tracking-wider mb-6 text-center cursor-pointer hover:bg-red-200 transition-colors">
                        {error} <span className="underline ml-2">RETRY</span>
                    </div>
                )}

                {loading && scholars.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="animate-spin h-16 w-16 border-4 border-gray-900 border-t-blue-600 rounded-full mb-6 shadow-[4px_4px_0_0_rgba(0,0,0,1)]"></div>
                        <p className="text-xl font-display font-black text-gray-900 uppercase">Loading Scholars...</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredScholars.length === 0 ? (
                            <div className="bg-white p-12 border-4 border-gray-900 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                                <ShieldAlert className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-xl font-display font-black text-gray-900 uppercase tracking-tight">No scholars found</p>
                            </div>
                        ) : (
                            filteredScholars.map(scholar => (
                                <div key={scholar.id} className="bg-white border-4 border-gray-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-display font-black text-gray-900 uppercase leading-none tracking-tight">
                                            {scholar.first_name} {scholar.last_name}
                                        </h3>
                                        <p className="text-base font-bold text-gray-500 uppercase tracking-widest mt-2">ID: {scholar.student_id}</p>
                                    </div>

                                    <div className="w-full sm:w-auto">
                                        {scholar.day_scholar_status === 'OFF_CAMPUS' ? (
                                            <button
                                                onClick={() => handleToggleStatus(scholar.id, scholar.day_scholar_status)}
                                                className="w-full sm:w-auto flex items-center justify-center px-6 py-4 border-2 border-green-600 bg-green-600 text-white font-black text-xl uppercase tracking-wider shadow-[4px_4px_0_0_rgba(22,101,52,1)] hover:bg-green-700 hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_rgba(22,101,52,1)] active:translate-y-[4px] active:shadow-none transition-all"
                                            >
                                                <UserCheck className="w-6 h-6 mr-3 border-2 border-white rounded-full p-1 bg-green-800" />
                                                SIGN IN
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleToggleStatus(scholar.id, scholar.day_scholar_status)}
                                                className="w-full sm:w-auto flex items-center justify-center px-6 py-4 border-2 border-red-600 bg-red-600 text-white font-black text-xl uppercase tracking-wider shadow-[4px_4px_0_0_rgba(220,38,38,1)] hover:bg-red-700 hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_rgba(220,38,38,1)] active:translate-y-[4px] active:shadow-none transition-all"
                                            >
                                                <UserMinus className="w-6 h-6 mr-3 border-2 border-white rounded-full p-1 bg-red-800" />
                                                SIGN OUT
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DayScholars;
