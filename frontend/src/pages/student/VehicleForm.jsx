import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import PageLayout from '../shared/PageLayout';
import { CheckCircle2, ChevronLeft, Car } from 'lucide-react';

const VehicleForm = () => {
    const [formData, setFormData] = useState({
        plate_number: '',
        make: '',
        model: '',
        color: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Normalize plate number (uppercase, strip weird spaces)
        const normalizedPlate = formData.plate_number.toUpperCase().trim();

        // Validate Kenyan plate format: e.g. KCA 123A, KAA 000A, KCB 1234
        const plateRegex = /^[A-Z]{2,3}\s?\d{3,4}[A-Z]?$/;
        if (!plateRegex.test(normalizedPlate)) {
            setError("Please enter a valid plate number (e.g. KCA 123A or KCB 1234).");
            setLoading(false);
            return;
        }

        const normalizedData = {
            ...formData,
            plate_number: normalizedPlate
        };

        try {
            await api.post('/api/vehicles/', normalizedData);
            setSuccess(true);
            setTimeout(() => {
                navigate('/student');
            }, 1500);
        } catch (err) {
            if (err.response?.data) {
                const messages = Object.values(err.response.data).flat().join(' ');
                setError(messages || "Failed to register vehicle. Please check your inputs.");
            } else {
                setError("Network error. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageLayout title="Register Vehicle">

            <button
                onClick={() => navigate('/student')}
                className="flex items-center text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
            >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back to Dashboard
            </button>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 max-w-2xl">

                {success ? (
                    <div className="flex flex-col items-center justify-center py-12 text-green-600">
                        <CheckCircle2 className="w-16 h-16 mb-4" />
                        <h2 className="text-2xl font-semibold mb-2">Vehicle Registered!</h2>
                        <p className="text-gray-500">Redirecting you back to dashboard...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">

                        <div className="flex items-center justify-center mb-8 bg-green-50 rounded-full w-16 h-16 mx-auto text-green-600">
                            <Car className="w-8 h-8" />
                        </div>

                        {error && (
                            <div className="p-4 rounded-lg bg-red-50 border-l-4 border-red-500 text-red-700">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">License Plate Number</label>
                            <input
                                type="text"
                                name="plate_number"
                                required
                                minLength={6}
                                maxLength={10}
                                placeholder="e.g. KCA 123A"
                                value={formData.plate_number}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors shadow-sm font-mono uppercase bg-gray-50"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Make</label>
                                <input
                                    type="text"
                                    name="make"
                                    required
                                    minLength={2}
                                    maxLength={50}
                                    placeholder="e.g. Toyota"
                                    value={formData.make}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors shadow-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
                                <input
                                    type="text"
                                    name="model"
                                    required
                                    minLength={2}
                                    maxLength={50}
                                    placeholder="e.g. Fielder"
                                    value={formData.model}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors shadow-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                            <input
                                type="text"
                                name="color"
                                required
                                minLength={2}
                                maxLength={30}
                                placeholder="e.g. White"
                                value={formData.color}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors shadow-sm"
                            />
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {loading ? 'Registering...' : 'Register Vehicle'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </PageLayout>
    );
};

export default VehicleForm;
