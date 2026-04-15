import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '../../api/axios';
import PageLayout from '../shared/PageLayout';
import { CheckCircle2, ChevronLeft, Car, AlertCircle } from 'lucide-react';
import { VehicleSchema } from '../../utils/schemas';

const VehicleForm = () => {
    const [globalError, setGlobalError] = useState(null);
    const [success, setSuccess] = useState(false);

    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(VehicleSchema),
        defaultValues: {
            plate_number: '',
            make: '',
            model: '',
            color: ''
        }
    });

    const onSubmit = async (data) => {
        setGlobalError(null);
        try {
            await api.post('/api/vehicles/', data);
            setSuccess(true);
            setTimeout(() => {
                navigate('/student');
            }, 1500);
        } catch (err) {
            if (err.response?.data) {
                const messages = Object.values(err.response.data).flat().join(' ');
                setGlobalError(messages || "Failed to register vehicle. Please check your inputs.");
            } else {
                setGlobalError("Network error. Please try again.");
            }
        }
    };

    return (
        <PageLayout title="Register Vehicle">
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
                        <h2 className="text-2xl font-display font-bold uppercase tracking-wide mb-2">Vehicle Registered</h2>
                        <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">Redirecting to dashboard...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="flex items-center justify-center mb-8 border-2 border-brand-primary rounded-none bg-white w-20 h-20 mx-auto text-brand-primary shadow-[4px_4px_0px_0px_var(--color-brand-primary)]">
                            <Car className="w-8 h-8" />
                        </div>

                        {globalError && (
                            <div className="flex items-start p-4 bg-red-50 border-2 border-red-500 text-red-700 shadow-[4px_4px_0px_0px_rgba(239,68,68,1)]">
                                <AlertCircle className="w-5 h-5 mr-3 shrink-0" />
                                <div className="text-sm font-bold">{globalError}</div>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-gray-900 mb-2 uppercase tracking-widest">License Plate Number</label>
                            <input
                                type="text"
                                placeholder="e.g. KCA 123A"
                                {...register('plate_number')}
                                className="gate-input w-full font-mono uppercase bg-gray-50 text-xl"
                            />
                            {errors.plate_number && <p className="mt-2 text-xs font-bold text-red-600">{errors.plate_number.message}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-900 mb-2 uppercase tracking-widest">Make</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Toyota"
                                    {...register('make')}
                                    className="gate-input w-full"
                                />
                                {errors.make && <p className="mt-2 text-xs font-bold text-red-600">{errors.make.message}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-900 mb-2 uppercase tracking-widest">Model</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Fielder"
                                    {...register('model')}
                                    className="gate-input w-full"
                                />
                                {errors.model && <p className="mt-2 text-xs font-bold text-red-600">{errors.model.message}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-900 mb-2 uppercase tracking-widest">Color</label>
                            <input
                                type="text"
                                placeholder="e.g. White"
                                {...register('color')}
                                className="gate-input w-full"
                            />
                            {errors.color && <p className="mt-2 text-xs font-bold text-red-600">{errors.color.message}</p>}
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="gate-btn w-full flex justify-center py-4"
                            >
                                {isSubmitting ? 'Registering...' : 'Register Vehicle'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </PageLayout>
    );
};

export default VehicleForm;
