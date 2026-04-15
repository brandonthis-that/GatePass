import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '../../api/axios';
import PageLayout from '../shared/PageLayout';
import { CheckCircle2, ChevronLeft, AlertCircle } from 'lucide-react';
import { AssetSchema } from '../../utils/schemas';

const AssetForm = () => {
    const [globalError, setGlobalError] = useState(null);
    const [success, setSuccess] = useState(false);
    
    const navigate = useNavigate();
    
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(AssetSchema),
        defaultValues: {
            asset_type: '',
            serial_number: '',
            model_name: ''
        }
    });

    const onSubmit = async (data) => {
        setGlobalError(null);
        try {
            await api.post('/api/assets/', data);
            setSuccess(true);
            setTimeout(() => {
                navigate('/student');
            }, 1500);
        } catch (err) {
            if (err.response?.data) {
                const messages = Object.values(err.response.data).flat().join(' ');
                setGlobalError(messages || "Failed to register asset. Please check your inputs.");
            } else {
                setGlobalError("Network error. Please try again.");
            }
        }
    };

    return (
        <PageLayout title="Register New Asset">
            <button
                onClick={() => navigate('/student')}
                className="flex items-center text-sm font-bold text-gray-500 hover:text-brand-primary mb-6 transition-colors uppercase tracking-wider"
            >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back to Dashboard
            </button>

            <div className="gate-card p-6 md:p-8 max-w-2xl bg-white">
                {success ? (
                    <div className="flex flex-col items-center justify-center py-12 text-brand-primary animate-in zoom-in fade-in duration-300">
                        <CheckCircle2 className="w-16 h-16 mb-4" />
                        <h2 className="text-2xl font-display font-bold uppercase tracking-wide mb-2">Asset Registered</h2>
                        <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">Redirecting to dashboard...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {globalError && (
                            <div className="flex items-start p-4 bg-red-50 border-2 border-red-500 text-red-700 shadow-[4px_4px_0px_0px_rgba(239,68,68,1)]">
                                <AlertCircle className="w-5 h-5 mr-3 shrink-0" />
                                <div className="text-sm font-bold">{globalError}</div>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-gray-900 mb-2 uppercase tracking-widest">Asset Type</label>
                            <select
                                {...register('asset_type')}
                                className="gate-input bg-white w-full"
                            >
                                <option value="" disabled>Select a type...</option>
                                <option value="Laptop">Laptop / MacBook</option>
                                <option value="Tablet">Tablet / iPad</option>
                                <option value="Camera">DSLR Camera</option>
                                <option value="Audio Desktop">Audio / DJ Equipment</option>
                                <option value="Other">Other Electronics</option>
                            </select>
                            {errors.asset_type && <p className="mt-2 text-xs font-bold text-red-600">{errors.asset_type.message}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-900 mb-2 uppercase tracking-widest">Make and Model Name</label>
                            <input
                                type="text"
                                placeholder="e.g. Dell XPS 15 9500"
                                {...register('model_name')}
                                className="gate-input w-full"
                            />
                            {errors.model_name && <p className="mt-2 text-xs font-bold text-red-600">{errors.model_name.message}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-900 mb-2 uppercase tracking-widest">Serial Number</label>
                            <input
                                type="text"
                                placeholder="Check the bottom or back of your device"
                                {...register('serial_number')}
                                className="gate-input w-full font-mono uppercase"
                            />
                            {errors.serial_number && <p className="mt-2 text-xs font-bold text-red-600">{errors.serial_number.message}</p>}
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="gate-btn w-full flex justify-center py-4"
                            >
                                {isSubmitting ? 'Processing...' : 'Register Asset & Generate QR'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </PageLayout>
    );
};

export default AssetForm;
