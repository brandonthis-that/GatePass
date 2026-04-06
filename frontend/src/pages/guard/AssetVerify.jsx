import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import api from '../../api/axios';
import { X, CheckCircle, XCircle, RotateCcw } from 'lucide-react';

const VIEWS = {
    SCANNING: 'SCANNING',
    SUCCESS: 'SUCCESS',
    INVALID: 'INVALID',
    CAM_ERROR: 'CAM_ERROR',
};

const AssetVerify = () => {
    const [view, setView] = useState(VIEWS.SCANNING);
    const [scanResult, setScanResult] = useState(null);
    const navigate = useNavigate();

    // Refs — never cause re-renders, safe to use inside callbacks
    const scannerRef    = useRef(null);
    const isStartedRef  = useRef(false); // guard against double-start
    const isHandledRef  = useRef(false); // guard against processing two scans

    // ── Stop scanner ─────────────────────────────────────────────────────────
    const stopScanner = useCallback(async () => {
        if (scannerRef.current && isStartedRef.current) {
            try { await scannerRef.current.stop(); } catch { /* already stopped */ }
            isStartedRef.current = false;
        }
    }, []);

    // ── Verify scanned token against backend ─────────────────────────────────
    // Defined as useCallback BEFORE startScanner so it can be referenced safely.
    const handleVerification = useCallback(async (token) => {
        await stopScanner();

        // The QR image encodes the raw UUID token.
        // Backend expects: GET /api/assets/verify/?token=<uuid>
        try {
            const resp = await api.get('/api/assets/verify/', { params: { token } });
            setScanResult(resp.data.asset);

            await api.post('/api/gate-logs/', {
                log_type: 'ASSET_VERIFY',
                asset: resp.data.asset.id,
                notes: 'Verified via QR scan',
            });

            setView(VIEWS.SUCCESS);
        } catch (err) {
            console.error('Verification error:', err);
            setView(VIEWS.INVALID);
        }
    }, [stopScanner]);

    // ── Start scanner ─────────────────────────────────────────────────────────
    const startScanner = useCallback(async () => {
        // Prevent double-start (React StrictMode double-invokes effects in dev)
        if (isStartedRef.current) return;

        const el = document.getElementById('qr-reader');
        if (!el) return;

        try {
            const scanner = new Html5Qrcode('qr-reader');
            scannerRef.current  = scanner;
            isStartedRef.current  = true;
            isHandledRef.current  = false;

            await scanner.start(
                { facingMode: 'environment' },
                { fps: 10, qrbox: { width: 250, height: 250 } },
                (decodedText) => {
                    if (isHandledRef.current) return;
                    isHandledRef.current = true;
                    handleVerification(decodedText);
                },
                () => { /* decode errors while seeking are expected — ignore */ }
            );
        } catch (err) {
            console.error('Camera start failed:', err);
            isStartedRef.current = false;
            setView(VIEWS.CAM_ERROR);
        }
    }, [handleVerification]);

    // ── Scanner lifecycle: start when entering SCANNING, stop on leave ────────
    useEffect(() => {
        if (view !== VIEWS.SCANNING) return;

        const timer = setTimeout(startScanner, 150);

        return () => {
            clearTimeout(timer);
            stopScanner();
        };
    }, [view, startScanner, stopScanner]);

    // ── Misc handlers ─────────────────────────────────────────────────────────
    const handleClose = useCallback(async () => {
        await stopScanner();
        navigate('/guard');
    }, [stopScanner, navigate]);

    const handleReset = useCallback(() => {
        setScanResult(null);
        setView(VIEWS.SCANNING);
    }, []);

    const handleGrantPermission = useCallback(async () => {
        if (!navigator.mediaDevices?.getUserMedia) {
            alert('Camera API unavailable. Ensure you are accessing over HTTPS.');
            return;
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            stream.getTracks().forEach(t => t.stop());
            setView(VIEWS.SCANNING);
        } catch (err) {
            console.error('Permission denied:', err);
            alert('Camera access was denied. Please allow it in your browser settings.');
        }
    }, []);

    // ── Render ────────────────────────────────────────────────────────────────
    // IMPORTANT: the #qr-reader div must ALWAYS be in the DOM so Html5Qrcode
    // can find it. Overlays are stacked on top via absolute positioning.
    return (
        <div className="fixed inset-0 bg-black flex flex-col z-50">

            {/* Header */}
            <div className="flex justify-between items-center p-4 bg-black/60 z-10">
                <h2 className="text-white font-bold text-xl">Scan Asset QR</h2>
                <button onClick={handleClose} className="bg-white/10 p-3 rounded-full text-white">
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* Camera area + overlays */}
            <div className="flex-1 relative bg-black overflow-hidden">

                {/* Scanner div — always mounted, hidden when not scanning */}
                <div
                    id="qr-reader"
                    className="absolute inset-0 w-full h-full"
                    style={{ visibility: view === VIEWS.SCANNING ? 'visible' : 'hidden' }}
                />

                {/* SUCCESS */}
                {view === VIEWS.SUCCESS && (
                    <div className="absolute inset-0 bg-green-500 flex flex-col items-center justify-center p-6 text-white">
                        <CheckCircle className="w-24 h-24 mb-6" />
                        <h1 className="text-5xl font-bold mb-2">VALID ASSET</h1>
                        <p className="text-xl text-green-100 mb-8 font-medium">Clear to pass</p>

                        <div className="bg-white/10 p-6 rounded-2xl w-full max-w-md shadow-lg backdrop-blur-md mb-8 border border-white/20">
                            <div className="text-xl font-bold mb-1">{scanResult?.asset_type}</div>
                            <div className="text-green-100 mb-4">{scanResult?.model_name}</div>
                            <div className="border-t border-white/20 pt-4 mt-4">
                                <div className="text-xs text-green-200 uppercase tracking-wide mb-1">Owner</div>
                                <div className="text-2xl font-semibold">{scanResult?.owner_name}</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                            <button onClick={handleReset} className="py-4 bg-white text-green-600 rounded-2xl font-bold text-lg flex items-center justify-center">
                                <RotateCcw className="w-6 h-6 mr-2" /> Next Scan
                            </button>
                            <button onClick={handleClose} className="py-4 bg-green-700 hover:bg-green-800 rounded-2xl font-bold text-lg flex items-center justify-center">
                                <X className="w-6 h-6 mr-2" /> Close
                            </button>
                        </div>
                    </div>
                )}

                {/* INVALID */}
                {view === VIEWS.INVALID && (
                    <div className="absolute inset-0 bg-red-600 flex flex-col items-center justify-center p-6 text-white">
                        <XCircle className="w-32 h-32 mb-6" />
                        <h1 className="text-5xl font-bold mb-4">INVALID</h1>
                        <p className="text-xl text-red-200 mb-12 text-center">
                            This QR code is not recognized in the system or has been revoked.
                        </p>

                        <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                            <button onClick={handleReset} className="py-4 bg-white text-red-600 rounded-2xl font-bold text-lg flex items-center justify-center">
                                <RotateCcw className="w-6 h-6 mr-2" /> Scan Again
                            </button>
                            <button onClick={handleClose} className="py-4 bg-red-800 hover:bg-red-900 rounded-2xl font-bold text-lg flex items-center justify-center">
                                <X className="w-6 h-6 mr-2" /> Close
                            </button>
                        </div>
                    </div>
                )}

                {/* CAMERA ERROR */}
                {view === VIEWS.CAM_ERROR && (
                    <div className="absolute inset-0 bg-black flex flex-col items-center justify-center p-6 text-white text-center">
                        <XCircle className="w-16 h-16 text-red-500 mb-4" />
                        <h3 className="text-xl font-bold mb-2">Camera Access Required</h3>
                        <p className="text-gray-400 mb-6">Camera permission is needed to scan QR codes.</p>
                        <button
                            onClick={handleGrantPermission}
                            className="py-3 px-8 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold text-white transition-colors"
                        >
                            Grant Permission
                        </button>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-900 border-t border-gray-800">
                <p className="text-center text-gray-400 text-sm">Align the QR code within the frame to verify.</p>
            </div>
        </div>
    );
};

export default AssetVerify;
