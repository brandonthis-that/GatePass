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
    const [driverName, setDriverName] = useState('');
    const [declaredItems, setDeclaredItems] = useState('');

    const navigate = useNavigate();

    const handleLookup = async (e) => {
        e.preventDefault();
        if (!plate.trim()) return;

        setLoading(true);
        setError(null);
        setVehicleData(null);
        setSuccessMsg('');
        setDriverName('');
        setDeclaredItems('');

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
        if (vehicleData.notFound && !driverName.trim()) {
            setError("Driver name is required for unregistered vehicles.");
            setLoading(false);
            return;
        }

        try {
            const payload = {
                log_type: type,
                driver_name: driverName.trim() || (vehicleData.notFound ? '' : vehicleData.owner_name),
                declared_items: declaredItems.trim(),
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
                setDriverName('');
                setDeclaredItems('');
            }, 2000);

        } catch {
            setError("Failed to create gate log.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f4f4f5] font-sans flex flex-col items-center p-4 sm:p-8 pb-24">

            {/* Back button */}
            <div className="w-full max-w-md flex items-center mb-8">
                <button
                    onClick={() => navigate('/guard')}
                    className="flex items-center text-gray-900 bg-white border-4 border-gray-900 py-3 px-5 font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:shadow-none transition-all"
                >
                    <ChevronLeft className="w-6 h-6 mr-2" />
                    Back to Terminal
                </button>
            </div>

            {/* Lookup Panel */}
            <div className="w-full max-w-md bg-white border-4 border-gray-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 mb-6">
                <h2 className="text-2xl font-display font-black text-gray-900 uppercase tracking-tight mb-6 flex items-center">
                    <Car className="w-7 h-7 mr-3 text-gray-900" />
                    Vehicle Lookup
                </h2>

                <form onSubmit={handleLookup} className="flex space-x-3">
                    <input
                        type="text"
                        required
                        maxLength={10}
                        placeholder="PLATE NO."
                        value={plate}
                        onChange={(e) => setPlate(e.target.value)}
                        className="flex-1 px-4 py-4 text-xl border-4 border-gray-900 focus:ring-0 focus:border-brand-primary transition-colors uppercase font-black tracking-widest bg-gray-50 shadow-[2px_2px_0_0_rgba(0,0,0,1)] placeholder-gray-400"
                    />
                    <button
                        type="submit"
                        disabled={loading || !plate.trim()}
                        className="px-6 border-2 border-gray-900 bg-gray-900 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-black hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading && !vehicleData ? (
                            <div className="animate-spin h-6 w-6 border-4 border-white border-t-transparent rounded-full"></div>
                        ) : (
                            <Search className="w-6 h-6" />
                        )}
                    </button>
                </form>
            </div>

            {/* Error & Success Messages */}
            <div className="w-full max-w-md space-y-4">
                {error && (
                    <div className="p-4 bg-red-100 border-4 border-red-600 text-red-800 shadow-[4px_4px_0_0_rgba(220,38,38,1)] font-bold uppercase tracking-wider">
                        {error}
                    </div>
                )}

                {successMsg && (
                    <div className="p-4 bg-green-100 border-4 border-green-600 text-green-900 shadow-[4px_4px_0_0_rgba(22,101,52,1)] font-black uppercase tracking-wider flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 mr-3" />
                        {successMsg}
                    </div>
                )}
            </div>

            {/* Lookup Result Panel */}
            {vehicleData && !successMsg && (
                <div className="w-full max-w-md bg-white border-4 border-gray-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden mt-4">

                    {vehicleData.notFound ? (
                        <div className="bg-yellow-50 border-b-4 border-yellow-600 p-6 text-center shadow-[0_4px_0_0_rgba(202,138,4,1)]">
                            <AlertTriangle className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
                            <h3 className="text-xl font-display font-black text-yellow-900 uppercase tracking-tight">Unregistered Vehicle</h3>
                            <p className="font-mono text-2xl font-black text-yellow-800 mt-2 tracking-widest">{vehicleData.plate_number}</p>
                        </div>
                    ) : (
                        <div className="bg-green-50 border-b-4 border-green-600 p-6 text-center shadow-[0_4px_0_0_rgba(22,101,52,1)]">
                            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                            <h3 className="text-xl font-display font-black text-green-900 uppercase tracking-tight">Registered Student</h3>
                            <div className="font-mono text-3xl font-black text-green-900 tracking-widest mt-3 border-4 border-green-600 inline-block px-6 py-2 bg-white shadow-[4px_4px_0_0_rgba(22,101,52,1)]">
                                {vehicleData.plate_number}
                            </div>

                            <div className="mt-5 bg-white border-2 border-green-200 p-4 text-left shadow-[2px_2px_0_0_rgba(22,101,52,0.3)]">
                                <div className="text-xs font-bold text-green-700 uppercase tracking-widest mb-1">Owner</div>
                                <div className="text-xl font-black text-green-900 uppercase">{vehicleData.owner_name}</div>
                                <div className="text-sm font-bold text-green-800 mt-1 uppercase tracking-wide">{vehicleData.color} {vehicleData.make} {vehicleData.model}</div>
                            </div>
                        </div>
                    )}

                    {/* Driver & Items Panel */}
                    <div className="px-6 py-5 bg-white border-b-4 border-gray-200 space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">
                                Driver Name {vehicleData.notFound ? <span className="text-red-600">*</span> : ''}
                            </label>
                            <input
                                type="text"
                                value={driverName}
                                onChange={(e) => setDriverName(e.target.value)}
                                placeholder={vehicleData.notFound ? "REQUIRED" : vehicleData.owner_name?.toUpperCase()}
                                className="w-full px-4 py-3 border-2 border-gray-900 font-bold uppercase tracking-wide focus:ring-0 focus:border-brand-primary bg-gray-50 shadow-[2px_2px_0_0_rgba(0,0,0,1)] placeholder-gray-400"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Items in Vehicle</label>
                            <input
                                type="text"
                                value={declaredItems}
                                onChange={(e) => setDeclaredItems(e.target.value)}
                                placeholder="E.G. 2 LAPTOPS, 1 MONITOR..."
                                className="w-full px-4 py-3 border-2 border-gray-900 font-bold uppercase tracking-wide focus:ring-0 focus:border-brand-primary bg-gray-50 shadow-[2px_2px_0_0_rgba(0,0,0,1)] placeholder-gray-400"
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="p-6 grid grid-cols-2 gap-4 bg-gray-50">
                        <button
                            onClick={() => handleLogEvent('VEHICLE_ENTRY')}
                            disabled={loading}
                            className="flex flex-col items-center justify-center py-8 border-2 border-green-600 bg-green-600 text-white shadow-[4px_4px_0px_0px_rgba(22,101,52,1)] hover:bg-green-700 hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(22,101,52,1)] active:translate-y-[4px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <LogIn className="w-10 h-10 mb-3" />
                            <span className="font-black text-xl uppercase tracking-wider">LOG IN</span>
                        </button>
                        <button
                            onClick={() => handleLogEvent('VEHICLE_EXIT')}
                            disabled={loading}
                            className="flex flex-col items-center justify-center py-8 border-2 border-gray-900 bg-gray-900 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-black hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <LogOut className="w-10 h-10 mb-3 text-red-400" />
                            <span className="font-black text-xl uppercase tracking-wider">LOG OUT</span>
                        </button>
                    </div>

                </div>
            )}

        </div>
    );
};

const CheckCircle = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


export default VehicleLogger;
