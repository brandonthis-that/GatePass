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
            setScholars(res.data);
        } catch (err) {
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

    const filteredScholars = scholars.filter(s =>
        s.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.student_id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 pb-24">

            <div className="w-full max-w-lg mb-6 sticky top-4 z-10">
                <div className="flex space-x-2 mb-4">
                    <button
                        onClick={() => navigate('/guard')}
                        className="flex items-center justify-center w-14 h-14 text-gray-600 bg-white shadow-md border border-gray-200 rounded-2xl hover:bg-gray-100 transition-colors"
                        aria-label="Back"
                    >
                        <ChevronLeft className="w-8 h-8" />
                    </button>

                    <div className="relative flex-1 opacity-100">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-6 w-6 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-12 pr-4 py-4 h-14 bg-white border border-gray-200 rounded-2xl leading-5 bg-transparent placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg shadow-md"
                            placeholder="Search by name or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="w-full max-w-lg">
                {error && (
                    <div onClick={fetchScholars} className="p-4 rounded-xl bg-red-100 text-red-800 shadow-sm font-medium mb-4 text-center cursor-pointer">
                        {error} <span className="underline">Retry</span>
                    </div>
                )}

                {loading && scholars.length === 0 ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-800"></div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredScholars.length === 0 ? (
                            <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center shadow-sm">
                                <ShieldAlert className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 text-lg">No scholars found matching your search.</p>
                            </div>
                        ) : (
                            filteredScholars.map(scholar => (
                                <div key={scholar.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center justify-between">
                                    <div className="flex-1 pr-4">
                                        <h3 className="text-lg font-bold text-gray-900 leading-tight">
                                            {scholar.first_name} {scholar.last_name}
                                        </h3>
                                        <p className="text-sm font-mono text-gray-500 mt-1">{scholar.student_id}</p>
                                    </div>

                                    <div>
                                        {scholar.day_scholar_status === 'OFF_CAMPUS' ? (
                                            <button
                                                onClick={() => handleToggleStatus(scholar.id, scholar.day_scholar_status)}
                                                className="flex items-center justify-center p-4 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-xl font-bold min-w-[110px] active:scale-95 transition-transform"
                                            >
                                                <UserCheck className="w-5 h-5 mr-2" />
                                                Sign IN
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleToggleStatus(scholar.id, scholar.day_scholar_status)}
                                                className="flex items-center justify-center p-4 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl font-bold min-w-[110px] active:scale-95 transition-transform"
                                            >
                                                <UserMinus className="w-5 h-5 mr-2" />
                                                Sign OUT
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
