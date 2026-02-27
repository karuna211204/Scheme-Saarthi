import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="w-full border-b border-[#e6e6db] dark:border-[#3a3928] bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-md sticky top-0 z-40 transition-colors duration-300">
            <div className="max-w-[1440px] mx-auto px-6 h-20 flex items-center justify-between">
                <Link to={user?.role === 'admin' ? '/dashboard' : '/profile'} className="flex items-center gap-3 group">
                    <div className="flex items-center justify-center size-10 rounded-full bg-black dark:bg-primary text-primary dark:text-black">
                        <span className="material-symbols-outlined">{user?.role === 'admin' ? 'admin_panel_settings' : 'account_balance'}</span>
                    </div>
                    <div className="flex flex-col">
                        <h2 className="text-xl font-bold tracking-tight leading-none">Scheme Saarthi</h2>
                        <span className="text-[10px] uppercase tracking-widest font-semibold opacity-60">{user?.role === 'admin' ? 'Admin Console' : 'नागरिक पोर्टल'}</span>
                    </div>
                </Link>
                {user?.role === 'admin' ? (
                    <nav className="hidden lg:flex items-center gap-1 bg-surface-light dark:bg-black/20 p-1 rounded-full border border-[#e6e6db] dark:border-[#3a3928]">
                        <Link className="px-4 py-2 text-xs font-medium rounded-full text-[#8c8b5f] hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors" to="/dashboard">Dashboard</Link>
                        <Link className="px-4 py-2 text-xs font-medium rounded-full text-[#8c8b5f] hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors" to="/citizens">Citizens</Link>
                        <Link className="px-4 py-2 text-xs font-medium rounded-full text-[#8c8b5f] hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors" to="/consultations">Consultations</Link>
                        <Link className="px-4 py-2 text-xs font-medium rounded-full text-[#8c8b5f] hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors" to="/inquiries">Inquiries</Link>
                        <Link className="px-4 py-2 text-xs font-medium rounded-full text-[#8c8b5f] hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors" to="/transcripts">Transcripts</Link>
                        <Link className="px-4 py-2 text-xs font-medium rounded-full text-[#8c8b5f] hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors" to="/livekit-rooms">Rooms</Link>
                        <Link className="px-4 py-2 text-xs font-medium rounded-full text-[#8c8b5f] hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors" to="/admin-management">Admins</Link>
                    </nav>
                ) : (
                    <nav className="hidden lg:flex items-center gap-1 bg-surface-light dark:bg-black/20 p-1 rounded-full border border-[#e6e6db] dark:border-[#3a3928]">
                        <Link className="px-4 py-2 text-xs font-medium rounded-full text-[#8c8b5f] hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors" to="/profile">My Profile</Link>
                        <Link className="px-4 py-2 text-xs font-medium rounded-full text-[#8c8b5f] hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors" to="/home">Home</Link>
                    </nav>
                )}
                <div className="flex items-center gap-4">
                    <button className="relative p-2 text-[#5c5b4f] dark:text-[#cbcb9c] hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors">
                        <span className="material-symbols-outlined">notifications</span>
                        <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-surface-light dark:border-surface-dark"></span>
                    </button>
                    <div className="h-8 w-[1px] bg-[#e6e6db] dark:bg-[#3a3928]"></div>
                    <div className="relative">
                        <div
                            onClick={() => setShowDropdown(!showDropdown)}
                            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                        >
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold leading-none">{user?.name || 'User'}</p>
                                <p className="text-xs text-[#8c8b5f] capitalize">{user?.role || 'User'}</p>
                            </div>
                            {user?.picture ? (
                                <img
                                    src={user.picture}
                                    alt={user.name}
                                    className="size-10 rounded-full border border-[#e6e6db] dark:border-[#3a3928] object-cover"
                                />
                            ) : (
                                <div className="size-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center overflow-hidden border border-[#e6e6db] dark:border-[#3a3928]">
                                    <span className="material-symbols-outlined text-gray-500 dark:text-gray-400">person</span>
                                </div>
                            )}
                        </div>

                        {showDropdown && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-surface-light dark:bg-surface-dark border border-[#e6e6db] dark:border-[#3a3928] rounded-xl shadow-lg overflow-hidden z-50">
                                <Link
                                    to="/profile"
                                    onClick={() => setShowDropdown(false)}
                                    className="block px-4 py-3 text-sm hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-sm">person</span>
                                    My Profile
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-sm">logout</span>
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
