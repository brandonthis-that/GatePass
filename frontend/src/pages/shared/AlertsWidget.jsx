import React, { useState, useEffect } from 'react';
import { AlertCircle, X } from 'lucide-react';
import api from '../../api/axios';

const AlertsWidget = () => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const response = await api.get('/api/visitors/alerts/');
                setAlerts(response.data.alerts || []);
            } catch (err) {
                console.error("Failed to fetch alerts", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAlerts();
        
        // Auto-refresh every 60 seconds
        const interval = setInterval(fetchAlerts, 60000);
        return () => clearInterval(interval);
    }, []);

    if (loading || alerts.length === 0) return null;

    return (
        <div className="w-full space-y-4 mb-8">
            <h3 className="text-xs font-black font-display text-gray-900 uppercase tracking-widest flex items-center px-1">
                <AlertCircle className="w-4 h-4 mr-2 text-brand-primary" /> Active Alerts
            </h3>
            {alerts.map((alertMsg, idx) => (
                <div key={idx} className="flex items-start p-4 bg-white border-2 border-brand-primary text-brand-primary shadow-[4px_4px_0px_0px_var(--color-brand-primary)] animate-in slide-in-from-top-2">
                    <div className="flex-1 text-xs uppercase tracking-wider font-bold leading-tight">
                        {alertMsg}
                    </div>
                    <button 
                        onClick={() => setAlerts(prev => prev.filter((_, i) => i !== idx))}
                        className="ml-3 p-1 hover:bg-brand-50 border-2 border-transparent hover:border-brand-primary transition-all text-brand-primary"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>
    );
};

export default AlertsWidget;
