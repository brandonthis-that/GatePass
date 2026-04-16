import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '../../api/axios';
import { ChevronLeft, CheckCircle, UserPlus, Clock, MapPin, Building2, Phone, Mail, FileText, Users, AlertCircle } from 'lucide-react';
import { VisitorSchema } from '../../utils/schemas';

const VisitorForm = () => {
    const [globalError, setGlobalError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [visitorData, setVisitorData] = useState(null);
    const [phoneCountry, setPhoneCountry] = useState('+254');
    const [hostPhoneCountry, setHostPhoneCountry] = useState('+254');

    const navigate = useNavigate();

    const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(VisitorSchema),
        defaultValues: {
            name: '',
            document_type: 'PASSPORT',
            national_id: '',
            phone: '',
            phone_country: '+254',
            email: '',
            organization: '',
            purpose_category: 'MEETING',
            purpose_details: '',
            host_name: '',
            host_email: '',
            host_phone: '',
            host_phone_country: '+254',
            department: '',
            office_location: '',
            expected_duration: 60,
        }
    });

    const purposeCategory = watch('purpose_category');
    const isStudentVisit = purposeCategory === 'STUDENT_VISIT';
    const isPersonal = purposeCategory === 'PERSONAL';

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

    const documentTypeOptions = [
        { value: 'PASSPORT', label: 'Passport' },
        { value: 'KENYA_NATIONAL_ID', label: 'Kenya National ID' },
        { value: 'FOREIGN_ID', label: 'Foreign ID' },
    ];

    const onSubmit = async (data) => {
        setGlobalError(null);

        const submitData = {
            ...data,
            phone_country: phoneCountry,
            host_phone_country: hostPhoneCountry,
        };
        if (submitData.phone) submitData.phone = submitData.phone.trim();
        if (submitData.host_phone) submitData.host_phone = submitData.host_phone.trim();
        
        submitData.scheduled_time = null;

        try {
            const response = await api.post('/api/visitors/', submitData);
            setVisitorData(response.data);
            setSuccess(true);
        } catch (err) {
            if (err.response?.data) {
                const messages = Object.values(err.response.data).flat().join(' ');
                setGlobalError(messages || "Failed to register visitor.");
            } else {
                setGlobalError("Network error. Please try again.");
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 pb-24 font-sans">
            <div className="w-full max-w-3xl flex items-center mb-6">
                <button
                    onClick={() => navigate('/guard')}
                    className="flex flex-1 items-center text-gray-900 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-gray-900 py-3 px-4 font-bold uppercase tracking-wider hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:shadow-none transition-all"
                >
                    <ChevronLeft className="w-5 h-5 mr-2" />
                    Back to Terminal
                </button>
            </div>

            <div className="w-full max-w-3xl gate-card shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 md:p-8 bg-white">
                {success && visitorData ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <CheckCircle className="w-20 h-20 mb-4 text-brand-primary" />
                        <h2 className="text-3xl font-display font-black mb-4 text-gray-900 uppercase">Registered!</h2>
                        
                        <div className="w-full max-w-md bg-white border-2 border-gray-900 p-6 mb-6 text-left shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center uppercase tracking-wider border-b-2 border-gray-900 pb-2">
                                <Users className="w-5 h-5 mr-2" />
                                Details
                            </h3>
                            <div className="space-y-3 text-sm font-medium">
                                <p><strong className="uppercase tracking-wider mr-2">Name:</strong> {visitorData.name}</p>
                                <p><strong className="uppercase tracking-wider mr-2">ID:</strong> {visitorData.national_id}</p>
                                <p className="flex items-center"><strong className="uppercase tracking-wider mr-2">Status:</strong> <span className="px-2 py-1 bg-brand-primary text-white text-xs font-bold uppercase tracking-wider">{visitorData.status}</span></p>
                                <p><strong className="uppercase tracking-wider mr-2">Purpose:</strong> {visitorData.purpose_category}</p>
                                <p><strong className="uppercase tracking-wider mr-2">Host:</strong> {visitorData.host_name}</p>
                                {visitorData.department && <p><strong className="uppercase tracking-wider mr-2">Dept:</strong> {visitorData.department}</p>}
                                {visitorData.office_location && <p><strong className="uppercase tracking-wider mr-2">Office:</strong> {visitorData.office_location}</p>}
                                <p><strong className="uppercase tracking-wider mr-2">Duration:</strong> {visitorData.expected_duration} min</p>
                            </div>
                        </div>

                        <div className="w-full max-w-md bg-amber-50 border-2 border-amber-500 p-4 mb-6 shadow-[4px_4px_0px_0px_rgba(245,158,11,1)]">
                            <p className="text-sm font-bold text-amber-900 uppercase tracking-widest leading-relaxed">
                                🔄 Contact {visitorData.host_name} to confirm. Use visitor management to approve the visit once confirmed.
                            </p>
                        </div>
                        
                        <button 
                            onClick={() => navigate('/guard')}
                            className="gate-btn w-full max-w-md shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:shadow-none"
                        >
                            RETURN TO DASHBOARD
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        <input type="hidden" {...register('phone_country')} />
                        <input type="hidden" {...register('host_phone_country')} />
                        <div className="flex flex-col items-center mb-8 border-b-2 border-gray-900 pb-8">
                            <div className="bg-brand-primary p-4 border-2 border-gray-900 mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                <UserPlus className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-3xl font-display font-black text-gray-900 text-center uppercase tracking-tighter">Visitor Registration</h2>
                        </div>

                        {globalError && (
                            <div className="mb-8 p-4 bg-red-50 border-2 border-red-500 flex items-start text-red-700 shadow-[4px_4px_0px_0px_rgba(239,68,68,1)]">
                                <AlertCircle className="w-5 h-5 mr-3 shrink-0" />
                                <span className="block sm:inline font-bold uppercase text-xs tracking-wider">{globalError}</span>
                            </div>
                        )}

                        {/* Visitor Personal Information */}
                        <div className="bg-white border-2 border-gray-900 p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <h3 className="font-bold text-gray-900 mb-6 flex items-center uppercase tracking-wider border-b-2 border-gray-900 pb-2">
                                <Users className="w-5 h-5 mr-2" />
                                Personal Info
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-900 mb-2 uppercase tracking-wider">Full Name *</label>
                                    <input
                                        type="text"
                                        {...register('name')}
                                        placeholder="e.g. Jane Wanjiku"
                                        className="gate-input"
                                    />
                                    {errors.name && <p className="mt-2 text-xs font-bold text-red-600">{errors.name.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-900 mb-2 uppercase tracking-wider">Document Type *</label>
                                    <select
                                        {...register('document_type')}
                                        className="gate-input"
                                    >
                                        {documentTypeOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.document_type && <p className="mt-2 text-xs font-bold text-red-600">{errors.document_type.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-900 mb-2 uppercase tracking-wider">Document Number *</label>
                                    <input
                                        type="text"
                                        {...register('national_id')}
                                        placeholder="Required for entry"
                                        className="gate-input font-mono"
                                    />
                                    {errors.national_id && <p className="mt-2 text-xs font-bold text-red-600">{errors.national_id.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-900 mb-2 uppercase tracking-wider flex items-center">
                                        <Phone className="w-4 h-4 mr-1" />
                                        Phone <span className="text-gray-500 ml-1">(Opt)</span>
                                    </label>
                                    <div className="flex w-full border-2 border-gray-900 group-focus-within:border-brand-primary">
                                        <select 
                                            value={phoneCountry} 
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setPhoneCountry(value);
                                                setValue('phone_country', value, { shouldValidate: true });
                                            }}
                                            className="px-2 py-3 bg-gray-100 text-gray-900 font-bold focus:outline-none border-r-2 border-gray-900"
                                        >
                                            <option value="+254">+254</option>
                                            <option value="+256">+256</option>
                                            <option value="+255">+255</option>
                                            <option value="+1">+1</option>
                                            <option value="+44">+44</option>
                                            <option value="">Other</option>
                                        </select>
                                        <input
                                            type="tel"
                                            {...register('phone')}
                                            placeholder="e.g. 712345678"
                                            className="flex-1 px-4 py-3 focus:outline-none font-bold"
                                        />
                                    </div>
                                    {errors.phone && <p className="mt-2 text-xs font-bold text-red-600">{errors.phone.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-900 mb-2 uppercase tracking-wider flex items-center">
                                        <Mail className="w-4 h-4 mr-1" />
                                        Email <span className="text-gray-500 ml-1">(Opt)</span>
                                    </label>
                                    <input
                                        type="email"
                                        {...register('email')}
                                        placeholder="visitor@example.com"
                                        className="gate-input"
                                    />
                                    {errors.email && <p className="mt-2 text-xs font-bold text-red-600">{errors.email.message}</p>}
                                </div>

                                {!(isStudentVisit || isPersonal) && (
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-gray-900 mb-2 uppercase tracking-wider flex items-center">
                                            <Building2 className="w-4 h-4 mr-1" />
                                            Organization/Company <span className="text-gray-500 ml-1">(Opt)</span>
                                        </label>
                                        <input
                                            type="text"
                                            {...register('organization')}
                                            placeholder="e.g. ABC Company Ltd"
                                            className="gate-input"
                                        />
                                        {errors.organization && <p className="mt-2 text-xs font-bold text-red-600">{errors.organization.message}</p>}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Visit Purpose */}
                        <div className="bg-white border-2 border-gray-900 p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <h3 className="font-bold text-gray-900 mb-6 flex items-center uppercase tracking-wider border-b-2 border-gray-900 pb-2">
                                <FileText className="w-5 h-5 mr-2" />
                                Purpose
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-900 mb-2 uppercase tracking-wider">Category *</label>
                                    <select
                                        {...register('purpose_category')}
                                        className="gate-input"
                                    >
                                        {purposeOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.purpose_category && <p className="mt-2 text-xs font-bold text-red-600">{errors.purpose_category.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-900 mb-2 uppercase tracking-wider flex items-center">
                                        <Clock className="w-4 h-4 mr-1" />
                                        Duration (min) *
                                    </label>
                                    <input
                                        type="number"
                                        {...register('expected_duration', { valueAsNumber: true })}
                                        className="gate-input"
                                    />
                                    {errors.expected_duration && <p className="mt-2 text-xs font-bold text-red-600">{errors.expected_duration.message}</p>}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-gray-900 mb-2 uppercase tracking-wider">Details *</label>
                                    <textarea
                                        {...register('purpose_details')}
                                        rows={3}
                                        placeholder="Brief description of the visit..."
                                        className="gate-input resize-none"
                                    ></textarea>
                                    {errors.purpose_details && <p className="mt-2 text-xs font-bold text-red-600">{errors.purpose_details.message}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Host Information */}
                        <div className="bg-white border-2 border-gray-900 p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <h3 className="font-bold text-gray-900 mb-6 flex items-center uppercase tracking-wider border-b-2 border-gray-900 pb-2">
                                <MapPin className="w-5 h-5 mr-2" />
                                Host & Location
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-900 mb-2 uppercase tracking-wider">
                                        {isStudentVisit ? 'Student Name *' : 'Host Name *'}
                                    </label>
                                    <input
                                        type="text"
                                        {...register('host_name')}
                                        placeholder={isStudentVisit ? "e.g. John Doe (Student)" : "e.g. Dr. John Doe"}
                                        className="gate-input"
                                    />
                                    {errors.host_name && <p className="mt-2 text-xs font-bold text-red-600">{errors.host_name.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-900 mb-2 uppercase tracking-wider">
                                        {isStudentVisit ? 'Student Phone' : 'Host Phone'} <span className="text-gray-500 ml-1">(Opt)</span>
                                    </label>
                                    <div className="flex w-full border-2 border-gray-900 group-focus-within:border-brand-primary">
                                        <select 
                                            value={hostPhoneCountry} 
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setHostPhoneCountry(value);
                                                setValue('host_phone_country', value, { shouldValidate: true });
                                            }}
                                            className="px-2 py-3 bg-gray-100 text-gray-900 font-bold focus:outline-none border-r-2 border-gray-900"
                                        >
                                            <option value="+254">+254</option>
                                            <option value="+256">+256</option>
                                            <option value="+255">+255</option>
                                            <option value="+1">+1</option>
                                            <option value="+44">+44</option>
                                            <option value="">Other</option>
                                        </select>
                                        <input
                                            type="tel"
                                            {...register('host_phone')}
                                            placeholder="Contact no."
                                            className="flex-1 px-4 py-3 focus:outline-none font-bold"
                                        />
                                    </div>
                                    {errors.host_phone && <p className="mt-2 text-xs font-bold text-red-600">{errors.host_phone.message}</p>}
                                </div>

                                {(!isStudentVisit) && (
                                    <div>
                                        <label className="block text-xs font-bold text-gray-900 mb-2 uppercase tracking-wider">Department <span className="text-gray-500 ml-1">(Opt)</span></label>
                                        <input
                                            type="text"
                                            {...register('department')}
                                            placeholder="e.g. Computer Science"
                                            className="gate-input"
                                        />
                                        {errors.department && <p className="mt-2 text-xs font-bold text-red-600">{errors.department.message}</p>}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-bold text-gray-900 mb-2 uppercase tracking-wider">
                                        {isStudentVisit ? 'Hostel / Location' : 'Office Location'} <span className="text-gray-500 ml-1">(Opt)</span>
                                    </label>
                                    <input
                                        type="text"
                                        {...register('office_location')}
                                        placeholder={isStudentVisit ? "e.g. Block A" : "e.g. Block C - Room 205"}
                                        className="gate-input"
                                    />
                                    {errors.office_location && <p className="mt-2 text-xs font-bold text-red-600">{errors.office_location.message}</p>}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-gray-900 mb-2 uppercase tracking-wider">
                                        {isStudentVisit ? 'Student Email' : 'Host Email'} <span className="text-gray-500 ml-1">(Opt)</span>
                                    </label>
                                    <input
                                        type="email"
                                        {...register('host_email')}
                                        placeholder="host@university.edu"
                                        className="gate-input"
                                    />
                                    {errors.host_email && <p className="mt-2 text-xs font-bold text-red-600">{errors.host_email.message}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="gate-btn w-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:shadow-none"
                            >
                                {isSubmitting ? 'PROCESSING...' : 'REGISTER VISITOR'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default VisitorForm;
