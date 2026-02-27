import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const CustomerOverview = () => {
    const { token } = useAuth();
    const [customers, setCustomers] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [warranties, setWarranties] = useState([]);
    const [transcripts, setTranscripts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [customersPerPage] = useState(4); // Set customers per page
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [warrantyFilter, setWarrantyFilter] = useState('all');

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            try {
                const headers = { 'Authorization': `Bearer ${token}` };
                const baseUrl = process.env.REACT_APP_BACKEND_URL;

                const [custRes, apptRes, warrRes, transRes] = await Promise.all([
                    fetch(`${baseUrl}/api/customers`, { headers }),
                    fetch(`${baseUrl}/api/appointments`, { headers }),
                    fetch(`${baseUrl}/api/warranties`, { headers }),
                    fetch(`${baseUrl}/api/transcripts/admin/all`, { headers })
                ]);

                if (custRes.ok) setCustomers(await custRes.json());
                if (apptRes.ok) setAppointments(await apptRes.json());
                if (warrRes.ok) setWarranties(await warrRes.json());
                if (transRes.ok) setTranscripts(await transRes.json());

            } catch (err) {
                console.error('Error fetching admin data:', err);
            }
            setLoading(false);
        };
        if (token) {
            fetchAllData();
        }
    }, [token]);

    const handleExport = async () => {
        try {
            const headers = { 'Authorization': `Bearer ${token}` };
            const baseUrl = process.env.REACT_APP_BACKEND_URL;
            const response = await fetch(`${baseUrl}/api/export/customers`, { headers });
            
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `customers_${Date.now()}.csv`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }
        } catch (err) {
            console.error('Error exporting customers:', err);
            alert('Failed to export customers');
        }
    };

    // Filter customers based on search and filters
    const filteredCustomers = customers.filter(customer => {
        const matchesSearch = searchTerm === '' ||
            customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.phone?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || 
            (customer.status || 'Active').toLowerCase() === statusFilter.toLowerCase();
        
        const customerWarranties = warranties.filter(w => w.phone === customer.phone);
        const hasActiveWarranty = customerWarranties.some(w => new Date(w.warranty_end_date) >= new Date());
        const hasExpiredWarranty = customerWarranties.some(w => new Date(w.warranty_end_date) < new Date());
        
        const matchesWarranty = warrantyFilter === 'all' ||
            (warrantyFilter === 'active' && hasActiveWarranty) ||
            (warrantyFilter === 'expired' && hasExpiredWarranty) ||
            (warrantyFilter === 'none' && customerWarranties.length === 0);
        
        return matchesSearch && matchesStatus && matchesWarranty;
    });

    // Pagination logic
    const indexOfLastCustomer = currentPage * customersPerPage;
    const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
    const currentCustomers = filteredCustomers.slice(indexOfFirstCustomer, indexOfLastCustomer);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(filteredCustomers.length / customersPerPage); i++) {
        pageNumbers.push(i);
    }


    const activeWarranties = warranties.filter(w => new Date(w.warranty_end_date) >= new Date()).length;
    const pendingAppointments = appointments.filter(a => a.status === 'scheduled').length;

    if (loading) {
        return <div className="text-center py-8 text-gray-500">Loading customer data...</div>;
    }

    const getStatusIndicator = (status) => {
        switch (status) {
            case 'Active':
                return <span className="inline-block size-2 rounded-full bg-green-500"></span>;
            case 'Pending':
                return <span className="inline-block size-2 rounded-full bg-yellow-500"></span>;
            case 'Inactive':
                return <span className="inline-block size-2 rounded-full bg-gray-400"></span>;
            default:
                return <span className="inline-block size-2 rounded-full bg-gray-400"></span>;
        }
    };

    const getWarrantyChip = (warranty) => {
        const isExpired = new Date(warranty.warranty_end_date) < new Date();
        const icon = 'description';

        if (isExpired) {
            return (
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-medium w-fit">
                    <span className="material-symbols-outlined text-sm">{icon}</span>
                    {warranty.product_name} (Closed)
                </div>
            );
        }
        return (
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs font-medium w-fit">
                <span className="material-symbols-outlined text-sm">{icon}</span>
                {warranty.product_name} (Active)
            </div>
        );
    };

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-text-light dark:text-text-dark min-h-screen flex flex-col selection:bg-primary selection:text-black">
            <main className="flex-grow w-full max-w-[1440px] mx-auto px-6 py-8 flex flex-col gap-6">
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-text-light dark:text-white mb-2">Citizen Data Overview</h1>
                            <p className="text-[#5c5b4f] dark:text-[#cbcb9c]">Manage applications, consultations, and scheme history across all citizens.</p>
                        </div>
                        <div className="flex gap-3">
                            <button 
                                onClick={handleExport}
                                className="flex items-center gap-2 px-5 py-3 rounded-full border border-[#e6e6db] dark:border-[#3a3928] bg-surface-light dark:bg-surface-dark font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                            >
                                <span className="material-symbols-outlined text-lg">download</span>
                                Export CSV
                            </button>
                            <button className="flex items-center gap-2 px-5 py-3 rounded-full bg-black dark:bg-white text-white dark:text-black font-bold hover:opacity-90 transition-opacity shadow-lg">
                                <span className="material-symbols-outlined text-lg">add</span>
                                Add Customer
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-5 rounded-2xl bg-surface-light dark:bg-surface-dark border border-[#e6e6db] dark:border-[#3a3928] flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-[#8c8b5f] uppercase tracking-wider mb-1">Total Customers</p>
                                <p className="text-3xl font-bold">{customers.length}</p>
                            </div>
                            <div className="size-12 rounded-full bg-primary/20 text-black dark:text-white flex items-center justify-center">
                                <span className="material-symbols-outlined">groups</span>
                            </div>
                        </div>
                        <div className="p-5 rounded-2xl bg-surface-light dark:bg-surface-dark border border-[#e6e6db] dark:border-[#3a3928] flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-[#8c8b5f] uppercase tracking-wider mb-1">Active Warranties</p>
                                <p className="text-3xl font-bold">{activeWarranties}</p>
                            </div>
                            <div className="size-12 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center">
                                <span className="material-symbols-outlined">verified_user</span>
                            </div>
                        </div>
                        <div className="p-5 rounded-2xl bg-surface-light dark:bg-surface-dark border border-[#e6e6db] dark:border-[#3a3928] flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-[#8c8b5f] uppercase tracking-wider mb-1">Pending Appts</p>
                                <p className="text-3xl font-bold">{pendingAppointments}</p>
                            </div>
                            <div className="size-12 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                <span className="material-symbols-outlined">calendar_clock</span>
                            </div>
                        </div>
                        <div className="p-5 rounded-2xl bg-surface-light dark:bg-surface-dark border border-[#e6e6db] dark:border-[#3a3928] flex items-center justify-between">
                             <div>
                                <p className="text-xs font-semibold text-[#8c8b5f] uppercase tracking-wider mb-1">Active Support Chats</p>
                                <p className="text-3xl font-bold">{transcripts.length}</p>
                            </div>
                            <div className="size-12 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                                <span className="material-symbols-outlined">forum</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-surface-light dark:bg-surface-dark p-2 rounded-2xl border border-[#e6e6db] dark:border-[#3a3928] flex flex-col md:flex-row gap-2 shadow-sm">
                    <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <span className="material-symbols-outlined text-[#8c8b5f]">search</span>
                        </div>
                        <input 
                            className="block w-full pl-12 pr-4 py-3.5 bg-background-light dark:bg-background-dark border-none rounded-xl text-text-light dark:text-text-dark placeholder:text-[#8c8b5f] focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-black transition-all" 
                            placeholder="Search by name, email, or phone..." 
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 custom-scrollbar">
                        <div className="relative min-w-[140px]">
                            <select 
                                className="block w-full pl-4 pr-10 py-3.5 bg-background-light dark:bg-background-dark border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">All Statuses</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="flagged">Flagged</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#8c8b5f]">
                                <span className="material-symbols-outlined text-sm">expand_more</span>
                            </div>
                        </div>
                        <div className="relative min-w-[160px]">
                            <select 
                                className="block w-full pl-4 pr-10 py-3.5 bg-background-light dark:bg-background-dark border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
                                value={warrantyFilter}
                                onChange={(e) => setWarrantyFilter(e.target.value)}
                            >
                                <option value="all">All Warranties</option>
                                <option value="active">Active Warranty</option>
                                <option value="expired">Expired</option>
                                <option value="none">No Warranty</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#8c8b5f]">
                                <span className="material-symbols-outlined text-sm">expand_more</span>
                            </div>
                        </div>
                        <button 
                            onClick={() => {
                                setSearchTerm('');
                                setStatusFilter('all');
                                setWarrantyFilter('all');
                            }}
                            className="px-5 py-3.5 bg-background-light dark:bg-background-dark hover:bg-primary hover:text-black rounded-xl text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
                            title="Clear filters"
                        >
                            <span className="material-symbols-outlined text-lg">filter_list_off</span>
                            Clear
                        </button>
                    </div>
                </div>

                <div className="bg-surface-light dark:bg-surface-dark border border-[#e6e6db] dark:border-[#3a3928] rounded-2xl overflow-hidden shadow-sm flex flex-col">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-background-light dark:bg-background-dark border-b border-[#e6e6db] dark:border-[#3a3928]">
                                    <th className="py-4 pl-6 pr-4 text-xs font-bold uppercase tracking-wider text-[#8c8b5f] w-12">
                                        <input className="rounded border-gray-300 text-primary focus:ring-primary bg-transparent" type="checkbox"/>
                                    </th>
                                    <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-[#8c8b5f]">Customer</th>
                                    <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-[#8c8b5f]">Contact</th>
                                    <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-[#8c8b5f]">Warranties</th>
                                    <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-[#8c8b5f]">Scheduled Appt.</th>
                                    <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-[#8c8b5f]">Recent Transcript</th>
                                    <th className="py-4 pl-4 pr-6 text-xs font-bold uppercase tracking-wider text-[#8c8b5f] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#e6e6db] dark:divide-[#3a3928]">
                                {currentCustomers.map(customer => {
                                    const customerWarranties = warranties.filter(w => w.phone === customer.phone);
                                    const customerAppointment = appointments.find(a => a.phone === customer.phone && new Date(a.appointment_date) > new Date());
                                    const latestTranscript = transcripts.filter(t => t.phone === customer.phone).sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp))[0];

                                    return (
                                        <tr key={customer._id} className="group hover:bg-[#fcfcf9] dark:hover:bg-[#2f2e1a] transition-colors">
                                            <td className="py-4 pl-6 pr-4 align-top pt-5">
                                                <input className="rounded border-gray-300 text-primary focus:ring-primary bg-transparent" type="checkbox"/>
                                            </td>
                                            <td className="py-4 px-4 align-top">
                                                <div className="flex items-start gap-3">
                                                    <div className="size-10 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 flex items-center justify-center font-bold">
                                                        {customer.name.split(' ').map(n => n[0]).join('')}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-text-light dark:text-text-dark">{customer.name}</p>
                                                        <div className="flex items-center gap-1 mt-1">
                                                            {getStatusIndicator(customer.status || 'Active')}
                                                            <span className="text-xs text-[#5c5b4f] dark:text-[#cbcb9c]">{customer.status || 'Active'} Member</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 align-top">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2 text-sm text-[#5c5b4f] dark:text-[#cbcb9c]">
                                                        <span className="material-symbols-outlined text-base opacity-70">mail</span>
                                                        {customer.email}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-[#5c5b4f] dark:text-[#cbcb9c]">
                                                        <span className="material-symbols-outlined text-base opacity-70">call</span>
                                                        {customer.phone}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 align-top">
                                                <div className="flex flex-col gap-2">
                                                    {customerWarranties.length > 0 ? customerWarranties.map(w => getWarrantyChip(w)) : <span className="text-xs text-[#8c8b5f]">No active warranties</span>}
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 align-top">
                                                {customerAppointment ? (
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-text-light dark:text-text-dark">{new Date(customerAppointment.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, {new Date(customerAppointment.appointment_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                                                        <span className="text-xs text-[#8c8b5f]">{customerAppointment.service_type || 'General Checkup'}</span>
                                                        <div className="flex items-center gap-1 mt-1 text-xs text-blue-600 dark:text-blue-400 font-medium">
                                                            <span className="material-symbols-outlined text-sm">storefront</span>
                                                            Downtown Center
                                                        </div>
                                                    </div>
                                                ) : <span className="text-xs italic text-[#8c8b5f]">No upcoming appointments</span>}
                                            </td>
                                            <td className="py-4 px-4 align-top">
                                                {latestTranscript ? (
                                                     <div className="p-3 rounded-lg bg-background-light dark:bg-background-dark border border-[#e6e6db] dark:border-[#3a3928] max-w-[240px]">
                                                         <div className={`flex items-center gap-1 mb-1 text-xs font-semibold ${latestTranscript.agent_type === 'AI' ? 'text-primary dark:text-yellow-200' : 'text-blue-600 dark:text-blue-400'}`}>
                                                             <span className="material-symbols-outlined text-sm">{latestTranscript.agent_type === 'AI' ? 'smart_toy' : 'person'}</span>
                                                             {latestTranscript.agent_name || (latestTranscript.agent_type === 'AI' ? 'AI Agent' : 'Human Agent')} - {new Date(latestTranscript.timestamp).toLocaleDateString()}
                                                         </div>
                                                         <p className="text-xs text-[#5c5b4f] dark:text-[#cbcb9c] line-clamp-2 leading-relaxed">
                                                             {latestTranscript.transcript}
                                                         </p>
                                                         <a className="inline-flex items-center gap-1 text-xs font-bold mt-2 hover:underline" href="#">View Transcript <span className="material-symbols-outlined text-[10px]">open_in_new</span></a>
                                                     </div>
                                                ) : <span className="text-xs italic text-[#8c8b5f]">No recent chats</span>}
                                            </td>
                                            <td className="py-4 pl-4 pr-6 align-top text-right">
                                                <button className="text-[#8c8b5f] hover:text-black dark:hover:text-white p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors">
                                                    <span className="material-symbols-outlined">more_vert</span>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex items-center justify-between px-6 py-4 bg-background-light dark:bg-background-dark border-t border-[#e6e6db] dark:border-[#3a3928]">
                        <div className="text-sm text-[#8c8b5f]">
                            Showing <span className="font-medium text-black dark:text-white">{indexOfFirstCustomer + 1}</span> to <span className="font-medium text-black dark:text-white">{Math.min(indexOfLastCustomer, filteredCustomers.length)}</span> of <span className="font-medium text-black dark:text-white">{filteredCustomers.length}</span> results {searchTerm || statusFilter !== 'all' || warrantyFilter !== 'all' ? '(filtered)' : ''}
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="px-4 py-2 text-sm font-medium rounded-lg border border-[#e6e6db] dark:border-[#3a3928] bg-surface-light dark:bg-surface-dark text-[#8c8b5f] disabled:opacity-50">Previous</button>
                             {pageNumbers.map(number => (
                                <button key={number} onClick={() => paginate(number)} className={`px-4 py-2 text-sm font-medium rounded-lg ${currentPage === number ? 'bg-primary text-black' : 'border border-[#e6e6db] dark:border-[#3a3928] bg-surface-light dark:bg-surface-dark text-[#8c8b5f] hover:text-black dark:hover:text-white'}`}>
                                    {number}
                                </button>
                            ))}
                            <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === pageNumbers.length} className="px-4 py-2 text-sm font-medium rounded-lg border border-[#e6e6db] dark:border-[#3a3928] bg-surface-light dark:bg-surface-dark text-[#8c8b5f] hover:text-black dark:hover:text-white disabled:opacity-50">Next</button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CustomerOverview;