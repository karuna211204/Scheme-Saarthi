import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiUsers, FiCalendar, FiShield, FiMessageSquare, FiTrendingUp, FiHome, FiLogOut, FiSearch, FiFilter, FiChevronDown, FiChevronUp } from 'react-icons/fi';

const AdminPanel=() => {
  const { user, logout, token }=useAuth();
  const navigate=useNavigate();
  const [activeTab, setActiveTab]=useState('customers');
  const [customers, setCustomers]=useState([]);
  const [appointments, setAppointments]=useState([]);
  const [warranties, setWarranties]=useState([]);
  const [transcripts, setTranscripts]=useState([]);
  const [salesLeads, setSalesLeads]=useState([]);
  const [loading, setLoading]=useState(true);
  const [searchTerm, setSearchTerm]=useState('');
  const [statusFilter, setStatusFilter]=useState('all');
  const [expandedTranscripts, setExpandedTranscripts]=useState({});
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showCreateLeadModal, setShowCreateLeadModal] = useState(false);
  const [campaignForm, setCampaignForm] = useState({
    campaign_type: 'festival_offer',
    target_customers: [],
    product_interest: '',
    festival_name: '',
    offer_details: ''
  });
  const [newLeadForm, setNewLeadForm] = useState({
    customer_name: '',
    phone: '',
    email: '',
    company: '',
    lead_type: 'inbound_inquiry',
    source: 'manual',
    product_interest: '',
    budget_range: '',
    notes: '',
    assigned_to: ''
  });

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/home');
      return;
    }
    fetchAllData();
  }, [user]);

  const fetchAllData=async () => {
    setLoading(true);
    try {
      console.log('🔄 Fetching admin data from:', process.env.REACT_APP_BACKEND_URL);
      
      const [cust, appts, warr, trans, leads]=await Promise.all([
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/customers`).then(r => r.json()),
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/appointments`).then(r => r.json()),
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/warranties`).then(r => r.json()),
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/transcripts/admin/all`).then(r => r.json()),
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/salesleads`).then(r => r.json())
      ]);
      
      console.log('📊 Admin Data Fetched:');
      console.log('  Customers:', Array.isArray(cust) ? cust.length : 'Not an array', cust);
      console.log('  Appointments:', Array.isArray(appts) ? appts.length : 'Not an array', appts);
      console.log('  Warranties:', Array.isArray(warr) ? warr.length : 'Not an array', warr);
      console.log('  Transcripts:', Array.isArray(trans) ? trans.length : 'Not an array');
      console.log('  Sales Leads:', Array.isArray(leads) ? leads.length : 'Not an array', leads);
      
      setCustomers(Array.isArray(cust) ? cust : []);
      setAppointments(Array.isArray(appts) ? appts : []);
      setWarranties(Array.isArray(warr) ? warr : []);
      setTranscripts(Array.isArray(trans) ? trans : []);
      setSalesLeads(Array.isArray(leads) ? leads : []);
    } catch (err) {
      console.error('❌ Error fetching admin data:', err);
    }
    setLoading(false);
  };

  const getStatusBadge=(status) => {
    const colors={
      'scheduled': 'bg-blue-100 text-blue-800',
      'confirmed': 'bg-green-100 text-green-800',
      'completed': 'bg-gray-100 text-gray-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const filterData=(data, searchFields, applyStatusFilter = false) => {
    let filtered=data;
    
    if (searchTerm) {
      filtered=filtered.filter(item =>
        searchFields.some(field =>
          item[field]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    
    if (applyStatusFilter && statusFilter !== 'all') {
      filtered=filtered.filter(item => item.status === statusFilter);
    }
    
    return filtered;
  };

  const handleMakeOutboundCall = async (lead) => {
    try {
      console.log('📞 Making outbound call to:', lead.customer_name);
      
      const response = await fetch(`${process.env.REACT_APP_SIP_SERVER_URL || 'http://localhost:8003'}/initiate-sales-call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_phone: lead.phone,
          customer_name: lead.customer_name,
          product_interest: lead.product_interest,
          campaign_type: lead.lead_type || 'general',
          lead_id: lead._id
        })
      });
      
      if (response.ok) {
        alert(`✅ Call initiated to ${lead.customer_name}!`);
        fetchAllData();
      } else {
        const error = await response.json();
        alert(`❌ Failed to initiate call: ${error.detail || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error making outbound call:', err);
      alert('❌ Failed to initiate call. Please try again.');
    }
  };

  const renderCustomers=() => {
    const filtered=filterData(customers, ['name', 'email', 'phone']);
    
    if (filtered.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <p>No customers found</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-3">
        {filtered.map((customer) => (
          <div key={customer._id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{customer.name}</h4>
                <p className="text-sm text-gray-600 mt-1">📞 {customer.phone}</p>
                <p className="text-sm text-gray-600">📧 {customer.email}</p>
                {customer.address && <p className="text-xs text-gray-500 mt-1">📍 {customer.address}</p>}
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Joined: {new Date(customer.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderAppointments=() => {
    const filtered=filterData(appointments, ['customer_name', 'phone', 'product_name'], true);
    
    if (filtered.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <p>No appointments found</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-3">
        {filtered.map((apt) => (
          <div key={apt._id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadge(apt.status)}`}>
                    {apt.status?.toUpperCase()}
                  </span>
                  <span className="font-medium text-gray-900">{apt.customer_name}</span>
                </div>
                <p className="text-sm text-gray-700 font-medium">{apt.product_name || 'Service'}</p>
                <p className="text-sm text-gray-600 mt-1">{apt.issue_description}</p>
                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                  <span>📞 {apt.phone}</span>
                  <span>📅 {apt.appointment_date} at {apt.appointment_time}</span>
                  <span>₹{apt.visit_charge || 300}</span>
                </div>
                {apt.address && <p className="text-xs text-gray-500 mt-1">📍 {apt.address}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderWarranties=() => {
    const filtered=filterData(warranties, ['product_name', 'phone', 'invoice_id']);
    
    if (filtered.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <p>No warranties found</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-3">
        {filtered.map((warranty) => (
          <div key={warranty._id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-900">{warranty.product_name}</h4>
                <p className="text-sm text-gray-600 mt-1">📞 {warranty.phone}</p>
                <p className="text-sm text-gray-600">🧾 Invoice: {warranty.invoice_id}</p>
                <p className="text-xs text-gray-500 mt-1">
                  📅 {warranty.warranty_start_date} to {warranty.warranty_end_date}
                </p>
              </div>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                new Date(warranty.warranty_end_date) < new Date()
                  ? 'bg-red-100 text-red-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                {new Date(warranty.warranty_end_date) < new Date() ? 'EXPIRED' : 'ACTIVE'}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderTranscripts=() => {
    const filtered=filterData(transcripts, ['customer_name', 'phone', 'customer_id']);
    
    if (filtered.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <p>No transcripts found</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-3">
        {filtered.map((trans) => {
          const isExpanded = expandedTranscripts[trans._id];
          return (
            <div key={trans._id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-700 font-semibold text-lg">
                      {(trans.customer_name || 'U')[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{trans.customer_name || 'Unknown Customer'}</h4>
                    <p className="text-xs text-gray-500">📞 {trans.phone || 'No phone'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">{trans.time_ago || 'Recently'}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(trans.created_at).toLocaleDateString()} {new Date(trans.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              
              <p className={`text-sm text-gray-600 whitespace-pre-wrap ${!isExpanded ? 'line-clamp-4' : ''}`}>
                {trans.transcript}
              </p>
              
              {trans.transcript && trans.transcript.length > 200 && (
                <button
                  onClick={() => setExpandedTranscripts(prev => ({
                    ...prev,
                    [trans._id]: !prev[trans._id]
                  }))}
                  className="mt-3 text-green-600 hover:text-green-700 text-sm font-medium flex items-center gap-1"
                >
                  {isExpanded ? (
                    <>Show Less <FiChevronUp size={16} /></>
                  ) : (
                    <>Show Full Transcript <FiChevronDown size={16} /></>
                  )}
                </button>
              )}
              
              <p className="text-xs text-gray-400 mt-2">Session: {trans.customer_id}</p>
            </div>
          );
        })}
      </div>
    );
  };

  const renderSalesLeads=() => {
    const filtered=filterData(salesLeads, ['customer_name', 'phone', 'lead_type']);
    
    if (filtered.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <p>No sales leads found</p>
        </div>
      );
    }
    
    const highPriority = filtered.filter(l => l.qualification_status === 'high_priority');
    const qualified = filtered.filter(l => l.qualification_status === 'qualified');
    const unqualified = filtered.filter(l => l.qualification_status === 'unqualified' || !l.qualification_status);
    
    const getQualificationBadge = (status) => {
      const badges = {
        'high_priority': { color: 'bg-red-100 text-red-800', icon: '🔥', label: 'High Priority' },
        'qualified': { color: 'bg-green-100 text-green-800', icon: '✅', label: 'Qualified' },
        'unqualified': { color: 'bg-gray-100 text-gray-800', icon: '⏳', label: 'Unqualified' },
        'disqualified': { color: 'bg-gray-300 text-gray-600', icon: '❌', label: 'Disqualified' }
      };
      return badges[status] || badges['unqualified'];
    };
    
    const getScoreBadge = (score) => {
      if (score >= 70) return 'bg-green-500';
      if (score >= 50) return 'bg-yellow-500';
      if (score >= 30) return 'bg-orange-500';
      return 'bg-red-500';
    };
    
    const LeadCard = ({ lead }) => {
      const badge = getQualificationBadge(lead.qualification_status);
      
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-3 flex-wrap gap-2">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${badge.color}`}>
                  {badge.icon} {badge.label}
                </span>
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                  {lead.lead_type?.replace('_', ' ').toUpperCase()}
                </span>
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">
                  {lead.status?.toUpperCase()}
                </span>
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                  {lead.source?.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">{lead.customer_name}</h3>
                  <div className="flex items-center gap-4 mt-1 flex-wrap">
                    <p className="text-sm text-gray-600">📞 {lead.phone}</p>
                    {lead.email && <p className="text-sm text-gray-600">📧 {lead.email}</p>}
                    {lead.company && <p className="text-sm text-gray-600">🏢 {lead.company}</p>}
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 flex-wrap gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">Lead Score:</span>
                    <div className="flex items-center space-x-1">
                      <div className={`h-2 w-16 bg-gray-200 rounded-full overflow-hidden`}>
                        <div className={`h-full ${getScoreBadge(lead.lead_score || 0)}`} style={{width: `${lead.lead_score || 0}%`}}></div>
                      </div>
                      <span className="text-xs font-semibold text-gray-700">{lead.lead_score || 0}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">ICP Match:</span>
                    <div className="flex items-center space-x-1">
                      <div className={`h-2 w-16 bg-gray-200 rounded-full overflow-hidden`}>
                        <div className={`h-full ${getScoreBadge(lead.icp_match_score || 0)}`} style={{width: `${lead.icp_match_score || 0}%`}}></div>
                      </div>
                      <span className="text-xs font-semibold text-gray-700">{lead.icp_match_score || 0}</span>
                    </div>
                  </div>
                </div>
                
                {(lead.product_interest || lead.budget_range) && (
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 space-y-1">
                    {lead.product_interest && (
                      <p className="text-sm text-gray-700"><span className="font-semibold">🛒 Product:</span> {lead.product_interest}</p>
                    )}
                    {lead.budget_range && (
                      <p className="text-sm text-gray-700"><span className="font-semibold">💰 Budget:</span> {lead.budget_range}</p>
                    )}
                  </div>
                )}
                
                {(lead.campaign_type || lead.campaign_context) && (
                  <div className="bg-purple-50 border border-purple-100 rounded-lg p-3 space-y-1">
                    {lead.campaign_type && (
                      <p className="text-sm text-gray-700"><span className="font-semibold">📢 Campaign:</span> {lead.campaign_type.replace('_', ' ')}</p>
                    )}
                    {lead.campaign_context && (
                      <div className="text-xs text-gray-600">
                        {lead.campaign_context.offer && <p>• Offer: {lead.campaign_context.offer}</p>}
                        {lead.campaign_context.valid_till && <p>• Valid till: {new Date(lead.campaign_context.valid_till).toLocaleDateString()}</p>}
                      </div>
                    )}
                  </div>
                )}
                
                {(lead.engagement_score > 0 || lead.past_purchases_count > 0 || lead.total_spent > 0) && (
                  <div className="text-xs text-gray-600 bg-blue-50 border border-blue-100 px-3 py-2 rounded-lg">
                    <span className="font-semibold">📊 Engagement:</span> {lead.engagement_score}/100 | 
                    <span className="ml-2">Past Purchases: {lead.past_purchases_count || 0}</span> | 
                    <span className="ml-2">Total Spent: ₹{(lead.total_spent || 0).toLocaleString()}</span>
                  </div>
                )}
                
                {lead.call_count > 0 && (
                  <div className="text-xs text-gray-600 bg-green-50 border border-green-100 px-3 py-2 rounded-lg space-y-1">
                    <div>
                      <span className="font-semibold">📞 Call History:</span> {lead.call_count} call{lead.call_count > 1 ? 's' : ''}
                    </div>
                    {lead.last_call_date && (
                      <div>Last Call: {new Date(lead.last_call_date).toLocaleDateString()} {new Date(lead.last_call_date).toLocaleTimeString()}</div>
                    )}
                    {lead.call_outcome && (
                      <div>
                        Outcome: <span className={`font-semibold ${
                          lead.call_outcome === 'interested' ? 'text-green-600' :
                          lead.call_outcome === 'not_interested' ? 'text-red-600' :
                          lead.call_outcome === 'callback' ? 'text-yellow-600' :
                          lead.call_outcome === 'busy' ? 'text-orange-600' :
                          lead.call_outcome === 'no_answer' ? 'text-gray-600' :
                          'text-gray-600'
                        }`}>
                          {lead.call_outcome.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="text-xs text-gray-600 bg-gray-50 border border-gray-100 px-3 py-2 rounded-lg space-y-1">
                  {lead.last_interaction_date && (
                    <div>📅 Last Interaction: {new Date(lead.last_interaction_date).toLocaleDateString()} {new Date(lead.last_interaction_date).toLocaleTimeString()}</div>
                  )}
                  {lead.follow_up_date && (
                    <div className="text-orange-700 font-semibold">⏰ Follow-up: {new Date(lead.follow_up_date).toLocaleDateString()}</div>
                  )}
                  <div>🕒 Created: {new Date(lead.created_at).toLocaleDateString()} {new Date(lead.created_at).toLocaleTimeString()}</div>
                </div>
                
                {lead.assigned_to && (
                  <div className="text-sm text-gray-700 bg-yellow-50 border border-yellow-100 px-3 py-2 rounded-lg">
                    <span className="font-semibold">👤 Assigned to:</span> {lead.assigned_to}
                  </div>
                )}
                
                {lead.notes && (
                  <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                    <p className="text-sm text-gray-700"><span className="font-semibold">📝 Notes:</span> {lead.notes}</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-col items-end space-y-2 ml-4">
              <span className="text-xs text-gray-500 font-medium">
                ID: {lead._id?.slice(-6)}
              </span>
              
              <button
                onClick={() => handleMakeOutboundCall(lead)}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-lg transition flex items-center space-x-2 shadow-sm"
              >
                <span>📞</span>
                <span>Call Now</span>
              </button>
            </div>
          </div>
        </div>
      );
    };
    
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">Create Sales Campaign</h3>
              <p className="text-sm text-purple-100">Launch outbound calling campaign for lead qualification</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={fetchAllData}
                className="px-4 py-2 bg-white/20 text-white font-semibold rounded-lg hover:bg-white/30 transition flex items-center space-x-2"
              >
                <span>🔄</span>
                <span>Refresh</span>
              </button>
              <button
                onClick={() => setShowCreateLeadModal(true)}
                className="px-4 py-2 bg-white text-purple-600 font-semibold rounded-lg hover:bg-purple-50 transition flex items-center space-x-2"
              >
                <span>➕</span>
                <span>Create Lead</span>
              </button>
              <button
                onClick={() => setShowCampaignModal(true)}
                className="px-4 py-2 bg-white text-purple-600 font-semibold rounded-lg hover:bg-purple-50 transition"
              >
                + New Campaign
              </button>
            </div>
          </div>
        </div>
        
        {highPriority.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <span className="mr-2">🔥</span>
              High Priority Leads ({highPriority.length})
            </h3>
            <div className="space-y-3">
              {highPriority.map(lead => <LeadCard key={lead._id} lead={lead} />)}
            </div>
          </div>
        )}
        
        {qualified.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <span className="mr-2">✅</span>
              Qualified Leads ({qualified.length})
            </h3>
            <div className="space-y-3">
              {qualified.map(lead => <LeadCard key={lead._id} lead={lead} />)}
            </div>
          </div>
        )}
        
        {unqualified.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <span className="mr-2">⏳</span>
              Unqualified Leads ({unqualified.length})
            </h3>
            <div className="space-y-3">
              {unqualified.map(lead => <LeadCard key={lead._id} lead={lead} />)}
            </div>
          </div>
        )}
      </div>
    );
  };

  const tabs=[
    { id: 'customers', label: 'Customers', icon: FiUsers, count: customers.length },
    { id: 'appointments', label: 'Appointments', icon: FiCalendar, count: appointments.length },
    { id: 'warranties', label: 'Warranties', icon: FiShield, count: warranties.length },
    { id: 'transcripts', label: 'Transcripts', icon: FiMessageSquare, count: transcripts.length },
    { id: 'leads', label: 'Sales Leads', icon: FiTrendingUp, count: salesLeads.length }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
              <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                ADMIN
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/home')}
                className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                <FiHome size={18} />
                <span>Home</span>
              </button>
              <button
                onClick={() => { logout(); navigate('/login'); }}
                className="flex items-center space-x-2 px-4 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
              >
                <FiLogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          {tabs.map((tab) => (
            <div key={tab.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">{tab.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{tab.count}</p>
                </div>
                <tab.icon className="text-green-600" size={24} />
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 font-medium text-sm transition ${
                    activeTab === tab.id
                      ? 'text-green-600 border-b-2 border-green-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <tab.icon size={18} />
                  <span>{tab.label}</span>
                  <span className="px-2 py-0.5 bg-gray-100 text-xs rounded-full">{tab.count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
              {activeTab === 'appointments' && (
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">All Status</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              )}
              <button
                onClick={fetchAllData}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-medium"
              >
                Refresh
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading data...</p>
              </div>
            ) : (
              <>
                {activeTab === 'customers' && renderCustomers()}
                {activeTab === 'appointments' && renderAppointments()}
                {activeTab === 'warranties' && renderWarranties()}
                {activeTab === 'transcripts' && renderTranscripts()}
                {activeTab === 'leads' && renderSalesLeads()}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Create Lead Modal - Continuing in next part due to length */}
    </div>
  );
};

export default AdminPanel;
