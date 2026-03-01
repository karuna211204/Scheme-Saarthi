import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import AppointmentBookingModal from '../components/AppointmentBookingModal';

const Appointments = () => {
    const { token } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [appointmentsPerPage] = useState(5);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [agentFilter, setAgentFilter] = useState('all');

    useEffect(() => {
        if(token) {
            fetchAppointments();
        }
    }, [token]);

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const headers = { 'Authorization': `Bearer ${token}` };
            const baseUrl = process.env.REACT_APP_BACKEND_URL;
            const response = await fetch(`${baseUrl}/api/appointments`, { headers });
            if (response.ok) {
                setAppointments(await response.json());
            }
        } catch (err) {
            console.error('Error fetching appointments:', err);
        }
        setLoading(false);
    };

    const handleExport = async () => {
        try {
            const headers = { 'Authorization': `Bearer ${token}` };
            const baseUrl = process.env.REACT_APP_BACKEND_URL;
            const response = await fetch(`${baseUrl}/api/export/appointments`, { headers });
            
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `appointments_${Date.now()}.csv`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }
        } catch (err) {
            console.error('Error exporting appointments:', err);
            alert('Failed to export appointments');
        }
    };

    // Filter appointments based on search and filters
    const filteredAppointments = appointments.filter(appt => {
        const matchesSearch = searchTerm === '' ||
            appt.citizen_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            appt.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            appt.issue_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            appt._id?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || appt.status?.toLowerCase() === statusFilter.toLowerCase();
        const matchesAgent = agentFilter === 'all' || 
            (agentFilter === 'ai' && appt.assigned_agent_type === 'AI') ||
            (agentFilter === 'human' && appt.assigned_agent_type !== 'AI');
        
        return matchesSearch && matchesStatus && matchesAgent;
    });

    // Pagination logic
    const indexOfLastAppointment = currentPage * appointmentsPerPage;
    const indexOfFirstAppointment = indexOfLastAppointment - appointmentsPerPage;
    const currentAppointments = filteredAppointments.slice(indexOfFirstAppointment, indexOfLastAppointment);

    const paginate = (pageNumber) => {
        const totalPages = Math.ceil(filteredAppointments.length / appointmentsPerPage);
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    }

    const upcomingAppointments = appointments.filter(a => new Date(a.appointment_date) >= new Date()).length;
    const pendingAppointments = appointments.filter(a => a.status === 'scheduled').length;

    if (loading) {
        return <div className="text-center py-8 text-gray-500">Loading appointments...</div>;
    }

    const getStatusChip = (status) => {
        switch (status.toLowerCase()) {
            case 'in progress':
                return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>In Progress</span>;
            case 'scheduled':
                return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800"><span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>Scheduled</span>;
            case 'pending':
                return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700"><span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>Pending</span>;
            case 'completed':
                return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>Completed</span>;
            case 'escalated':
                 return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>Escalated</span>;
            default:
                return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700">{status}</span>;
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-text-light dark:text-text-dark min-h-screen flex flex-col selection:bg-primary selection:text-black">
            <main className="flex-grow w-full max-w-[1440px] mx-auto px-4 md:px-6 py-8 flex flex-col gap-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Appointments Tracking</h1>
                        <p className="text-[#5c5b4f] dark:text-[#cbcb9c] text-sm max-w-xl">
                            Manage scheduled repairs, assign agents, and track service status in real-time.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={handleExport}
                            className="px-5 py-2.5 rounded-full border border-[#e6e6db] dark:border-[#3a3928] bg-surface-light dark:bg-surface-dark hover:bg-gray-50 dark:hover:bg-white/5 text-sm font-semibold transition-colors flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[18px]">download</span>
                            Export List
                        </button>
                        <button 
                            onClick={() => setShowBookingModal(true)}
                            className="px-5 py-2.5 rounded-full bg-primary hover:bg-yellow-300 text-black text-sm font-bold shadow-sm hover:shadow-md transition-all flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[18px]">add</span>
                            New Appointment
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    <div className="p-6 rounded-xl bg-surface-light dark:bg-surface-dark border border-[#e6e6db] dark:border-[#3a3928] shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-[#5c5b4f] dark:text-[#cbcb9c] uppercase tracking-wider">Upcoming</p>
                            <h3 className="text-3xl font-bold mt-1">{upcomingAppointments}</h3>
                        </div>
                        <div className="size-12 rounded-full bg-primary/20 flex items-center justify-center text-black dark:text-primary">
                            <span className="material-symbols-outlined">calendar_month</span>
                        </div>
                    </div>
                    <div className="p-6 rounded-xl bg-surface-light dark:bg-surface-dark border border-[#e6e6db] dark:border-[#3a3928] shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-[#5c5b4f] dark:text-[#cbcb9c] uppercase tracking-wider">Pending Action</p>
                            <h3 className="text-3xl font-bold mt-1">{pendingAppointments}</h3>
                        </div>
                        <div className="size-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                            <span className="material-symbols-outlined">pending_actions</span>
                        </div>
                    </div>
                    <div className="p-6 rounded-xl bg-surface-light dark:bg-surface-dark border border-[#e6e6db] dark:border-[#3a3928] shadow-sm flex items-center justify-between">
                         <div>
                            <p className="text-sm font-medium text-[#5c5b4f] dark:text-[#cbcb9c] uppercase tracking-wider">Active Agents</p>
                            <h3 className="text-3xl font-bold mt-1">8<span className="text-base font-normal text-gray-400">/12</span></h3>
                        </div>
                        <div className="size-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <span className="material-symbols-outlined">support_agent</span>
                        </div>
                    </div>
                </div>
                <div className="bg-surface-light dark:bg-surface-dark border border-[#e6e6db] dark:border-[#3a3928] rounded-xl shadow-sm overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-[#e6e6db] dark:border-[#3a3928] flex flex-col md:flex-row gap-4 justify-between bg-surface-light/50 dark:bg-surface-dark/50">
                        <div className="relative w-full md:w-96">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#8c8b5f]"><span className="material-symbols-outlined">search</span></span>
                            <input 
                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#e6e6db] dark:border-[#3a3928] bg-white dark:bg-black/20 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-shadow" 
                                placeholder="Search by customer, ID, or device..." 
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0">
                            <select 
                                className="pl-3 pr-10 py-2.5 rounded-lg border border-[#e6e6db] dark:border-[#3a3928] bg-white dark:bg-black/20 text-sm focus:ring-primary focus:border-primary cursor-pointer min-w-[140px]"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">All Status</option>
                                <option value="scheduled">Scheduled</option>
                                <option value="in progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                            <select 
                                className="pl-3 pr-10 py-2.5 rounded-lg border border-[#e6e6db] dark:border-[#3a3928] bg-white dark:bg-black/20 text-sm focus:ring-primary focus:border-primary cursor-pointer min-w-[140px]"
                                value={agentFilter}
                                onChange={(e) => setAgentFilter(e.target.value)}
                            >
                                <option value="all">All Agents</option>
                                <option value="ai">AI Assistant</option>
                                <option value="human">Human Support</option>
                            </select>
                            <button 
                                onClick={() => {
                                    setSearchTerm('');
                                    setStatusFilter('all');
                                    setAgentFilter('all');
                                }}
                                className="px-3 py-2.5 rounded-lg border border-[#e6e6db] dark:border-[#3a3928] bg-white dark:bg-black/20 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-[#5c5b4f] dark:text-[#cbcb9c]"
                                title="Clear filters"
                            >
                                <span className="material-symbols-outlined">filter_list_off</span>
                            </button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-[#f8f8f5] dark:bg-[#23220f] border-b border-[#e6e6db] dark:border-[#3a3928] text-xs uppercase text-[#5c5b4f] dark:text-[#cbcb9c] font-semibold tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Customer</th>
                                    <th className="px-6 py-4">Device & Issue</th>
                                    <th className="px-6 py-4">Date & Time</th>
                                    <th className="px-6 py-4">Assigned Agent</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#e6e6db] dark:divide-[#3a3928]">
                                {currentAppointments.map(appt => (
                                    <tr key={appt._id} className="group hover:bg-[#f8f8f5] dark:hover:bg-[#3a3928]/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="size-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-300 font-bold text-xs">{appt.citizen_name.split(' ').map(n=>n[0]).join('')}</div>
                                                <div>
                                                    <div className="font-semibold text-text-light dark:text-text-dark">{appt.citizen_name}</div>
                                                    <div className="text-xs text-[#8c8b5f]">#{appt._id.slice(-6)}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium">{appt.product_name}</span>
                                                <span className="text-xs text-[#8c8b5f]">{appt.issue_description}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium">{new Date(appt.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                <span className="text-xs text-[#8c8b5f]">{appt.appointment_time}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {appt.assigned_agent_type === 'AI' ? <div className="size-6 rounded-full bg-blue-100 flex items-center justify-center"><span className="material-symbols-outlined text-blue-600 text-[14px]">smart_toy</span></div> : <div className="size-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center"><span className="material-symbols-outlined text-gray-500 dark:text-gray-400 text-[14px]">person</span></div>}
                                                <span className="text-sm">{appt.assigned_agent || 'Unassigned'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">{getStatusChip(appt.status)}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 text-[#5c5b4f] transition-colors"><span className="material-symbols-outlined text-[20px]">more_vert</span></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 border-t border-[#e6e6db] dark:border-[#3a3928] flex items-center justify-between">
                        <p className="text-xs text-[#8c8b5f]">Showing <span className="font-bold text-text-light dark:text-text-dark">{indexOfFirstAppointment + 1}-{Math.min(indexOfLastAppointment, filteredAppointments.length)}</span> of <span className="font-bold text-text-light dark:text-text-dark">{filteredAppointments.length}</span> appointments {searchTerm || statusFilter !== 'all' || agentFilter !== 'all' ? '(filtered)' : ''}</p>
                        <div className="flex items-center gap-2">
                            <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1 rounded-lg border border-[#e6e6db] dark:border-[#3a3928] hover:bg-gray-50 dark:hover:bg-white/5 text-xs font-medium disabled:opacity-50">Previous</button>
                            <button onClick={() => paginate(currentPage + 1)} disabled={indexOfLastAppointment >= filteredAppointments.length} className="px-3 py-1 rounded-lg border border-[#e6e6db] dark:border-[#3a3928] hover:bg-gray-50 dark:hover:bg-white/5 text-xs font-medium disabled:opacity-50">Next</button>
                        </div>
                    </div>
                </div>
            </main>
            
            <AppointmentBookingModal 
                isOpen={showBookingModal}
                onClose={() => setShowBookingModal(false)}
                onSuccess={fetchAppointments}
            />
        </div>
    );
};

export default Appointments;
