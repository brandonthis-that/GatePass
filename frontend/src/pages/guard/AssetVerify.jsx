import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import api from '../../api/axios';
import { X, CheckCircle, XCircle, RotateCcw } from 'lucide-react';

const AssetVerify = () => {
    const [scanResult, setScanResult] = useState(null);
    const [errorStatus, setErrorStatus] = useState(null);
    const [isScanning, setIsScanning] = useState(true);
    const navigate = useNavigate();
    const scannerRef = useRef(null);

    useEffect(() => {
        // Only init if we are actively scanning and the element exists
        if (!isScanning) return;

        let html5QrCode;

        const startScanner = async () => {
            try {
                html5QrCode = new Html5Qrcode("reader");

                await html5QrCode.start(
                    { facingMode: "environment" },
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                        aspectRatio: 1.0
                    },
                    (decodedText) => {
                        // Once we get a scan, stop scanner and verify
                        handleVerification(decodedText);
                    },
                    (errorMessage) => {
                        // parse errors are normal while seeking a barcode, ignore
                    }
                );
                scannerRef.current = html5QrCode;
            } catch (err) {
                console.error("Camera error:", err);
                setErrorStatus("CAMERA_ERROR");
                setIsScanning(false);
            }
        };

        startScanner();

        return () => {
            if (scannerRef.current && scannerRef.current.isScanning) {
                scannerRef.current.stop().catch(console.error);
            }
        };
    }, [isScanning]);

    const stopScannerSafe = async () => {
        if (scannerRef.current && scannerRef.current.isScanning) {
            try {
                await scannerRef.current.stop();
            } catch (e) {
                console.error(e);
            }
        }
    };

    const handleVerification = async (token) => {
        setIsScanning(false);
        await stopScannerSafe();

        // We assume the QR code just holds the UUID token string
        try {
            const resp = await api.get(`/api/assets/verify/${token}/`);
            setScanResult(resp.data.asset);
            // Auto-log the event in gate logs
            await api.post('/api/gate-logs/', {
                log_type: "ASSET_VERIFY",
                asset: resp.data.asset.id,
                notes: "Verified via QR scan"
            });
        } catch (err) {
            console.error(err);
            setErrorStatus("INVALID_TOKEN");
        }
    };

    const handleClose = async () => {
        await stopScannerSafe();
        navigate('/guard');
    };

    const handleReset = () => {
        setScanResult(null);
        setErrorStatus(null);
        setIsScanning(true);
    };

    // --- RENDERING VIEWS ---

    if (errorStatus === "INVALID_TOKEN") {
        return (
            <div className="fixed inset-0 bg-red-600 flex flex-col items-center justify-center p-6 text-white z-50">
                <XCircle className="w-32 h-32 mb-6" />
                <h1 className="text-5xl font-bold mb-4">INVALID</h1>
                <p className="text-xl text-red-200 mb-12 text-center">This QR code is not recognized in the system or has been revoked.</p>

                <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                    <button onClick={handleReset} className="py-4 bg-white text-red-600 rounded-2xl font-bold text-lg flex items-center justify-center">
                        <RotateCcw className="w-6 h-6 mr-2" />
                        Scan Again
                    </button>
                    <button onClick={handleClose} className="py-4 bg-red-800 hover:bg-red-900 rounded-2xl font-bold text-lg flex items-center justify-center">
                        <X className="w-6 h-6 mr-2" />
                        Close
                    </button>
                </div>
            </div>
        );
    }

    if (scanResult) {
        return (
            <div className="fixed inset-0 bg-green-500 flex flex-col items-center justify-center p-6 text-white z-50">
                <CheckCircle className="w-24 h-24 mb-6" />
                <h1 className="text-5xl font-bold mb-2">VALID ASSET</h1>
                <p className="text-xl text-green-100 mb-8 font-medium">Clear to pass</p>

                <div className="bg-white/10 p-6 rounded-2xl w-full max-w-md shadow-lg backdrop-blur-md mb-8 border border-white/20">
                    <div className="text-xl font-bold mb-1">{scanResult.asset_type}</div>
                    <div className="text-green-100 mb-4">{scanResult.model_name}</div>

                    <div className="border-t border-white/20 pt-4 mt-4">
                        <div className="text-sm text-green-200 uppercase tracking-wide text-xs">Owner</div>
                        <div className="text-2xl font-semibold">{scanResult.owner_name}</div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                    <button onClick={handleReset} className="py-4 bg-white text-green-600 rounded-2xl font-bold text-lg flex items-center justify-center">
                        <RotateCcw className="w-6 h-6 mr-2" />
                        Next Scan
                    </button>
                    <button onClick={handleClose} className="py-4 bg-green-700 hover:bg-green-800 rounded-2xl font-bold text-lg flex items-center justify-center cursor-pointer">
                        <X className="w-6 h-6 mr-2" />
                        Close
                    </button>
                </div>
            </div>
        );
    }

    // Active Scanner View
    return (
        <div className="fixed inset-0 bg-black flex flex-col z-50">
            <div className="flex justify-between items-center p-4 bg-black/50 absolute top-0 w-full z-10">
                <h2 className="text-white font-bold text-xl">Scan Asset QR</h2>
                <button onClick={handleClose} className="bg-white/10 p-3 rounded-full text-white">
                    <X className="w-6 h-6" />
                </button>
            </div>

            <div className="flex-1 flex flex-col relative bg-black">
                {errorStatus === "CAMERA_ERROR" ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-white p-6 text-center">
                        <XCircle className="w-16 h-16 text-red-500 mb-4" />
                        <h3 className="text-xl font-bold mb-2">Camera Access Denied</h3>
                        <p className="text-gray-400">Please grant camera permissions to use the scanner.</p>
                    </div>
                ) : (
                    <div id="reader" className="flex-1 w-full bg-black"></div>
                )}
            </div>

            <div className="p-6 bg-gray-900 border-t border-gray-800 pb-safe">
                <p className="text-center text-gray-400 text-sm">Align the QR code within the frame to verify.</p>
            </div>
        </div>
    );
};

export default AssetVerify;
