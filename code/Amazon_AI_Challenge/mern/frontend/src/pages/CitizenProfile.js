import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const CustomerProfile = () => {
    const { user, token, updatePhone } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [warranties, setWarranties] = useState([]);
    const [transcripts, setTranscripts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState(user?.phone || '');

    useEffect(() => {
        const fetchData = async () => {
            if (!user?.phone) {
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const headers = { 'Authorization': `Bearer ${token}` };
                const baseUrl = process.env.REACT_APP_BACKEND_URL;
                const [apptRes, warrRes, transRes] = await Promise.all([
                    fetch(`${baseUrl}/api/appointments/phone/${user.phone}`, { headers }),
                    fetch(`${baseUrl}/api/warranties/phone/${user.phone}`, { headers }),
                    fetch(`${baseUrl}/api/transcripts`, { headers })
                ]);

                if (apptRes.ok) setAppointments(await apptRes.json());
                if (warrRes.ok) {
                    const warrData = await warrRes.json();
                    // Handle both array response and object with warranties property
                    setWarranties(Array.isArray(warrData) ? warrData : warrData.warranties || []);
                }
                if (transRes.ok) setTranscripts(await transRes.json());
            } catch (err) {
                console.error('Error fetching profile data:', err);
            }
            setLoading(false);
        };

        if (user && token) {
            setName(user.name);
            setEmail(user.email);
            setPhone(user.phone);
            fetchData();
        } else {
            setLoading(false);
        }
    }, [user, token]);

    const handleSaveChanges = async (e) => {
        e.preventDefault();
        console.log('Updated info:', { name, email, phone });
        if (phone !== user.phone) {
            const result = await updatePhone(phone);
            if (result.success) {
                alert('Phone number updated successfully!');
                // Refresh the page data
                window.location.reload();
            } else {
                alert('Failed to update phone number. Please try again.');
            }
        }
    };

    if (loading) {
        return <div className="text-center py-8">Loading profile...</div>;
    }

    const upcomingAppointment = appointments.find(a => new Date(a.appointment_date) >= new Date());

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-text-light dark:text-text-dark min-h-screen flex flex-col selection:bg-primary selection:text-black">
            <main className="flex-grow w-full max-w-[1280px] mx-auto px-6 py-8 md:py-12 flex flex-col gap-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">My Profile</h1>
                        <p className="text-[#5c5b4f] dark:text-[#cbcb9c] mt-2">Manage your personal details, applications, and scheme benefits.</p>
                    </div>
                    <div className="flex gap-3"><button className="px-5 py-2.5 rounded-full border border-[#e6e6db] dark:border-[#3a3928] bg-surface-light dark:bg-surface-dark font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Sign Out</button></div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-4 flex flex-col gap-6 sticky top-24">
                        <div className="p-6 md:p-8 rounded-xl bg-surface-light dark:bg-surface-dark border border-[#e6e6db] dark:border-[#3a3928] shadow-sm">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="relative">
                                    <div className="size-16 rounded-full bg-primary flex items-center justify-center text-2xl font-bold text-black border-4 border-white dark:border-[#2c2b18]">{user?.name.split(' ').map(n => n[0]).join('')}</div>
                                    <div className="absolute bottom-0 right-0 p-1 bg-green-500 border-2 border-white dark:border-[#2c2b18] rounded-full"></div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold">{user?.name}</h3>
                                    <p className="text-xs text-[#5c5b4f] dark:text-[#cbcb9c]">Member since {new Date(user?.date_created).getFullYear()}</p>
                                </div>
                            </div>
                            <form onSubmit={handleSaveChanges} className="flex flex-col gap-4">
                                <div>
                                    <label className="block text-xs font-semibold uppercase text-[#8c8b5f] mb-1.5" htmlFor="full-name">Full Name</label>
                                    <input className="w-full rounded-lg bg-[#f8f8f5] dark:bg-[#23220f] border-[#e6e6db] dark:border-[#3a3928] text-sm focus:border-primary focus:ring-primary" id="full-name" type="text" value={name} onChange={e => setName(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase text-[#8c8b5f] mb-1.5" htmlFor="email">Email Address</label>
                                    <input className="w-full pl-10 rounded-lg bg-[#f8f8f5] dark:bg-[#23220f] border-[#e6e6db] dark:border-[#3a3928] text-sm focus:border-primary focus:ring-primary" id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase text-[#8c8b5f] mb-1.5" htmlFor="phone">Phone Number</label>
                                    <input className="w-full pl-10 rounded-lg bg-[#f8f8f5] dark:bg-[#23220f] border-[#e6e6db] dark:border-[#3a3928] text-sm focus:border-primary focus:ring-primary" id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
                                </div>
                                <div className="pt-2"><button className="w-full py-3 rounded-lg bg-black dark:bg-white text-white dark:text-black font-bold text-sm hover:opacity-90 transition-opacity" type="submit">Save Changes</button></div>
                            </form>
                        </div>
                    </div>
                    <div className="lg:col-span-8 flex flex-col gap-8">
                        {upcomingAppointment && (
                            <section>
                                <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><span className="material-symbols-outlined">calendar_clock</span>Upcoming Consultations</h3>
                                <div className="flex flex-col md:flex-row gap-4 p-5 rounded-xl bg-yellow-50 dark:bg-yellow-900/10 border border-primary/30 relative overflow-hidden">
                                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary"></div>
                                    <div className="flex-shrink-0 bg-primary/20 rounded-lg p-3 flex flex-col items-center justify-center min-w-[80px]">
                                        <span className="text-xs font-bold uppercase tracking-wider">{new Date(upcomingAppointment.appointment_date).toLocaleString('default', { month: 'short' })}</span>
                                        <span className="text-2xl font-bold text-black dark:text-white">{new Date(upcomingAppointment.appointment_date).getDate()}</span>
                                    </div>
                                    <div className="flex-grow flex flex-col justify-center">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-bold text-lg">{upcomingAppointment.service_type || 'Scheme Consultation'}</h4>
                                            <span className="px-2 py-0.5 text-[10px] font-bold bg-green-100 text-green-700 rounded-full uppercase tracking-wide">Confirmed</span>
                                        </div>
                                        <p className="text-sm text-[#5c5b4f] dark:text-[#cbcb9c] mb-2">{upcomingAppointment.location || 'Scheme Saarthi Center - District Office'}</p>
                                        <p className="text-sm">Scheme: {upcomingAppointment.product_name} • Query: {upcomingAppointment.issue_description}</p>
                                    </div>
                                </div>
                            </section>
                        )}
                        <section>
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><span className="material-symbols-outlined">description</span>My Applications</h3>
                            {warranties.length === 0 ? (
                                <div className="p-8 rounded-xl bg-surface-light dark:bg-surface-dark border border-[#e6e6db] dark:border-[#3a3928] text-center">
                                    <p className="text-[#5c5b4f] dark:text-[#cbcb9c]">No applications submitted yet</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {warranties.map(warranty => {
                                        const getDeviceIcon = (category) => {
                                            const icons = {
                                                'laptop': 'laptop_mac',
                                                'smartphone': 'smartphone',
                                                'television': 'tv',
                                                'refrigerator': 'kitchen',
                                                'washing machine': 'local_laundry_service',
                                                'air conditioner': 'ac_unit',
                                                'audio': 'headphones',
                                                'tablet': 'tablet',
                                                'default': 'devices'
                                            };
                                            return icons[category?.toLowerCase()] || icons.default;
                                        };

                                        const isActive = new Date(warranty.warranty_expiry) > new Date();
                                        
                                        return (
                                            <div key={warranty._id} className="p-5 rounded-xl bg-surface-light dark:bg-surface-dark border border-[#e6e6db] dark:border-[#3a3928] group hover:border-primary transition-colors">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                                        <span className="material-symbols-outlined text-2xl">
                                                            {getDeviceIcon(warranty.product_category)}
                                                        </span>
                                                    </div>
                                                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                                                        {isActive ? 'WARRANTY ACTIVE' : 'EXPIRED'}
                                                    </span>
                                                </div>
                                                <h4 className="font-bold text-lg">{warranty.product_name}</h4>
                                                <p className="text-xs text-[#5c5b4f] dark:text-[#cbcb9c] mb-2 capitalize">{warranty.product_category}</p>
                                                <p className="text-xs text-[#5c5b4f] dark:text-[#cbcb9c]">
                                                    Expires: {new Date(warranty.warranty_expiry).toLocaleDateString()}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </section>
                        <section>
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><span className="material-symbols-outlined">history</span>Support History</h3>
                            <div className="bg-surface-light dark:bg-surface-dark border border-[#e6e6db] dark:border-[#3a3928] rounded-xl overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-[#f8f8f5] dark:bg-[#23220f] border-b border-[#e6e6db] dark:border-[#3a3928]">
                                            <tr>
                                                <th className="px-6 py-4 font-semibold text-[#8c8b5f]">Date</th>
                                                <th className="px-6 py-4 font-semibold text-[#8c8b5f]">Issue Summary</th>
                                                <th className="px-6 py-4 font-semibold text-[#8c8b5f]">Agent</th>
                                                <th className="px-6 py-4 font-semibold text-[#8c8b5f]">Status</th>
                                                <th className="px-6 py-4 font-semibold text-[#8c8b5f]">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#e6e6db] dark:divide-[#3a3928]">
                                            {transcripts.slice(0, 3).map(t => (
                                                <tr key={t._id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">{new Date(t.timestamp).toLocaleDateString()}</td>
                                                    <td className="px-6 py-4">{t.issue_summary}</td>
                                                    <td className="px-6 py-4 flex items-center gap-2"><span className="material-symbols-outlined text-sm text-primary">{t.agent_type === 'AI' ? 'smart_toy' : 'person'}</span><span>{t.agent_name}</span></td>
                                                    <td className="px-6 py-4"><span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">Resolved</span></td>
                                                    <td className="px-6 py-4"><a className="text-primary hover:text-yellow-600 font-bold text-xs flex items-center gap-1" href="#">View Transcript<span className="material-symbols-outlined text-xs">open_in_new</span></a></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CustomerProfile;
