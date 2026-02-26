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
                setAssets(assetsRes.data);
                setVehicles(vehiclesRes.data);
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
                <div className="mb-6 p-4 rounded-lg bg-red-50 border-l-4 border-red-500 text-red-700">
                    {error}
                </div>
            )}

            {/* Assets Section */}
            <section className="mb-10">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-xl font-semibold text-gray-800">
                        <Laptop className="w-5 h-5 mr-2 text-blue-600" />
                        My Registered Assets
                    </div>
                    <Link
                        to="/student/asset/new"
                        className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                        <Plus className="w-4 h-4 mr-1" />
                        <span className="hidden sm:inline">Add Asset</span>
                        <span className="sm:hidden">Add</span>
                    </Link>
                </div>

                {assets.length === 0 ? (
                    <div className="bg-white border self-center border-gray-200 rounded-xl p-8 text-center text-gray-500 shadow-sm">
                        <Laptop className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>You haven't registered any items like laptops or electronics yet.</p>
                    </div>
                ) : (
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                        {assets.map(asset => (
                            <div key={asset.id} className="bg-white border self-center border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{asset.asset_type}</h3>
                                        <p className="text-sm text-gray-500">{asset.model_name}</p>
                                    </div>
                                    <span className="bg-cyan-50 text-cyan-700 text-xs px-2 py-1 rounded-full font-medium border border-cyan-100">
                                        Active
                                    </span>
                                </div>
                                <div className="text-sm text-gray-600 font-mono mb-4">SN: {asset.serial_number}</div>

                                <Link
                                    to={`/student/asset/${asset.id}`}
                                    className="w-full flex justify-center items-center py-2 px-4 bg-gray-50 border border-gray-200 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-700 transition-colors"
                                >
                                    <QrCode className="w-4 h-4 mr-2" />
                                    View Gate QR Code
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Vehicles Section */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-xl font-semibold text-gray-800">
                        <Car className="w-5 h-5 mr-2 text-green-600" />
                        My Registered Vehicles
                    </div>
                    <Link
                        to="/student/vehicle/new"
                        className="flex items-center text-sm font-medium text-green-600 hover:text-green-800 bg-green-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                        <Plus className="w-4 h-4 mr-1" />
                        <span className="hidden sm:inline">Add Vehicle</span>
                        <span className="sm:hidden">Add</span>
                    </Link>
                </div>

                {vehicles.length === 0 ? (
                    <div className="bg-white border self-center border-gray-200 rounded-xl p-8 text-center text-gray-500 shadow-sm">
                        <Car className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>You haven't registered any vehicles for automatic gate entry.</p>
                    </div>
                ) : (
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                        {vehicles.map(vehicle => (
                            <div key={vehicle.id} className="bg-white border self-center border-gray-200 rounded-xl p-5 shadow-sm flex items-center justify-between">
                                <div>
                                    <div className="text-xl font-bold font-mono text-gray-900 border-2 border-gray-300 inline-block px-3 py-1 rounded mb-2 bg-gray-50 uppercase shadow-sm">
                                        {vehicle.plate_number}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {vehicle.color} {vehicle.make} {vehicle.model}
                                    </div>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                                    <Car className="w-5 h-5" />
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
