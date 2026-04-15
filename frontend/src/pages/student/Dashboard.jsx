import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import PageLayout from '../shared/PageLayout';
import { Laptop, Car, Plus, QrCode, ArrowRight } from 'lucide-react';

const StudentDashboard = () => {
    const [assets, setAssets] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [assetsRes, vehiclesRes] = await Promise.all([
                    api.get('/api/assets/'),
                    api.get('/api/vehicles/')
                ]);
                setAssets(assetsRes.data.results || assetsRes.data);
                setVehicles(vehiclesRes.data.results || vehiclesRes.data);
            } catch (err) {
                console.error(err);
                setError("Failed to load your dashboard data. Please refresh.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <PageLayout title="Student Dashboard">
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </PageLayout>
        );
    }

    return (
        <PageLayout title="My Dashboard">

            {error && (
                <div className="mb-6 p-4 bg-white border-2 border-brand-primary text-brand-primary font-bold shadow-[4px_4px_0px_0px_var(--color-brand-primary)]">
                    {error}
                </div>
            )}

            {/* Assets Section */}
            <section className="mb-12">
                <div className="flex items-center justify-between mb-6 border-b-2 border-gray-900 pb-4">
                    <div className="flex items-center text-xl font-display font-black text-gray-900 uppercase tracking-tighter">
                        <Laptop className="w-6 h-6 mr-3 text-brand-primary" />
                        Registered Assets
                    </div>
                    <Link
                        to="/student/asset/new"
                        className="flex items-center text-xs font-bold text-gray-900 hover:text-white bg-white hover:bg-gray-900 border-2 border-gray-900 px-4 py-2 uppercase tracking-widest transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-none active:translate-y-[2px] active:shadow-none"
                    >
                        <Plus className="w-4 h-4 mr-1" />
                        <span className="hidden sm:inline">Add Asset</span>
                        <span className="sm:hidden">Add</span>
                    </Link>
                </div>

                {assets.length === 0 ? (
                    <div className="gate-card text-center text-gray-500 border-dashed border-gray-400">
                        <Laptop className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="font-bold uppercase tracking-widest text-sm text-gray-400">No assets registered</p>
                    </div>
                ) : (
                    <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                        {assets.map(asset => (
                            <div key={asset.id} className="gate-card flex flex-col justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] transition-transform hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-display font-black text-xl text-gray-900 uppercase leading-none">{asset.asset_type}</h3>
                                            <p className="text-sm font-bold text-gray-500 mt-1">{asset.model_name}</p>
                                        </div>
                                        <span className="bg-brand-primary text-white text-[10px] px-2 py-1 font-bold uppercase tracking-widest border-2 border-gray-900">
                                            ACTIVE
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-900 font-mono font-bold mb-6 bg-gray-100 p-2 border-2 border-gray-900 inline-block">SN: {asset.serial_number}</div>
                                </div>
                                <Link
                                    to={`/student/asset/${asset.id}`}
                                    className="gate-btn-secondary w-full uppercase tracking-widest text-xs py-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-none active:translate-y-[2px] active:shadow-none"
                                >
                                    <QrCode className="w-4 h-4 mr-2" />
                                    View Gate QR
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Vehicles Section */}
            <section>
                <div className="flex items-center justify-between mb-6 border-b-2 border-gray-900 pb-4">
                    <div className="flex items-center text-xl font-display font-black text-gray-900 uppercase tracking-tighter">
                        <Car className="w-6 h-6 mr-3 text-brand-primary" />
                        Registered Vehicles
                    </div>
                    <Link
                        to="/student/vehicle/new"
                        className="flex items-center text-xs font-bold text-gray-900 hover:text-white bg-white hover:bg-gray-900 border-2 border-gray-900 px-4 py-2 uppercase tracking-widest transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-none active:translate-y-[2px] active:shadow-none"
                    >
                        <Plus className="w-4 h-4 mr-1" />
                        <span className="hidden sm:inline">Add Vehicle</span>
                        <span className="sm:hidden">Add</span>
                    </Link>
                </div>

                {vehicles.length === 0 ? (
                    <div className="gate-card text-center text-gray-500 border-dashed border-gray-400">
                        <Car className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="font-bold uppercase tracking-widest text-sm text-gray-400">No vehicles registered</p>
                    </div>
                ) : (
                    <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                        {vehicles.map(vehicle => (
                            <div key={vehicle.id} className="gate-card flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] transition-transform hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                <div>
                                    <div className="text-xl font-bold font-mono text-gray-900 border-2 border-gray-900 inline-block px-3 py-1 mb-2 bg-gray-50 uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                        {vehicle.plate_number}
                                    </div>
                                    <div className="text-sm font-bold text-gray-600 uppercase tracking-wider">
                                        {vehicle.color} <span className="text-gray-900">{vehicle.make}</span> {vehicle.model}
                                    </div>
                                </div>
                                <div className="w-12 h-12 bg-white border-2 border-gray-900 flex items-center justify-center text-brand-primary shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                    <Car className="w-6 h-6" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

        </PageLayout>
    );
};

export default StudentDashboard;
