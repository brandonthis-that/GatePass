import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import PageLayout from '../shared/PageLayout';
import { ChevronLeft, Printer, Download } from 'lucide-react';

const AssetDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [asset, setAsset] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAsset = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/api/assets/${id}/`);
                setAsset(res.data);
            } catch (err) {
                console.error(err);
                setError("Failed to load asset details. It may have been deleted.");
            } finally {
                setLoading(false);
            }
        };

        fetchAsset();
    }, [id]);

    const handlePrint = () => {
        // Change document title temporarily so if the user "Saves as PDF", it names it correctly
        const oldTitle = document.title;
        const safeOwner = asset.owner_name ? asset.owner_name.replace(/[^a-zA-Z0-9]/g, '_') : 'Student';
        const safeAsset = asset.asset_type ? asset.asset_type.replace(/[^a-zA-Z0-9]/g, '_') : 'Asset';
        document.title = `${safeOwner}_${safeAsset}_QR`;
        window.print();
        document.title = oldTitle;
    };

    const handleDownload = async () => {
        try {
            // Attempt to fetch via proxy (relative path) to avoid CORS cross-origin blocks when converting to blob
            const urlToFetch = asset.qr_code.startsWith('http') ? new URL(asset.qr_code).pathname : asset.qr_code;
            const response = await fetch(urlToFetch);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = blobUrl;
            
            const safeOwner = asset.owner_name ? asset.owner_name.replace(/[^a-zA-Z0-9]/g, '_') : 'Student';
            const safeAsset = asset.asset_type ? asset.asset_type.replace(/[^a-zA-Z0-9]/g, '_') : 'Asset';
            a.download = `${safeOwner}_${safeAsset}_QR.png`;
            
            document.body.appendChild(a);
            a.click();
            
            window.URL.revokeObjectURL(blobUrl);
            document.body.removeChild(a);
        } catch (err) {
            console.error("Download fetch failed, falling back to basic href:", err);
            // Fallback that might just open the image depending on browser security rules
            const a = document.createElement('a');
            const safeOwner = asset.owner_name ? asset.owner_name.replace(/[^a-zA-Z0-9]/g, '_') : 'Student';
            const safeAsset = asset.asset_type ? asset.asset_type.replace(/[^a-zA-Z0-9]/g, '_') : 'Asset';
            a.href = asset.qr_code.startsWith('http') ? asset.qr_code : `${api.defaults.baseURL}${asset.qr_code}`;
            a.download = `${safeOwner}_${safeAsset}_QR.png`;
            a.target = "_blank";
            a.click();
        }
    };

    if (loading) {
        return (
            <PageLayout>
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </PageLayout>
        );
    }

    if (error || !asset) {
        return (
            <PageLayout>
                <button
                    onClick={() => navigate('/student')}
                    className="flex items-center text-sm text-gray-500 hover:text-gray-800 mb-6"
                >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back to Dashboard
                </button>
                <div className="p-4 rounded-lg bg-red-50 border-l-4 border-red-500 text-red-700">
                    {error}
                </div>
            </PageLayout>
        );
    }

    // Handle absolute media URLs if needed, but our API setup might return a relative or absolute path 
    // depending on Django settings. We will trust the API or prepend the backend URL if relative.
    const qrUrl = asset.qr_code.startsWith('http')
        ? asset.qr_code
        : `${api.defaults.baseURL}${asset.qr_code}`;

    return (
        <PageLayout title="Asset QR Code">
            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #printable-qr-section, #printable-qr-section * {
                        visibility: visible;
                    }
                    #printable-qr-section {
                        position: absolute;
                        left: 50%;
                        top: 50%;
                        transform: translate(-50%, -100px);
                        margin: 0;
                        padding: 0;
                        text-align: center;
                        width: 100%;
                    }
                }
            `}</style>
            <div className="print:hidden">
                <button
                    onClick={() => navigate('/student')}
                    className="flex items-center text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
                >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back to Dashboard
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 max-w-xl mx-auto text-center">
                
                <div id="printable-qr-section">
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">{asset.asset_type} GatePass</h2>
                    <p className="text-gray-500 mb-8">{asset.model_name}</p>

                    <div className="bg-gray-50 p-6 rounded-2xl border-2 border-dashed border-gray-300 inline-block mb-8">
                        <img
                            src={qrUrl}
                            alt={`QR Code for ${asset.model_name}`}
                            className="w-64 h-64 object-contain mx-auto mix-blend-multiply"
                            crossOrigin="anonymous" 
                        />
                    </div>
                </div>

                <div className="text-left bg-blue-50 p-4 rounded-lg mb-8">
                    <h3 className="font-semibold text-blue-900 mb-2">Instructions for Students</h3>
                    <ul className="list-disc pl-5 text-sm text-blue-800 space-y-1">
                        <li>Print and attach this QR code to your device.</li>
                        <li>Guards must scan this code EVERY TIME you exit or enter campus with the device.</li>
                        <li>Do not share this QR code. It is tied to your student account.</li>
                    </ul>
                </div>

                <div className="grid grid-cols-2 gap-4 text-left border-t border-gray-100 pt-6">
                    <div>
                        <span className="block text-xs text-gray-500 uppercase font-semibold tracking-wider">Serial Number</span>
                        <span className="font-mono text-gray-900">{asset.serial_number}</span>
                    </div>
                    <div>
                        <span className="block text-xs text-gray-500 uppercase font-semibold tracking-wider">Registered</span>
                        <span className="text-gray-900">
                            {new Date(asset.registered_at).toLocaleDateString()}
                        </span>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 print:hidden grid grid-cols-2 gap-4">
                    <button
                        onClick={handleDownload}
                        className="w-full flex items-center justify-center py-3 px-4 border-2 border-blue-600 rounded-lg shadow-sm text-lg font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                        <Download className="w-5 h-5 mr-2" />
                        Download
                    </button>
                    <button
                        onClick={handlePrint}
                        className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                    >
                        <Printer className="w-5 h-5 mr-2" />
                        Print QR Code
                    </button>
                </div>

            </div>
        </PageLayout>
    );
};

export default AssetDetail;
