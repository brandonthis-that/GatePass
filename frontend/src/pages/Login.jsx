import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import anulogo from '../assets/anulogo.svg';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const trimmedUsername = username.trim();
        if (!trimmedUsername) {
            setError('Please enter your username.');
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const user = await login(trimmedUsername, password);

            // Enforce change password on first login (backend flag)
            if (user.must_change_password) {
                navigate('/change-password', { replace: true });
            } else {
                let dest;
                if (user.role === 'student') dest = '/student';
                else if (user.role === 'admin') dest = '/admin';
                else dest = '/guard';
                navigate(dest, { replace: true });
            }
        } catch {
            setError('Invalid username or password. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-200">
                <div className="flex flex-col items-center mb-8">
                    <img src={anulogo} alt="ANU Logo" className="w-24 h-24 object-contain mb-4" />
                    <h2 className="text-3xl font-bold text-gray-800">GatePass SignIn</h2>
                    <p className="text-gray-500 mt-2 text-center text-sm">Use your credentials to access the portal</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-lg bg-red-50 border-l-4 border-red-500 flex items-start text-red-700">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors shadow-sm"
                            placeholder="e.g., jdoe2024"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors shadow-sm"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transition-colors ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
