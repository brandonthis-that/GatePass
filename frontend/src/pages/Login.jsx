import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthContext } from '../context/AuthContext';
import anulogo from '../assets/anulogo.svg';
import { AlertCircle } from 'lucide-react';
import { LoginSchema } from '../utils/schemas';

const Login = () => {
    const [globalError, setGlobalError] = useState(null);

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            username: '',
            password: ''
        }
    });

    const onSubmit = async (data) => {
        setGlobalError(null);
        try {
            const user = await login(data.username, data.password);

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
            setGlobalError('Invalid username or password. Please try again.');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 font-sans">
            <div className="w-full max-w-md gate-card shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex flex-col items-center mb-8 border-b-2 border-gray-900 pb-8">
                    <img src={anulogo} alt="ANU Logo" className="w-24 h-24 object-contain mb-6" />
                    <h2 className="text-3xl font-display font-black text-gray-900 uppercase tracking-tighter">GatePass</h2>
                    <p className="font-bold text-gray-500 mt-2 text-center text-xs tracking-widest uppercase">Institutional Access</p>
                </div>

                {globalError && (
                    <div className="mb-8 p-4 bg-red-50 border-2 border-red-500 flex items-start text-red-700 shadow-[4px_4px_0px_0px_rgba(239,68,68,1)]">
                        <AlertCircle className="w-5 h-5 mr-3 shrink-0" />
                        <span className="block sm:inline font-bold uppercase text-xs tracking-wider">{globalError}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-900 mb-2 uppercase tracking-wider">Username</label>
                        <input
                            type="text"
                            {...register('username')}
                            className="gate-input"
                            placeholder="e.g., jdoe2024"
                        />
                        {errors.username && <p className="mt-2 text-xs font-bold text-red-600">{errors.username.message}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-900 mb-2 uppercase tracking-wider">Password</label>
                        <input
                            type="password"
                            {...register('password')}
                            className="gate-input"
                            placeholder="••••••••"
                        />
                        {errors.password && <p className="mt-2 text-xs font-bold text-red-600">{errors.password.message}</p>}
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="gate-btn shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:shadow-none"
                        >
                            {isSubmitting ? 'AUTHENTICATING...' : 'SIGN IN'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
