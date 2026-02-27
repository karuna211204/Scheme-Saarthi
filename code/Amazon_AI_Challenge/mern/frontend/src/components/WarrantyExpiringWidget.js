import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const WarrantyExpiringWidget = ({ days = 30 }) => {
    const { token } = useAuth();
    const [expiringWarranties, setExpiringWarranties] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchExpiringWarranties = async () => {
            setLoading(true);
            try {
                const headers = { 'Authorization': `Bearer ${token}` };
                const baseUrl = process.env.REACT_APP_BACKEND_URL;
                const response = await fetch(`${baseUrl}/api/warranties/expiring/${days}`, { headers });
                
                if (response.ok) {
                    const data = await response.json();
                    setExpiringWarranties(data);
                }
            } catch (err) {
                console.error('Error fetching expiring warranties:', err);
            }
            setLoading(false);
        };

        if (token) {
            fetchExpiringWarranties();
        }
    }, [token, days]);

    if (loading) {
        return (
            <div className="bg-surface-light dark:bg-surface-dark border border-[#e6e6db] dark:border-[#3a3928] rounded-xl p-6">
                <p className="text-center text-[#8c8b5f]">Loading...</p>
            </div>
        );
    }

    return (
        <div className="bg-surface-light dark:bg-surface-dark border border-[#e6e6db] dark:border-[#3a3928] rounded-xl overflow-hidden">
            <div className="p-4 border-b border-[#e6e6db] dark:border-[#3a3928] bg-orange-50 dark:bg-orange-900/20">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-orange-600 dark:text-orange-400">warning</span>
                    <h3 className="font-bold text-sm">Expiring Soon ({expiringWarranties.length})</h3>
                </div>
                <p className="text-xs text-[#8c8b5f] mt-1">Warranties expiring in next {days} days</p>
            </div>
            
            <div className="max-h-80 overflow-y-auto">
                {expiringWarranties.length === 0 ? (
                    <div className="p-6 text-center text-[#8c8b5f]">
                        <span className="material-symbols-outlined text-4xl opacity-30 mb-2">check_circle</span>
                        <p className="text-sm">No warranties expiring soon</p>
                    </div>
                ) : (
                    <div className="divide-y divide-[#e6e6db] dark:divide-[#3a3928]">
                        {expiringWarranties.map(warranty => (
                            <div key={warranty._id} className="p-4 hover:bg-[#f8f8f5] dark:hover:bg-[#3a3928]/30 transition-colors">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <p className="font-semibold text-sm">{warranty.product_name}</p>
                                        <p className="text-xs text-[#8c8b5f]">S/N: {warranty.serial_number}</p>
                                    </div>
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                                        warranty.days_left <= 7 
                                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' 
                                            : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                                    }`}>
                                        {warranty.days_left} days
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-[#8c8b5f]">
                                    <span className="material-symbols-outlined text-sm">call</span>
                                    {warranty.phone}
                                </div>
                                <div className="mt-2 pt-2 border-t border-[#e6e6db] dark:border-[#3a3928]">
                                    <p className="text-xs text-[#8c8b5f]">
                                        Expires: {new Date(warranty.warranty_expiry).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {expiringWarranties.length > 0 && (
                <div className="p-3 border-t border-[#e6e6db] dark:border-[#3a3928] bg-[#f8f8f5] dark:bg-[#23220f]">
                    <button className="w-full text-xs font-bold text-primary hover:text-yellow-600 transition-colors flex items-center justify-center gap-1">
                        Contact All Customers
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default WarrantyExpiringWidget;
