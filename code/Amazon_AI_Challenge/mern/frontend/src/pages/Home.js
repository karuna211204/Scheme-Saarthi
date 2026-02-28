import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AIAgentButton from '../components/AIAgentButton';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleSearch = () => {
        if (searchQuery.trim()) {
            navigate(`/my-schemes?search=${encodeURIComponent(searchQuery)}`);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-text-light dark:text-text-dark min-h-screen flex flex-col overflow-x-hidden selection:bg-primary selection:text-black antialiased">
            <header className="w-full border-b border-[#e6e6db] dark:border-[#3a3928] bg-surface-light/90 dark:bg-surface-dark/90 backdrop-blur-xl sticky top-0 z-40 transition-all duration-300">
                <div className="max-w-[1440px] mx-auto px-6 h-20 flex items-center justify-between">
                    <Link className="flex items-center gap-3 group" to="/home">
                        <div className="flex items-center justify-center size-10 rounded-full bg-primary text-black transition-transform group-hover:scale-110">
                            <span className="material-symbols-outlined">account_balance</span>
                        </div>
                        <h2 className="text-xl font-bold tracking-tight">Scheme Saarthi</h2>
                    </Link>
                    <nav className="hidden md:flex items-center gap-1">
                        <Link className="px-4 py-2 rounded-full text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors" to="/applications">My Applications</Link>
                        <Link className="px-4 py-2 rounded-full text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors" to="/track-status">Track Status</Link>
                        <Link className="px-4 py-2 rounded-full text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors" to="/my-schemes">My Schemes</Link>
                    </nav>
                    <div className="flex items-center gap-4">
                        <button className="hidden md:flex items-center justify-center size-10 rounded-full border border-[#e6e6db] dark:border-[#3a3928] hover:bg-surface-light dark:hover:bg-surface-dark transition-colors">
                            <span className="material-symbols-outlined">notifications</span>
                        </button>
                        {user ? (
                            <button onClick={() => navigate('/profile')} className="flex items-center gap-2 pl-1 pr-1 md:pr-4 py-1 rounded-full border border-transparent md:border-[#e6e6db] md:dark:border-[#3a3928] hover:border-primary/50 transition-colors">
                                <img src={user.picture} alt={user.name} className="size-8 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden" />
                                <span className="hidden md:block text-sm font-medium">Account</span>
                            </button>
                        ) : (
                            <button onClick={() => navigate('/login')} className="flex items-center gap-2 pl-1 pr-1 md:pr-4 py-1 rounded-full border border-transparent md:border-[#e6e6db] md:dark:border-[#3a3928] hover:border-primary/50 transition-colors">
                                <div className="size-8 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                    <span className="material-symbols-outlined text-gray-400 w-full h-full flex items-center justify-center">person</span>
                                </div>
                                <span className="hidden md:block text-sm font-medium">Account</span>
                            </button>
                        )}
                    </div>
                </div>
            </header>
            <main className="flex-grow flex flex-col items-center w-full">
                <section className="w-full max-w-[1280px] px-4 sm:px-6 pt-8 pb-8 md:pt-16 md:pb-12 flex flex-col items-center">
                    <div className="relative w-full overflow-hidden rounded-2xl bg-surface-dark/5 dark:bg-surface-light/5 shadow-sm p-8 md:p-20 flex flex-col items-center text-center gap-8 transition-colors duration-300">
                        <div className="absolute inset-0 opacity-15 dark:opacity-25 pointer-events-none mix-blend-overlay" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAM3ibH7OfQyd3Ae7UvDfFbQRSnuadc9b2uXXsAF8ktNxScB2mnsNOBFpjWMtFCyJIvSvxfxMGeiPu3YOBKCoo5fXV5fyF7MMDHt7nmpcQnWap-E5wvMS7VMe9XcJ4GubBv9sSyn8pKtPk3-ObYQl1zmoHnk6KeI-HppQGV8HxTG7G3K4q8CB6FbWh8z5qI1eXKCfGfrS_Cm_4euOwqaiUft9622Nuvi7grCuh0rgajJXFB8uJa9qL7rm1K0pPn_BBiUZI1F4PvLg')" }}></div>
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface-light/50 to-surface-light/80 dark:via-surface-dark/50 dark:to-surface-dark/80 pointer-events-none"></div>
                        <div className="relative z-10 flex flex-col items-center gap-6 max-w-3xl animate-fade-in-up">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur border border-black/5 dark:border-white/10 shadow-sm">
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                                </span>
                                <p className="text-[11px] font-bold uppercase tracking-wider text-[#5c5b4f] dark:text-[#cbcb9c]">
                                    AI Agents Online
                                </p>
                            </div>
                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight text-text-light dark:text-white drop-shadow-sm">
                                Government Schemes <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-text-light to-gray-500 dark:from-white dark:to-gray-400">For Everyone</span>
                            </h1>
                            <h2 className="text-lg md:text-xl text-[#5c5b4f] dark:text-[#cbcb9c] font-normal leading-relaxed max-w-xl">
                                Discover ₹50,000+ Crores in unclaimed benefits. Voice-first AI assistance in multiple languages. 1000+ schemes at your fingertips.
                            </h2>
                        </div>
                        <div className="relative z-10 w-full max-w-[640px] mt-2 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                            <label className="relative flex items-center h-16 md:h-20 w-full rounded-full shadow-xl bg-surface-light dark:bg-surface-dark border border-[#e6e6db] dark:border-[#3a3928] group focus-within:ring-4 ring-primary/20 transition-all duration-300 overflow-hidden transform hover:-translate-y-0.5">
                                <div className="pl-6 md:pl-8 pr-4 text-[#8c8b5f] flex items-center justify-center">
                                    <span className="material-symbols-outlined text-2xl">search</span>
                                </div>
                                <input 
                                    className="w-full h-full bg-transparent border-none text-text-light dark:text-text-dark placeholder:text-[#8c8b5f]/70 focus:ring-0 text-base md:text-lg font-medium" 
                                    placeholder="Search schemes: farmers, education, health... (e.g., 'PM-KISAN')" 
                                    type="text" 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                />
                                <div className="pr-2 md:pr-3">
                                    <button 
                                        onClick={handleSearch}
                                        className="h-12 md:h-14 px-6 md:px-8 rounded-full bg-primary hover:bg-primary-hover text-black font-bold text-sm md:text-base transition-colors flex items-center justify-center shadow-sm"
                                    >
                                        Search Schemes
                                    </button>
                                </div>
                            </label>
                        </div>
                    </div>
                </section>
                <section className="w-full max-w-[1000px] px-6 pb-12">
                    <div className="flex flex-col items-center gap-8">
                        <p className="text-xs font-bold text-[#8c8b5f] dark:text-[#8c8b5f] uppercase tracking-[0.2em]">Choose Scheme Category</p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link to="/my-schemes?category=agriculture" className="group">
                                <div className="flex flex-col items-center justify-center gap-3 w-32 h-32 rounded-2xl border-2 border-[#e6e6db] dark:border-[#3a3928] bg-surface-light dark:bg-surface-dark hover:border-primary hover:bg-primary/5 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg">
                                    <span className="material-symbols-outlined text-4xl text-[#5c5b4f] dark:text-[#cbcb9c] group-hover:text-primary transition-colors">agriculture</span>
                                    <span className="text-sm font-semibold text-text-light dark:text-text-dark">Agriculture</span>
                                </div>
                            </Link>
                            <Link to="/my-schemes?category=education" className="group">
                                <div className="flex flex-col items-center justify-center gap-3 w-32 h-32 rounded-2xl border-2 border-[#e6e6db] dark:border-[#3a3928] bg-surface-light dark:bg-surface-dark hover:border-primary hover:bg-primary/5 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg">
                                    <span className="material-symbols-outlined text-4xl text-[#5c5b4f] dark:text-[#cbcb9c] group-hover:text-primary transition-colors">school</span>
                                    <span className="text-sm font-semibold text-text-light dark:text-text-dark">Education</span>
                                </div>
                            </Link>
                            <Link to="/my-schemes?category=health" className="group">
                                <div className="flex flex-col items-center justify-center gap-3 w-32 h-32 rounded-2xl border-2 border-[#e6e6db] dark:border-[#3a3928] bg-surface-light dark:bg-surface-dark hover:border-primary hover:bg-primary/5 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg">
                                    <span className="material-symbols-outlined text-4xl text-[#5c5b4f] dark:text-[#cbcb9c] group-hover:text-primary transition-colors">health_and_safety</span>
                                    <span className="text-sm font-semibold text-text-light dark:text-text-dark">Health</span>
                                </div>
                            </Link>
                            <Link to="/my-schemes?category=housing" className="group">
                                <div className="flex flex-col items-center justify-center gap-3 w-32 h-32 rounded-2xl border-2 border-[#e6e6db] dark:border-[#3a3928] bg-surface-light dark:bg-surface-dark hover:border-primary hover:bg-primary/5 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg">
                                    <span className="material-symbols-outlined text-4xl text-[#5c5b4f] dark:text-[#cbcb9c] group-hover:text-primary transition-colors">home</span>
                                    <span className="text-sm font-semibold text-text-light dark:text-text-dark">Housing</span>
                                </div>
                            </Link>
                            <Link to="/my-schemes?category=pension" className="group">
                                <div className="flex flex-col items-center justify-center gap-3 w-32 h-32 rounded-2xl border-2 border-[#e6e6db] dark:border-[#3a3928] bg-surface-light dark:bg-surface-dark hover:border-primary hover:bg-primary/5 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg">
                                    <span className="material-symbols-outlined text-4xl text-[#5c5b4f] dark:text-[#cbcb9c] group-hover:text-primary transition-colors">elderly</span>
                                    <span className="text-sm font-semibold text-text-light dark:text-text-dark">Pension</span>
                                </div>
                            </Link>
                            <Link to="/my-schemes" className="group">
                                <div className="flex flex-col items-center justify-center gap-3 w-32 h-32 rounded-2xl border-2 border-[#e6e6db] dark:border-[#3a3928] bg-surface-light dark:bg-surface-dark hover:border-primary hover:bg-primary/5 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg">
                                    <span className="material-symbols-outlined text-4xl text-[#5c5b4f] dark:text-[#cbcb9c] group-hover:text-primary transition-colors">more_horiz</span>
                                    <span className="text-sm font-semibold text-text-light dark:text-text-dark">View All</span>
                                </div>
                            </Link>
                        </div>
                    </div>
                </section>
                <section className="w-full max-w-[1280px] px-6 pb-24">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="group p-8 rounded-2xl border-2 border-[#e6e6db] dark:border-[#3a3928] bg-surface-light dark:bg-surface-dark hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white mb-6 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-3xl">psychology</span>
                            </div>
                            <h3 className="text-xl font-bold text-text-light dark:text-text-dark mb-3">Eligibility Check</h3>
                            <p className="text-sm text-[#5c5b4f] dark:text-[#cbcb9c] leading-relaxed">
                                Instantly find out which schemes you're eligible for with AI assistance. Speak or type in English.
                            </p>
                        </div>

                        <div className="group p-8 rounded-2xl border-2 border-[#e6e6db] dark:border-[#3a3928] bg-surface-light dark:bg-surface-dark hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 text-white mb-6 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-3xl">videocam</span>
                            </div>
                            <h3 className="text-xl font-bold text-text-light dark:text-text-dark mb-3">Voice Consultation</h3>
                            <p className="text-sm text-[#5c5b4f] dark:text-[#cbcb9c] leading-relaxed">
                                Talk in multiple languages. Expert assistance available to help you understand schemes.
                            </p>
                        </div>

                        <div className="group p-8 rounded-2xl border-2 border-[#e6e6db] dark:border-[#3a3928] bg-surface-light dark:bg-surface-dark hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-white mb-6 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-3xl">shield</span>
                            </div>
                            <h3 className="text-xl font-bold text-text-light dark:text-text-dark mb-3">Application Tracking</h3>
                            <p className="text-sm text-[#5c5b4f] dark:text-[#cbcb9c] leading-relaxed">
                                Track all your scheme applications in one place. Get status updates via SMS.
                            </p>
                        </div>

                        <div className="group p-8 rounded-2xl border-2 border-[#e6e6db] dark:border-[#3a3928] bg-surface-light dark:bg-surface-dark hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500 to-yellow-600 text-white mb-6 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-3xl">calendar_today</span>
                            </div>
                            <h3 className="text-xl font-bold text-text-light dark:text-text-dark mb-3">Document Assistance</h3>
                            <p className="text-sm text-[#5c5b4f] dark:text-[#cbcb9c] leading-relaxed">
                                Help with Aadhaar, bank accounts, land records - we'll assist you. Automated with Textract OCR.
                            </p>
                        </div>

                        <div className="group p-8 rounded-2xl border-2 border-[#e6e6db] dark:border-[#3a3928] bg-surface-light dark:bg-surface-dark hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 text-white mb-6 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-3xl">history</span>
                            </div>
                            <h3 className="text-xl font-bold text-text-light dark:text-text-dark mb-3">Scheme History</h3>
                            <p className="text-sm text-[#5c5b4f] dark:text-[#cbcb9c] leading-relaxed">
                                Previous conversations, applications, benefits - all in one place. View complete records.
                            </p>
                        </div>

                        <div className="group p-8 rounded-2xl border-2 border-[#e6e6db] dark:border-[#3a3928] bg-surface-light dark:bg-surface-dark hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white mb-6 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-3xl">pace</span>
                            </div>
                            <h3 className="text-xl font-bold text-text-light dark:text-text-dark mb-3">24/7 Available</h3>
                            <p className="text-sm text-[#5c5b4f] dark:text-[#cbcb9c] leading-relaxed">
                                AI assistant always available. Get help whenever you need. No charges.
                            </p>
                        </div>
                    </div>
                </section>
            </main>
            <footer className="w-full border-t border-[#e6e6db] dark:border-[#3a3928] bg-surface-light dark:bg-surface-dark py-10">
                <div className="max-w-[1280px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-gray-400">account_balance</span>
                        <span className="text-sm font-bold text-text-light dark:text-text-dark">Scheme Saarthi</span>
                    </div>
                    <div className="flex gap-8">
                        <a className="text-sm text-[#8c8b5f] hover:text-black dark:hover:text-white transition-colors" href="#">Privacy Policy</a>
                        <a className="text-sm text-[#8c8b5f] hover:text-black dark:hover:text-white transition-colors" href="#">Terms of Service</a>
                        <a className="text-sm text-[#8c8b5f] hover:text-black dark:hover:text-white transition-colors" href="#">Contact Support</a>
                    </div>
                    <p className="text-xs text-[#8c8b5f]">© 2026 Scheme Saarthi - Empowering Rural India</p>
                </div>
            </footer>
            <AIAgentButton />
        </div>
    );
};

export default Home;
