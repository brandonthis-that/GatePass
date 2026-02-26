import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { ChevronLeft, Search, Car, AlertTriangle, LogIn, LogOut } from 'lucide-react';

const VehicleLogger = () => {
    const [plate, setPlate] = useState('');
    const [vehicleData, setVehicleData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');

    const navigate = useNavigate();

    const handleLookup = async (e) => {
        e.preventDefault();
        if (!plate.trim()) return;

        setLoading(true);
        setError(null);
        setVehicleData(null);
        setSuccessMsg('');

        try {
            const res = await api.get(`/api/vehicles/lookup/?plate=${encodeURIComponent(plate.trim())}`);
            setVehicleData(res.data.vehicle);
        } catch (err) {
            if (err.response?.status === 404) {
                // Not registered
                setVehicleData({ notFound: true, plate_number: plate.trim().toUpperCase() });
            } else {
                setError("Error looking up vehicle. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogEvent = async (type) => {
        setLoading(true);
        setError(null);
        try {
            const payload = {
                log_type: type, // "VEHICLE_ENTRY" or "VEHICLE_EXIT"
            };

            if (vehicleData.notFound) {
                payload.plate_number_raw = vehicleData.plate_number;
                payload.notes = "Unregistered vehicle";
            } else {
                payload.vehicle = vehicleData.id;
                payload.notes = "Registered student vehicle";
            }

            await api.post('/api/gate-logs/', payload);
            setSuccessMsg(`Vehicle ${type.includes('ENTRY') ? 'Entry' : 'Exit'} logged successfully.`);

            // Auto-clear after 2 seconds ready for next car
            setTimeout(() => {
                setPlate('');
                setVehicleData(null);
                setSuccessMsg('');
            }, 2000);

        } catch (err) {
            setError("Failed to create gate log.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 sm:p-6 pb-24">

            <div className="w-full max-w-md flex items-center mb-6">
                <button
                    onClick={() => navigate('/guard')}
                    className="flex flex-1 items-center text-gray-600 hover:text-gray-900 bg-white shadow-sm border border-gray-200 py-3 px-4 rounded-xl font-medium transition-colors"
                >
                    <ChevronLeft className="w-5 h-5 mr-2" />
                    Back to Terminal
                </button>
            </div>

            <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <Car className="w-6 h-6 mr-2 text-zinc-600" />
                    Vehicle Lookup
                </h2>

                <form onSubmit={handleLookup} className="flex space-x-2">
                    <input
                        type="text"
                        required
                        placeholder="Enter Plate (e.g. KCA 123A)"
                        value={plate}
                        onChange={(e) => setPlate(e.target.value)}
                        className="flex-1 px-4 py-4 text-lg border-2 border-gray-300 rounded-xl focus:ring-0 focus:border-zinc-800 transition-colors uppercase font-mono shadow-inner bg-gray-50"
                    />
                    <button
                        type="submit"
                        disabled={loading || !plate.trim()}
                        className="px-6 bg-zinc-800 hover:bg-zinc-900 text-white rounded-xl shadow-md transition-colors disabled:opacity-50"
                    >
                        {loading && !vehicleData ? (
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        ) : (
                            <Search className="w-6 h-6" />
                        )}
                    </button>
                </form>
            </div>

            {/* Error & Success Messages */}
            <div className="w-full max-w-md space-y-4">
                {error && (
                    <div className="p-4 rounded-xl bg-red-100 border border-red-200 text-red-800 shadow-sm font-medium">
                        {error}
                    </div>
                )}

                {successMsg && (
                    <div className="p-4 rounded-xl bg-green-100 border border-green-200 text-green-800 shadow-sm font-medium flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        {successMsg}
                    </div>
                )}
            </div>

            {/* Lookup Result Panel */}
            {vehicleData && !successMsg && (
                <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mt-2 animate-in slide-in-from-bottom-4 duration-300">

                    {vehicleData.notFound ? (
                        <div className="bg-amber-50 border-b border-amber-100 p-6 text-center">
                            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-2" />
                            <h3 className="text-xl font-bold text-amber-900">Unregistered Vehicle</h3>
                            <p className="text-amber-700 font-mono text-lg mt-1">{vehicleData.plate_number}</p>
                        </div>
                    ) : (
                        <div className="bg-green-50 border-b border-green-100 p-6 text-center">
                            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
                            <h3 className="text-xl font-bold text-green-900">Registered Student</h3>
                            <div className="font-mono text-2xl font-bold text-green-800 tracking-wider mt-2 border-2 border-green-200 inline-block px-4 py-1 rounded bg-white shadow-sm">
                                {vehicleData.plate_number}
                            </div>

                            <div className="mt-4 bg-white/60 rounded-xl p-4 text-left shadow-sm">
                                <div className="text-sm text-green-800/70 uppercase tracking-widest font-semibold mb-1">Owner</div>
                                <div className="text-lg font-bold text-green-900">{vehicleData.owner_name}</div>
                                <div className="text-sm text-green-800">{vehicleData.color} {vehicleData.make} {vehicleData.model}</div>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="p-6 grid grid-cols-2 gap-4 bg-gray-50">
                        <button
                            onClick={() => handleLogEvent('VEHICLE_ENTRY')}
                            disabled={loading}
                            className="flex flex-col items-center justify-center py-6 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-md transition-all active:scale-95 disabled:opacity-50 border border-blue-500"
                        >
                            <LogIn className="w-8 h-8 mb-2" />
                            <span className="font-bold text-lg">Log IN</span>
                        </button>
                        <button
                            onClick={() => handleLogEvent('VEHICLE_EXIT')}
                            disabled={loading}
                            className="flex flex-col items-center justify-center py-6 bg-zinc-800 hover:bg-zinc-900 text-white rounded-2xl shadow-md transition-all active:scale-95 disabled:opacity-50 border border-zinc-700"
                        >
                            <LogOut className="w-8 h-8 mb-2 text-red-400" />
                            <span className="font-bold text-lg">Log OUT</span>
                        </button>
                    </div>

                </div>
            )}

        </div>
    );
};

// Simple inline CheckCircle since lucide-react CheckCircle is already imported but not destructured properly above. Let's fix that block above. 
// Ah, lucide CheckCircle wasn't in the import list at the top. Let's create a small fallback to make sure it renders safely.
const CheckCircle = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


export default VehicleLogger;
