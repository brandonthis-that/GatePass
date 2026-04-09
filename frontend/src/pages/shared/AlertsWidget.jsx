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
        <div className="w-full space-y-3 mb-6">
            <h3 className="text-sm font-bold text-red-800 uppercase tracking-wider flex items-center px-1">
                <AlertCircle className="w-4 h-4 mr-1" /> Active Alerts
            </h3>
            {alerts.map((alertMsg, idx) => (
                <div key={idx} className="flex items-start p-4 bg-red-50 border border-red-200 rounded-2xl shadow-sm text-red-800 animate-in slide-in-from-top-2">
                    <div className="flex-1 text-sm font-medium leading-tight">
                        {alertMsg}
                    </div>
                    <button 
                        onClick={() => setAlerts(prev => prev.filter((_, i) => i !== idx))}
                        className="ml-3 p-1 hover:bg-red-100 rounded-lg transition-colors text-red-500"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>
    );
};

export default AlertsWidget;
