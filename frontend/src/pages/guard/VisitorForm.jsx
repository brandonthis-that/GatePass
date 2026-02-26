import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { ChevronLeft, CheckCircle, UserPlus } from 'lucide-react';

const VisitorForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        national_id: '',
        purpose: '',
        host_name: ''
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
            await api.post('/api/visitors/', formData);
            setSuccess(true);

            // Auto-log the visitor entry in gate logs as per API docs
            await api.post('/api/gate-logs/', {
                log_type: "VISITOR_ENTRY",
                is_visitor: true,
                notes: `Visitor: ${formData.name}`
            });

            setTimeout(() => {
                navigate('/guard');
            }, 1500);
        } catch (err) {
            if (err.response?.data) {
                const messages = Object.values(err.response.data).flat().join(' ');
                setError(messages || "Failed to register visitor. Connect to network.");
            } else {
                setError("Network error. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 pb-24">

            <div className="w-full max-w-lg flex items-center mb-6">
                <button
                    onClick={() => navigate('/guard')}
                    className="flex flex-1 items-center text-gray-600 hover:text-gray-900 bg-white shadow-sm border border-gray-200 py-3 px-4 rounded-xl font-medium transition-colors"
                >
                    <ChevronLeft className="w-5 h-5 mr-2" />
                    Back to Terminal
                </button>
            </div>

            <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">

                {success ? (
                    <div className="flex flex-col items-center justify-center py-12 text-blue-600">
                        <CheckCircle className="w-20 h-20 mb-4" />
                        <h2 className="text-3xl font-bold mb-2 text-gray-900">Signed In</h2>
                        <p className="text-gray-500 font-medium">Visitor logged successfully.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">

                        <div className="flex items-center justify-center mb-8 bg-blue-50 rounded-full w-20 h-20 mx-auto text-blue-600">
                            <UserPlus className="w-10 h-10" />
                        </div>

                        <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">New Visitor Record</h2>

                        {error && (
                            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 font-medium">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                required
                                placeholder="e.g. Jane Wanjiku"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-0 focus:border-blue-500 transition-colors shadow-sm bg-gray-50 text-lg"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">National ID</label>
                            <input
                                type="text"
                                name="national_id"
                                required
                                placeholder="Required for entry"
                                value={formData.national_id}
                                onChange={handleChange}
                                className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-0 focus:border-blue-500 transition-colors shadow-sm bg-gray-50 text-lg font-mono"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Host Name (Who they are visiting)</label>
                            <input
                                type="text"
                                name="host_name"
                                required
                                placeholder="e.g. John Doe / Admissions Office"
                                value={formData.host_name}
                                onChange={handleChange}
                                className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-0 focus:border-blue-500 transition-colors shadow-sm bg-gray-50 text-lg"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Purpose of Visit</label>
                            <textarea
                                name="purpose"
                                required
                                rows={3}
                                placeholder="Brief description..."
                                value={formData.purpose}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-0 focus:border-blue-500 transition-colors shadow-sm bg-gray-50 text-lg resize-none"
                            ></textarea>
                        </div>

                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full flex justify-center py-5 px-4 rounded-xl shadow-lg text-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all active:scale-95 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {loading ? 'Processing...' : 'Sign In Visitor'}
                            </button>
                        </div>
                    </form>
                )}
            </div>

        </div>
    );
};

export default VisitorForm;
