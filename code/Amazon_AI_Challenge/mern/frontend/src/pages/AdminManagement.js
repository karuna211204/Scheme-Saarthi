import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminManagement = () => {
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newAdmin, setNewAdmin] = useState({
        email: '',
        name: '',
        google_id: '',
        phone: ''
    });

    useEffect(() => {
        if (user?.role !== 'admin') {
            navigate('/home');
            return;
        }
        fetchAdmins();
    }, [user, token, navigate]);

    const fetchAdmins = async () => {
        setLoading(true);
        try {
            const headers = { 'Authorization': `Bearer ${token}` };
            const baseUrl = process.env.REACT_APP_BACKEND_URL;
            const response = await fetch(`${baseUrl}/api/auth/admins`, { headers });
            
            if (response.ok) {
                const data = await response.json();
                setAdmins(data.admins || []);
            }
        } catch (err) {
            console.error('Error fetching admins:', err);
        }
        setLoading(false);
    };

    const handleCreateAdmin = async (e) => {
        e.preventDefault();
        try {
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };
            const baseUrl = process.env.REACT_APP_BACKEND_URL;
            const response = await fetch(`${baseUrl}/api/auth/create-admin`, {
                method: 'POST',
                headers,
                body: JSON.stringify(newAdmin)
            });

            if (response.ok) {
                alert('Admin created successfully!');
                setShowAddModal(false);
                setNewAdmin({ email: '', name: '', google_id: '', phone: '' });
                fetchAdmins();
            } else {
                const error = await response.json();
                alert(`Error: ${error.message}`);
            }
        } catch (err) {
            console.error('Error creating admin:', err);
            alert('Failed to create admin');
        }
    };

    const handleRemoveAdmin = async (email) => {
        if (!window.confirm(`Are you sure you want to remove admin access for ${email}?`)) {
            return;
        }

        try {
            const headers = { 'Authorization': `Bearer ${token}` };
            const baseUrl = process.env.REACT_APP_BACKEND_URL;
            const response = await fetch(`${baseUrl}/api/auth/remove-admin/${email}`, {
                method: 'POST',
                headers
            });

            if (response.ok) {
                alert('Admin access removed successfully!');
                fetchAdmins();
            } else {
                const error = await response.json();
                alert(`Error: ${error.message}`);
            }
        } catch (err) {
            console.error('Error removing admin:', err);
            alert('Failed to remove admin');
        }
    };

    if (loading) {
        return <div className="text-center py-8">Loading admin data...</div>;
    }

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-text-light dark:text-text-dark min-h-screen flex flex-col selection:bg-primary selection:text-black">
            <main className="flex-grow w-full max-w-[1440px] mx-auto px-6 py-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Admin Management</h1>
                        <p className="text-[#5c5b4f] dark:text-[#cbcb9c]">
                            Manage administrator accounts and permissions
                        </p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-5 py-2.5 rounded-full bg-primary hover:bg-yellow-300 text-black text-sm font-bold shadow-sm hover:shadow-md transition-all flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        Add Admin
                    </button>
                </div>

                <div className="bg-surface-light dark:bg-surface-dark border border-[#e6e6db] dark:border-[#3a3928] rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-[#f8f8f5] dark:bg-[#23220f] border-b border-[#e6e6db] dark:border-[#3a3928] text-xs uppercase text-[#5c5b4f] dark:text-[#cbcb9c] font-semibold tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Email</th>
                                    <th className="px-6 py-4">Phone</th>
                                    <th className="px-6 py-4">Last Login</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#e6e6db] dark:divide-[#3a3928]">
                                {admins.map(admin => (
                                    <tr key={admin._id} className="hover:bg-[#f8f8f5] dark:hover:bg-[#3a3928]/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-black dark:text-primary font-bold text-xs">
                                                    {admin.name.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <span className="font-semibold">{admin.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">{admin.email}</td>
                                        <td className="px-6 py-4">{admin.phone || 'N/A'}</td>
                                        <td className="px-6 py-4">
                                            {admin.last_login ? new Date(admin.last_login).toLocaleString() : 'Never'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleRemoveAdmin(admin.email)}
                                                disabled={admin.email === user?.email}
                                                className="px-3 py-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-medium hover:bg-red-200 dark:hover:bg-red-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                Remove Admin
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {admins.length === 0 && (
                        <div className="text-center py-12 text-[#8c8b5f]">
                            <span className="material-symbols-outlined text-5xl mb-4 opacity-30">admin_panel_settings</span>
                            <p>No administrators found</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Add Admin Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-6 max-w-md w-full border border-[#e6e6db] dark:border-[#3a3928]">
                        <h2 className="text-xl font-bold mb-4">Add New Admin</h2>
                        <form onSubmit={handleCreateAdmin} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase text-[#8c8b5f] mb-1.5">
                                    Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={newAdmin.name}
                                    onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg bg-background-light dark:bg-background-dark border border-[#e6e6db] dark:border-[#3a3928] focus:ring-2 focus:ring-primary focus:border-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold uppercase text-[#8c8b5f] mb-1.5">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={newAdmin.email}
                                    onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg bg-background-light dark:bg-background-dark border border-[#e6e6db] dark:border-[#3a3928] focus:ring-2 focus:ring-primary focus:border-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold uppercase text-[#8c8b5f] mb-1.5">
                                    Google ID *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={newAdmin.google_id}
                                    onChange={(e) => setNewAdmin({ ...newAdmin, google_id: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg bg-background-light dark:bg-background-dark border border-[#e6e6db] dark:border-[#3a3928] focus:ring-2 focus:ring-primary focus:border-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold uppercase text-[#8c8b5f] mb-1.5">
                                    Phone
                                </label>
                                <input
                                    type="tel"
                                    value={newAdmin.phone}
                                    onChange={(e) => setNewAdmin({ ...newAdmin, phone: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg bg-background-light dark:bg-background-dark border border-[#e6e6db] dark:border-[#3a3928] focus:ring-2 focus:ring-primary focus:border-primary"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 px-4 py-2 rounded-lg border border-[#e6e6db] dark:border-[#3a3928] hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 rounded-lg bg-primary hover:bg-yellow-300 text-black font-bold transition-colors"
                                >
                                    Create Admin
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminManagement;
