import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { ChevronLeft, CheckCircle, UserPlus, Clock, MapPin, Building2, Phone, Mail, FileText, Users } from 'lucide-react';

const VisitorForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        national_id: '',
        phone: '',
        email: '',
        organization: '',
        purpose_category: 'MEETING',
        purpose_details: '',
        host_name: '',
        host_email: '',
        host_phone: '',
        department: '',
        office_location: '',
        expected_duration: 60,
        scheduled_time: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [visitorData, setVisitorData] = useState(null);

    const navigate = useNavigate();

    const purposeOptions = [
        { value: 'MEETING', label: 'Business Meeting' },
        { value: 'INTERVIEW', label: 'Job Interview' },
        { value: 'DELIVERY', label: 'Delivery/Pickup' },
        { value: 'MAINTENANCE', label: 'Maintenance/Repair' },
        { value: 'STUDENT_VISIT', label: 'Student Visit' },
        { value: 'OFFICIAL', label: 'Official Business' },
        { value: 'PERSONAL', label: 'Personal Visit' },
        { value: 'OTHER', label: 'Other' },
    ];

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'number' ? parseInt(value) || 0 : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Validate National ID — Kenyan IDs are exactly 8 digits
        const idRegex = /^\d{8}$/;
        if (!idRegex.test(formData.national_id.trim())) {
            setError("National ID must be exactly 8 digits (numbers only).");
            setLoading(false);
            return;
        }

        // Validate visitor phone if provided
        const phoneRegex = /^(\+254|0)[17]\d{8}$/;
        if (formData.phone && !phoneRegex.test(formData.phone.trim())) {
            setError("Please enter a valid Kenyan phone number (e.g. +254712345678 or 0712345678).");
            setLoading(false);
            return;
        }

        // Validate host phone if provided
        if (formData.host_phone && !phoneRegex.test(formData.host_phone.trim())) {
            setError("Please enter a valid host phone number (e.g. +254712345678 or 0712345678).");
            setLoading(false);
            return;
        }

        try {
            // Submit visitor data
            const response = await api.post('/api/visitors/', formData);
            setVisitorData(response.data);
            setSuccess(true);

        } catch (err) {
            if (err.response?.data) {
                const messages = Object.values(err.response.data).flat().join(' ');
                setError(messages || "Failed to register visitor.");
            } else {
                setError("Network error. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 pb-24">

            <div className="w-full max-w-2xl flex items-center mb-6">
                <button
                    onClick={() => navigate('/guard')}
                    className="flex flex-1 items-center text-gray-600 hover:text-gray-900 bg-white shadow-sm border border-gray-200 py-3 px-4 rounded-xl font-medium transition-colors"
                >
                    <ChevronLeft className="w-5 h-5 mr-2" />
                    Back to Terminal
                </button>
            </div>

            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">

                {success && visitorData ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <CheckCircle className="w-20 h-20 mb-4 text-green-500" />
                        <h2 className="text-3xl font-bold mb-4 text-gray-900">Visitor Registered!</h2>
                        
                        <div className="w-full max-w-md bg-gray-50 p-6 rounded-xl mb-6 text-left">
                            <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                                <Users className="w-5 h-5 mr-2" />
                                Visitor Details
                            </h3>
                            <div className="space-y-2 text-sm">
                                <p><strong>Name:</strong> {visitorData.name}</p>
                                <p><strong>ID:</strong> {visitorData.national_id}</p>
                                <p><strong>Status:</strong> <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-medium">{visitorData.status}</span></p>
                                <p><strong>Purpose:</strong> {visitorData.purpose_category}</p>
                                <p><strong>Host:</strong> {visitorData.host_name}</p>
                                {visitorData.department && <p><strong>Department:</strong> {visitorData.department}</p>}
                                {visitorData.office_location && <p><strong>Office:</strong> {visitorData.office_location}</p>}
                                <p><strong>Expected Duration:</strong> {visitorData.expected_duration} minutes</p>
                            </div>
                        </div>

                        <div className="w-full max-w-md bg-yellow-50 border border-yellow-200 p-4 rounded-xl mb-6">
                            <p className="text-sm text-yellow-800">
                                <strong>🔄 Next Steps:</strong> Contact {visitorData.host_name} to confirm this visitor is expected. 
                                Use visitor management to approve the visit once confirmed.
                            </p>
                        </div>
                        
                        <button 
                            onClick={() => navigate('/guard')}
                            className="w-full max-w-md bg-blue-600 text-white py-4 px-6 rounded-xl hover:bg-blue-700 transition-colors font-medium text-lg"
                        >
                            Return to Dashboard
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">

                        <div className="flex items-center justify-center mb-8 bg-blue-50 rounded-full w-20 h-20 mx-auto text-blue-600">
                            <UserPlus className="w-10 h-10" />
                        </div>

                        <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">Enhanced Visitor Registration</h2>

                        {error && (
                            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 font-medium">
                                {error}
                            </div>
                        )}

                        {/* Visitor Personal Information */}
                        <div className="bg-gray-50 p-4 rounded-xl">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                                <Users className="w-5 h-5 mr-2" />
                                Visitor Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Full Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        minLength={3}
                                        maxLength={100}
                                        placeholder="e.g. Jane Wanjiku"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-0 focus:border-blue-500 transition-colors shadow-sm bg-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">National ID *</label>
                                    <input
                                        type="text"
                                        name="national_id"
                                        required
                                        minLength={8}
                                        maxLength={8}
                                        inputMode="numeric"
                                        pattern="\d{8}"
                                        title="National ID must be exactly 8 digits"
                                        placeholder="Required for entry (8 digits)"
                                        value={formData.national_id}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-0 focus:border-blue-500 transition-colors shadow-sm bg-white font-mono"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide flex items-center">
                                        <Phone className="w-4 h-4 mr-1" />
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        placeholder="e.g. +254712345678"
                                        pattern="(\+254|0)[17]\d{8}"
                                        title="Enter a valid Kenyan phone number"
                                        maxLength={15}
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-0 focus:border-blue-500 transition-colors shadow-sm bg-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide flex items-center">
                                        <Mail className="w-4 h-4 mr-1" />
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="visitor@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-0 focus:border-blue-500 transition-colors shadow-sm bg-white"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide flex items-center">
                                        <Building2 className="w-4 h-4 mr-1" />
                                        Organization/Company
                                    </label>
                                    <input
                                        type="text"
                                        name="organization"
                                        placeholder="e.g. ABC Company Ltd"
                                        maxLength={100}
                                        value={formData.organization}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-0 focus:border-blue-500 transition-colors shadow-sm bg-white"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Visit Purpose */}
                        <div className="bg-blue-50 p-4 rounded-xl">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                                <FileText className="w-5 h-5 mr-2" />
                                Visit Purpose
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Purpose Category *</label>
                                    <select
                                        name="purpose_category"
                                        value={formData.purpose_category}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-0 focus:border-blue-500 transition-colors shadow-sm bg-white"
                                    >
                                        {purposeOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide flex items-center">
                                        <Clock className="w-4 h-4 mr-1" />
                                        Expected Duration (minutes) *
                                    </label>
                                    <input
                                        type="number"
                                        name="expected_duration"
                                        required
                                        min="15"
                                        max="480"
                                        value={formData.expected_duration}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-0 focus:border-blue-500 transition-colors shadow-sm bg-white"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Purpose Details *</label>
                                    <textarea
                                        name="purpose_details"
                                        required
                                        rows={3}
                                        minLength={10}
                                        maxLength={500}
                                        placeholder="Brief description of the specific purpose of visit..."
                                        value={formData.purpose_details}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-0 focus:border-blue-500 transition-colors shadow-sm bg-white resize-none"
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        {/* Host Information */}
                        <div className="bg-green-50 p-4 rounded-xl">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                                <MapPin className="w-5 h-5 mr-2" />
                                Host & Location Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Host Name *</label>
                                    <input
                                        type="text"
                                        name="host_name"
                                        required
                                        minLength={3}
                                        maxLength={100}
                                        placeholder="e.g. Dr. John Doe"
                                        value={formData.host_name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-0 focus:border-blue-500 transition-colors shadow-sm bg-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Host Phone</label>
                                    <input
                                        type="tel"
                                        name="host_phone"
                                        placeholder="Host contact number"
                                        pattern="(\+254|0)[17]\d{8}"
                                        title="Enter a valid Kenyan phone number"
                                        maxLength={15}
                                        value={formData.host_phone}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-0 focus:border-blue-500 transition-colors shadow-sm bg-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Department</label>
                                    <input
                                        type="text"
                                        name="department"
                                        placeholder="e.g. Computer Science, Admissions"
                                        value={formData.department}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-0 focus:border-blue-500 transition-colors shadow-sm bg-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Office Location</label>
                                    <input
                                        type="text"
                                        name="office_location"
                                        placeholder="e.g. Block C - Room 205"
                                        value={formData.office_location}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-0 focus:border-blue-500 transition-colors shadow-sm bg-white"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Host Email</label>
                                    <input
                                        type="email"
                                        name="host_email"
                                        placeholder="host@university.edu"
                                        value={formData.host_email}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-0 focus:border-blue-500 transition-colors shadow-sm bg-white"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full flex justify-center py-5 px-4 rounded-xl shadow-lg text-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all active:scale-95 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {loading ? 'Processing...' : 'Register Visitor'}
                            </button>
                        </div>
                    </form>
                )}
            </div>

        </div>
    );
};

export default VisitorForm;
