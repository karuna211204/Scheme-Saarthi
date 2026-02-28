import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const SalesLeads = () => {
    const { token } = useAuth();
    const [salesLeads, setSalesLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [leadsPerPage] = useState(4);
    const [selectedLead, setSelectedLead] = useState(null);
    const [showActionsMenu, setShowActionsMenu] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sourceFilter, setSourceFilter] = useState('all');
    const [showCampaignModal, setShowCampaignModal] = useState(false);
    const [campaignSettings, setCampaignSettings] = useState({
        targetCount: 10,
        delayBetweenCalls: 30,
        minLeadScore: 50,
        leadStatus: 'new'
    });
    const [campaignInProgress, setCampaignInProgress] = useState(false);
    const [createLeadForm, setCreateLeadForm] = useState({
        citizen_name: '',
        email: '',
        phone: '',
        source: 'Manual Entry',
        notes: '',
        product_interest: '',
        lead_type: 'scheme_inquiry'
    });


    useEffect(() => {
        if(token) {
            fetchSalesLeads();
        }
    }, [token]);

    const fetchSalesLeads = async () => {
        setLoading(true);
        try {
            const headers = { 'Authorization': `Bearer ${token}` };
            const baseUrl = process.env.REACT_APP_BACKEND_URL;
            const response = await fetch(`${baseUrl}/api/salesleads`, { headers });
            if (response.ok) {
                setSalesLeads(await response.json());
            }
        } catch (err) {
            console.error('Error fetching sales leads:', err);
        }
        setLoading(false);
    };

    const handleRequalifyLead = async (leadId) => {
        try {
            const headers = { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };
            const baseUrl = process.env.REACT_APP_BACKEND_URL;
            const response = await fetch(`${baseUrl}/api/salesleads/${leadId}/requalify`, {
                method: 'POST',
                headers
            });
            
            if (response.ok) {
                alert('Lead re-qualified successfully!');
                fetchSalesLeads();
            }
        } catch (err) {
            console.error('Error requalifying lead:', err);
            alert('Failed to requalify lead');
        }
    };

    const handleDeleteLead = async (leadId) => {
        if (!window.confirm('Are you sure you want to delete this lead?')) {
            return;
        }

        try {
            const headers = { 'Authorization': `Bearer ${token}` };
            const baseUrl = process.env.REACT_APP_BACKEND_URL;
            const response = await fetch(`${baseUrl}/api/salesleads/${leadId}`, {
                method: 'DELETE',
                headers
            });
            
            if (response.ok) {
                alert('Lead deleted successfully!');
                fetchSalesLeads();
            }
        } catch (err) {
            console.error('Error deleting lead:', err);
            alert('Failed to delete lead');
        }
    };

    const handleUpdateStatus = async (leadId, newStatus) => {
        try {
            const headers = { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };
            const baseUrl = process.env.REACT_APP_BACKEND_URL;
            const response = await fetch(`${baseUrl}/api/salesleads/${leadId}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({ status: newStatus })
            });
            
            if (response.ok) {
                fetchSalesLeads();
            }
        } catch (err) {
            console.error('Error updating lead status:', err);
        }
    };

    const handleCreateLead = async () => {
        if (!createLeadForm.citizen_name || !createLeadForm.phone) {
            alert('Please fill in at least citizen name and phone number');
            return;
        }

        try {
            const headers = { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };
            const baseUrl = process.env.REACT_APP_BACKEND_URL;
            const response = await fetch(`${baseUrl}/api/salesleads`, {
                method: 'POST',
                headers,
                body: JSON.stringify(createLeadForm)
            });
            
            if (response.ok) {
                alert('✅ Lead created successfully!');
                setCreateLeadForm({
                    citizen_name: '',
                    email: '',
                    phone: '',
                    source: 'Manual Entry',
                    notes: '',
                    product_interest: '',
                    lead_type: 'general'
                });
                fetchSalesLeads();
            } else {
                const error = await response.json();
                alert(`❌ Failed to create lead: ${error.error || 'Unknown error'}`);
            }
        } catch (err) {
            console.error('Error creating lead:', err);
            alert('❌ Failed to create lead. Please try again.');
        }
    };

    const handleMakeOutboundCall = async (lead) => {
        try {
            console.log('📞 Making outbound call to:', lead.citizen_name);
            
            const response = await fetch(`${process.env.REACT_APP_SIP_SERVER_URL || 'http://localhost:8003'}/initiate-sales-call`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customer_phone: lead.phone,
                    citizen_name: lead.citizen_name,
                    product_interest: lead.product_interest,
                    campaign_type: lead.lead_type || 'general',
                    lead_id: lead._id
                })
            });
            
            if (response.ok) {
                alert(`✅ Call initiated to ${lead.citizen_name}!`);
                fetchSalesLeads();
                setShowActionsMenu(null);
            } else {
                const error = await response.json();
                alert(`❌ Failed to initiate call: ${error.detail || 'Unknown error'}`);
            }
        } catch (err) {
            console.error('Error making outbound call:', err);
            alert('❌ Failed to initiate call. Please try again.');
        }
    };

    const handleStartCampaign = async () => {
        if (!window.confirm(`Start burst campaign to ${campaignSettings.targetCount} leads?`)) {
            return;
        }

        setCampaignInProgress(true);
        setShowCampaignModal(false);

        try {
            // Filter leads based on campaign settings
            const eligibleLeads = salesLeads.filter(lead => {
                const scoreMatch = lead.lead_score >= campaignSettings.minLeadScore;
                const statusMatch = campaignSettings.leadStatus === 'all' || 
                    lead.status?.toLowerCase() === campaignSettings.leadStatus.toLowerCase();
                return scoreMatch && statusMatch;
            }).slice(0, campaignSettings.targetCount);

            if (eligibleLeads.length === 0) {
                alert('No eligible leads found matching campaign criteria');
                setCampaignInProgress(false);
                return;
            }

            let successCount = 0;
            let failCount = 0;

            for (let i = 0; i < eligibleLeads.length; i++) {
                const lead = eligibleLeads[i];
                
                try {
                    const response = await fetch(`${process.env.REACT_APP_SIP_SERVER_URL || 'http://localhost:8003'}/initiate-sales-call`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            customer_phone: lead.phone,
                            citizen_name: lead.citizen_name,
                            product_interest: lead.product_interest,
                            campaign_type: 'burst_campaign',
                            lead_id: lead._id
                        })
                    });
                    
                    if (response.ok) {
                        successCount++;
                        console.log(`✅ Call ${i+1}/${eligibleLeads.length} initiated to ${lead.citizen_name}`);
                    } else {
                        failCount++;
                        console.log(`❌ Call ${i+1}/${eligibleLeads.length} failed for ${lead.citizen_name}`);
                    }
                } catch (err) {
                    failCount++;
                    console.error(`Error calling ${lead.citizen_name}:`, err);
                }

                // Delay between calls (except for last one)
                if (i < eligibleLeads.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, campaignSettings.delayBetweenCalls * 1000));
                }
            }

            alert(`🎯 Campaign Complete!\n✅ Success: ${successCount}\n❌ Failed: ${failCount}`);
            fetchSalesLeads();
        } catch (err) {
            console.error('Campaign error:', err);
            alert('❌ Campaign failed. Please check console for details.');
        } finally {
            setCampaignInProgress(false);
        }
    };

    // Filter leads based on search and filters
    const filteredLeads = salesLeads.filter(lead => {
        const matchesSearch = searchTerm === '' || 
            lead.citizen_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.phone?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || lead.status?.toLowerCase() === statusFilter.toLowerCase();
        const matchesSource = sourceFilter === 'all' || lead.source?.toLowerCase() === sourceFilter.toLowerCase();
        
        return matchesSearch && matchesStatus && matchesSource;
    });

    // Pagination logic
    const indexOfLastLead = currentPage * leadsPerPage;
    const indexOfFirstLead = indexOfLastLead - leadsPerPage;
    const currentLeads = filteredLeads.slice(indexOfFirstLead, indexOfLastLead);

    const paginate = (direction) => {
        const totalPages = Math.ceil(filteredLeads.length / leadsPerPage);
        const newPage = currentPage + direction;
        if (newPage > 0 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const getStatusChip = (status) => {
        switch (status.toLowerCase()) {
            case 'new':
                return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-100 dark:border-blue-800"><span className="size-1.5 rounded-full bg-blue-500"></span> New</span>;
            case 'contacted':
                return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border border-yellow-100 dark:border-yellow-800"><span className="size-1.5 rounded-full bg-yellow-500"></span> Contacted</span>;
            case 'qualified':
                return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 border border-green-100 dark:border-green-800"><span className="size-1.5 rounded-full bg-green-500"></span> Qualified</span>;
            case 'closed':
                return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-700 dark:bg-gray-800/50 dark:text-gray-400 border border-gray-100 dark:border-gray-700"><span className="size-1.5 rounded-full bg-gray-400"></span> Closed</span>;
            default:
                return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-700">{status}</span>;
        }
    };

    const getSourceIcon = (source) => {
        switch (source.toLowerCase()) {
            case 'ai chat': return <span className="material-symbols-outlined text-[18px]">smart_toy</span>;
            case 'web form': return <span className="material-symbols-outlined text-[18px]">web</span>;
            case 'inbound call': return <span className="material-symbols-outlined text-[18px]">phone_callback</span>;
            default: return null;
        }
    };

    const getScoreBar = (score) => {
        let colorClass = '';
        if (score >= 80) colorClass = 'bg-green-500';
        else if (score >= 40) colorClass = 'bg-yellow-500';
        else colorClass = 'bg-red-400';
        return (
            <div className="flex items-center gap-2">
                <div className="flex-1 w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full ${colorClass}`} style={{width: `${score}%`}}></div>
                </div>
                <span className={`text-xs font-bold ${score >= 80 ? 'text-green-600' : score >= 40 ? 'text-yellow-600' : 'text-red-500'}`}>{score}%</span>
            </div>
        );
    };

    if (loading) {
        return <div className="text-center py-8 text-gray-500">Loading sales leads...</div>;
    }

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-text-light dark:text-text-dark min-h-screen flex flex-col selection:bg-primary selection:text-black">
            <main className="flex-grow w-full max-w-[1440px] mx-auto px-6 py-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Sales Leads</h1>
                        <p className="text-gray-500 dark:text-gray-400">Manage potential clients and track AI-generated opportunities.</p>
                    </div>
                    <div className="flex gap-4 items-start">
                        <button 
                            onClick={() => setShowCampaignModal(true)}
                            disabled={campaignInProgress}
                            className="px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="material-symbols-outlined text-[20px]">{campaignInProgress ? 'hourglass_empty' : 'campaign'}</span>
                            {campaignInProgress ? 'Campaign Running...' : 'Start Campaign'}
                        </button>
                        <div className="px-5 py-3 bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Leads</span>
                            <div className="text-2xl font-bold mt-1">{salesLeads.length}</div>
                        </div>
                        <div className="px-5 py-3 bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm">
                            <span className="text-xs font-bold text-primary uppercase tracking-wider">New Today</span>
                            <div className="text-2xl font-bold mt-1 flex items-center gap-2">
                                +{salesLeads.filter(l => new Date(l.date_created).toDateString() === new Date().toDateString()).length} <span className="text-xs font-medium bg-primary/20 text-yellow-700 px-1.5 py-0.5 rounded">AI Scored</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-8 flex flex-col gap-6">
                        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-surface-light dark:bg-surface-dark p-4 rounded-xl border border-border-light dark:border-border-dark">
                            <div className="relative w-full sm:max-w-xs">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">search</span>
                                <input 
                                    className="w-full pl-10 pr-4 py-2 bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg text-sm focus:ring-primary focus:border-primary" 
                                    placeholder="Search leads by name, email, phone..." 
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <select 
                                    className="form-select text-sm py-2 pl-3 pr-8 bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg focus:ring-primary focus:border-primary"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="all">Status: All</option>
                                    <option value="new">New</option>
                                    <option value="contacted">Contacted</option>
                                    <option value="qualified">Qualified</option>
                                    <option value="closed">Closed</option>
                                </select>
                                <select 
                                    className="form-select text-sm py-2 pl-3 pr-8 bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg focus:ring-primary focus:border-primary"
                                    value={sourceFilter}
                                    onChange={(e) => setSourceFilter(e.target.value)}
                                >
                                    <option value="all">Source: All</option>
                                    <option value="ai chat">AI Chat</option>
                                    <option value="web form">Web Form</option>
                                    <option value="inbound call">Inbound Call</option>
                                    <option value="referral">Referral</option>
                                </select>
                                <button 
                                    onClick={() => {
                                        setSearchTerm('');
                                        setStatusFilter('all');
                                        setSourceFilter('all');
                                    }}
                                    className="p-2 text-gray-500 hover:text-black border border-border-light dark:border-border-dark rounded-lg bg-background-light dark:bg-background-dark"
                                    title="Clear filters"
                                >
                                    <span className="material-symbols-outlined text-[20px]">filter_list_off</span>
                                </button>
                            </div>
                        </div>
                        <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-border-light dark:border-border-dark bg-background-light/50 dark:bg-background-dark/50">
                                            <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Lead Details</th>
                                            <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Source</th>
                                            <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">AI Score</th>
                                            <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border-light dark:divide-border-dark">
                                        {currentLeads.map(lead => (
                                            <tr key={lead._id} className="group hover:bg-background-light dark:hover:bg-white/5 transition-colors">
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-3">
                                                         <div className="size-10 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold text-sm">{lead.citizen_name.split(' ').map(n=>n[0]).join('')}</div>
                                                        <div>
                                                            <p className="font-semibold text-text-light dark:text-text-dark">{lead.citizen_name}</p>
                                                            <p className="text-xs text-gray-500">{lead.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">{getStatusChip(lead.status)}</td>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                                        {getSourceIcon(lead.source)} {lead.source}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">{getScoreBar(lead.lead_score)}</td>
                                                <td className="py-4 px-6 text-right relative">
                                                    <button 
                                                        onClick={() => setShowActionsMenu(showActionsMenu === lead._id ? null : lead._id)}
                                                        className="text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                                                    >
                                                        <span className="material-symbols-outlined">more_vert</span>
                                                    </button>
                                                    
                                                    {showActionsMenu === lead._id && (
                                                        <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 min-w-[180px]">
                                                            <button
                                                                onClick={() => handleMakeOutboundCall(lead)}
                                                                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-green-600 dark:text-green-400 font-semibold"
                                                            >
                                                                <span className="material-symbols-outlined text-sm">phone</span>
                                                                Call Now
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    handleRequalifyLead(lead._id);
                                                                    setShowActionsMenu(null);
                                                                }}
                                                                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                                            >
                                                                <span className="material-symbols-outlined text-sm">autorenew</span>
                                                                Re-qualify Lead
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    handleUpdateStatus(lead._id, 'contacted');
                                                                    setShowActionsMenu(null);
                                                                }}
                                                                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                                            >
                                                                <span className="material-symbols-outlined text-sm">check_circle</span>
                                                                Mark Contacted
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    handleUpdateStatus(lead._id, 'qualified');
                                                                    setShowActionsMenu(null);
                                                                }}
                                                                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                                            >
                                                                <span className="material-symbols-outlined text-sm">verified</span>
                                                                Mark Qualified
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    handleDeleteLead(lead._id);
                                                                    setShowActionsMenu(null);
                                                                }}
                                                                className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 border-t border-gray-200 dark:border-gray-700"
                                                            >
                                                                <span className="material-symbols-outlined text-sm">delete</span>
                                                                Delete Lead
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="px-6 py-4 border-t border-border-light dark:border-border-dark flex items-center justify-between">
                                <p className="text-sm text-gray-500">Showing <span className="font-bold text-text-light dark:text-text-dark">{indexOfFirstLead + 1}-{Math.min(indexOfLastLead, filteredLeads.length)}</span> of <span className="font-bold text-text-light dark:text-text-dark">{filteredLeads.length}</span> {searchTerm || statusFilter !== 'all' || sourceFilter !== 'all' ? '(filtered)' : ''}</p>
                                <div className="flex gap-2">
                                    <button onClick={() => paginate(-1)} disabled={currentPage === 1} className="px-3 py-1 text-sm border border-border-light dark:border-border-dark rounded hover:bg-background-light dark:hover:bg-white/5 transition-colors disabled:opacity-50">Prev</button>
                                    <button onClick={() => paginate(1)} disabled={indexOfLastLead >= filteredLeads.length} className="px-3 py-1 text-sm border border-border-light dark:border-border-dark rounded hover:bg-background-light dark:hover:bg-white/5 transition-colors disabled:opacity-50">Next</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-4">
                        <div className="sticky top-24 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl p-6 shadow-lg">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold flex items-center gap-2"><span className="material-symbols-outlined text-primary">person_add</span>Quick Add Lead</h3>
                            </div>
                            <form onSubmit={(e) => { e.preventDefault(); handleCreateLead(); }} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Full Name *</label>
                                    <div className="relative"><span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 text-[18px]">person</span><input className="w-full pl-9 pr-4 py-2.5 bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg text-sm focus:ring-primary focus:border-primary placeholder:text-gray-400" placeholder="e.g. John Smith" type="text" value={createLeadForm.citizen_name} onChange={(e) => setCreateLeadForm({...createLeadForm, citizen_name: e.target.value})} required/></div>
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="space-y-1"><label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Email Address</label><div className="relative"><span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 text-[18px]">mail</span><input className="w-full pl-9 pr-4 py-2.5 bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg text-sm focus:ring-primary focus:border-primary placeholder:text-gray-400" placeholder="john@company.com" type="email" value={createLeadForm.email} onChange={(e) => setCreateLeadForm({...createLeadForm, email: e.target.value})}/></div></div>
                                    <div className="space-y-1"><label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Phone *</label><div className="relative"><span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 text-[18px]">call</span><input className="w-full pl-9 pr-4 py-2.5 bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg text-sm focus:ring-primary focus:border-primary placeholder:text-gray-400" placeholder="+1 (555) 000-0000" type="tel" value={createLeadForm.phone} onChange={(e) => setCreateLeadForm({...createLeadForm, phone: e.target.value})} required/></div></div>
                                </div>
                                <div className="space-y-1"><label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Product Interest</label><div className="relative"><span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 text-[18px]">devices</span><input className="w-full pl-9 pr-4 py-2.5 bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg text-sm focus:ring-primary focus:border-primary placeholder:text-gray-400" placeholder="e.g. Laptop repair, Phone screen" type="text" value={createLeadForm.product_interest} onChange={(e) => setCreateLeadForm({...createLeadForm, product_interest: e.target.value})}/></div></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1"><label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Lead Source</label><select className="w-full py-2.5 pl-3 pr-8 bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg text-sm focus:ring-primary focus:border-primary" value={createLeadForm.source} onChange={(e) => setCreateLeadForm({...createLeadForm, source: e.target.value})}><option>Inbound Call</option><option>Manual Entry</option><option>Email Inquiry</option><option>Referral</option><option>Web Form</option></select></div>
                                    <div className="space-y-1"><label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Lead Type</label><select className="w-full py-2.5 pl-3 pr-8 bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg text-sm focus:ring-primary focus:border-primary" value={createLeadForm.lead_type} onChange={(e) => setCreateLeadForm({...createLeadForm, lead_type: e.target.value})}><option value="general">General</option><option value="hot">Hot Lead</option><option value="warm">Warm Lead</option><option value="cold">Cold Lead</option><option value="warranty">Warranty</option><option value="bulk_repair">Bulk Repair</option></select></div>
                                </div>
                                <div className="space-y-1"><label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Initial Notes</label><textarea className="w-full p-3 bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg text-sm focus:ring-primary focus:border-primary placeholder:text-gray-400" placeholder="Customer is interested in bulk laptop repairs..." rows="3" value={createLeadForm.notes} onChange={(e) => setCreateLeadForm({...createLeadForm, notes: e.target.value})}></textarea></div>
                                <button className="w-full mt-2 py-3 bg-primary hover:bg-primary-hover text-black font-bold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2" type="submit">Create Lead<span className="material-symbols-outlined text-[18px]">arrow_forward</span></button>
                            </form>
                            <div className="mt-6 pt-4 border-t border-border-light dark:border-border-dark flex items-start gap-3">
                                <span className="material-symbols-outlined text-primary text-[20px]">auto_awesome</span>
                                <p className="text-xs text-gray-500 leading-relaxed"><strong className="text-text-light dark:text-text-dark">AI Suggestion:</strong> Based on recent logs, there are 3 unassigned conversations that might be sales leads. <a className="text-black dark:text-white font-semibold underline decoration-primary decoration-2 underline-offset-2" href="#">Review now</a></p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Campaign Modal */}
            {showCampaignModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowCampaignModal(false)}>
                    <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <span className="material-symbols-outlined text-purple-600">campaign</span>
                                Burst Call Campaign
                            </h3>
                            <button onClick={() => setShowCampaignModal(false)} className="text-gray-400 hover:text-black dark:hover:text-white">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-2 block">Target Lead Count</label>
                                <input 
                                    type="number" 
                                    min="1" 
                                    max="100"
                                    value={campaignSettings.targetCount}
                                    onChange={(e) => setCampaignSettings({...campaignSettings, targetCount: parseInt(e.target.value)})}
                                    className="w-full px-4 py-2.5 bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg text-sm focus:ring-primary focus:border-primary"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-2 block">Delay Between Calls (seconds)</label>
                                <input 
                                    type="number" 
                                    min="10" 
                                    max="300"
                                    value={campaignSettings.delayBetweenCalls}
                                    onChange={(e) => setCampaignSettings({...campaignSettings, delayBetweenCalls: parseInt(e.target.value)})}
                                    className="w-full px-4 py-2.5 bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg text-sm focus:ring-primary focus:border-primary"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-2 block">Minimum Lead Score</label>
                                <input 
                                    type="number" 
                                    min="0" 
                                    max="100"
                                    value={campaignSettings.minLeadScore}
                                    onChange={(e) => setCampaignSettings({...campaignSettings, minLeadScore: parseInt(e.target.value)})}
                                    className="w-full px-4 py-2.5 bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg text-sm focus:ring-primary focus:border-primary"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-2 block">Target Lead Status</label>
                                <select 
                                    value={campaignSettings.leadStatus}
                                    onChange={(e) => setCampaignSettings({...campaignSettings, leadStatus: e.target.value})}
                                    className="w-full px-4 py-2.5 bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg text-sm focus:ring-primary focus:border-primary"
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="new">New Only</option>
                                    <option value="contacted">Contacted</option>
                                    <option value="qualified">Qualified</option>
                                </select>
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm">
                                <p className="font-semibold text-blue-900 dark:text-blue-300 mb-1">📊 Campaign Preview</p>
                                <p className="text-blue-700 dark:text-blue-400">
                                    Will call up to <strong>{campaignSettings.targetCount}</strong> leads with score ≥ <strong>{campaignSettings.minLeadScore}</strong>
                                    {campaignSettings.leadStatus !== 'all' && ` (${campaignSettings.leadStatus} status)`}
                                    <br/>
                                    <span className="text-xs">Delay: {campaignSettings.delayBetweenCalls}s between calls</span>
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button 
                                onClick={() => setShowCampaignModal(false)}
                                className="flex-1 px-4 py-3 border border-border-light dark:border-border-dark rounded-lg hover:bg-background-light dark:hover:bg-white/5 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleStartCampaign}
                                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                                Start Campaign
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SalesLeads;
