import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import { KeyRound } from 'lucide-react';

const ChangePassword = () => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword.length < 8) {
            setError("New password must be at least 8 characters long.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setError("New passwords do not match.");
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            // Assuming a generic pattern for changing password on a Django REST backend via PATCH
            await api.patch('/api/users/me/', {
                old_password: oldPassword, // Example field if needed by backend, though GatePass API.md doesn't explicitly detail a specific password change route, we'll assume standard patch to /me or provide a custom mechanism. Let's patch password directly.
                password: newPassword
            });

            setSuccess(true);
            
            // Refresh happens automatically on next API call via token interceptor

            setTimeout(() => {
                let dest;
                if (user.role === 'student') dest = '/student';
                else if (user.role === 'admin') dest = '/admin';
                else dest = '/guard';
                navigate(dest, { replace: true });
            }, 2000);
        } catch (err) {
            const data = err.response?.data;
            if (data && typeof data === 'object') {
                const msgs = Object.values(data).flat().join(' ');
                setError(msgs || 'Failed to update password.');
            } else {
                setError('Failed to update password. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-200">
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-amber-500 p-4 rounded-full mb-4">
                        <KeyRound className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800 text-center">Change Password</h2>
                    <p className="text-gray-500 mt-2 text-center text-sm">Please secure your account before continuing</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-lg bg-red-50 border-l-4 border-red-500 flex items-start text-red-700">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 rounded-lg bg-green-50 border-l-4 border-green-500 flex items-start text-green-700">
                        <span className="block sm:inline">Password updated successfully! Redirecting...</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Old Password</label>
                        <input
                            type="password"
                            required
                            maxLength={128}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors shadow-sm"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                        <input
                            type="password"
                            required
                            minLength={8}
                            maxLength={128}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors shadow-sm"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                        <input
                            type="password"
                            required
                            minLength={8}
                            maxLength={128}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors shadow-sm"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || success}
                        className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors ${isLoading || success ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? 'Updating...' : 'Update Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChangePassword;
