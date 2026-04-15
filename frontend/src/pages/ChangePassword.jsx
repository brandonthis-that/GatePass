import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import { KeyRound, AlertCircle } from 'lucide-react';
import { ChangePasswordSchema } from '../utils/schemas';

const ChangePassword = () => {
    const [globalError, setGlobalError] = useState(null);
    const [success, setSuccess] = useState(false);

    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(ChangePasswordSchema),
        defaultValues: {
            old_password: '',
            new_password: '',
            confirm_password: ''
        }
    });

    const onSubmit = async (data) => {
        setGlobalError(null);
        try {
            await api.patch('/api/users/me/', {
                old_password: data.old_password,
                password: data.new_password
            });

            setSuccess(true);
            setTimeout(() => {
                let dest;
                if (user.role === 'student') dest = '/student';
                else if (user.role === 'admin') dest = '/admin';
                else dest = '/guard';
                navigate(dest, { replace: true });
            }, 2000);
        } catch (err) {
            const resData = err.response?.data;
            if (resData && typeof resData === 'object') {
                const msgs = Object.values(resData).flat().join(' ');
                setGlobalError(msgs || 'Failed to update password.');
            } else {
                setGlobalError('Failed to update password. Please try again.');
            }
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 font-sans">
            <div className="w-full max-w-md gate-card shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex flex-col items-center mb-8 border-b-2 border-gray-900 pb-8">
                    <div className="bg-brand-primary p-4 border-2 border-gray-900 mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <KeyRound className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-display font-black text-gray-900 text-center uppercase tracking-tighter">Security</h2>
                    <p className="font-bold text-gray-500 mt-2 text-center text-xs tracking-widest uppercase">Update Password</p>
                </div>

                {globalError && (
                    <div className="mb-8 p-4 bg-red-50 border-2 border-red-500 flex items-start text-red-700 shadow-[4px_4px_0px_0px_rgba(239,68,68,1)]">
                        <AlertCircle className="w-5 h-5 mr-3 shrink-0" />
                        <span className="block sm:inline font-bold uppercase text-xs tracking-wider">{globalError}</span>
                    </div>
                )}

                {success && (
                    <div className="mb-8 p-4 bg-white border-2 border-green-600 flex items-start text-green-700 shadow-[4px_4px_0px_0px_#16a34a]">
                        <span className="block sm:inline font-bold uppercase text-xs tracking-wider">Password updated successfully! Redirecting...</span>
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-900 mb-2 uppercase tracking-wider">Old Password</label>
                        <input
                            type="password"
                            {...register('old_password')}
                            className="gate-input"
                        />
                        {errors.old_password && <p className="mt-2 text-xs font-bold text-red-600">{errors.old_password.message}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-900 mb-2 uppercase tracking-wider">New Password</label>
                        <input
                            type="password"
                            {...register('new_password')}
                            className="gate-input"
                        />
                        {errors.new_password && <p className="mt-2 text-xs font-bold text-red-600">{errors.new_password.message}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-900 mb-2 uppercase tracking-wider">Confirm New Password</label>
                        <input
                            type="password"
                            {...register('confirm_password')}
                            className="gate-input"
                        />
                        {errors.confirm_password && <p className="mt-2 text-xs font-bold text-red-600">{errors.confirm_password.message}</p>}
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isSubmitting || success}
                            className="gate-btn shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:shadow-none"
                        >
                            {isSubmitting ? 'UPDATING...' : 'UPDATE PASSWORD'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChangePassword;
