import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import PageLayout from '../shared/PageLayout';
import { CheckCircle2, ChevronLeft } from 'lucide-react';

const AssetForm = () => {
    const [formData, setFormData] = useState({
        asset_type: '',
        serial_number: '',
        model_name: ''
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

        try {
            await api.post('/api/assets/', formData);
            setSuccess(true);
            setTimeout(() => {
                navigate('/student');
            }, 1500);
        } catch (err) {
            if (err.response?.data) {
                // Simple error parsing for DRF validations
                const messages = Object.values(err.response.data).flat().join(' ');
                setError(messages || "Failed to register asset. Please check your inputs.");
            } else {
                setError("Network error. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageLayout title="Register New Asset">

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
                        <h2 className="text-2xl font-semibold mb-2">Asset Registered!</h2>
                        <p className="text-gray-500">Redirecting you back to dashboard...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {error && (
                            <div className="p-4 rounded-lg bg-red-50 border-l-4 border-red-500 text-red-700">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Asset Type</label>
                            <select
                                name="asset_type"
                                required
                                value={formData.asset_type}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm bg-white"
                            >
                                <option value="" disabled>Select a type...</option>
                                <option value="Laptop">Laptop / MacBook</option>
                                <option value="Tablet">Tablet / iPad</option>
                                <option value="Camera">DSLR Camera</option>
                                <option value="Audio Desktop">Audio / DJ Equipment</option>
                                <option value="Other">Other Electronics</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Make and Model Name</label>
                            <input
                                type="text"
                                name="model_name"
                                required
                                placeholder="e.g. Dell XPS 15 9500"
                                value={formData.model_name}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Serial Number</label>
                            <input
                                type="text"
                                name="serial_number"
                                required
                                placeholder="Check the bottom or back of your device"
                                value={formData.serial_number}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm font-mono uppercase"
                            />
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {loading ? 'Processing...' : 'Register Asset & Generate QR Code'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </PageLayout>
    );
};

export default AssetForm;
