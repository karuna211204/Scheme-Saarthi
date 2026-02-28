import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useSearchParams } from 'react-router-dom';
import SchemeService from '../services/SchemeService';

const MySchemes = () => {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const [schemes, setSchemes] = useState([]);
    const [categories, setCategories] = useState([]);
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        current: 1,
        total: 1,
        count: 0,
        totalSchemes: 0
    });

    // Load categories on component mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await SchemeService.getCategories();
                if (response.success) {
                    setCategories(response.data);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        
        fetchCategories();
    }, []);

    // Load schemes when component mounts or search parameters change
    useEffect(() => {
        const fetchSchemes = async () => {
            setLoading(true);
            setError(null);
            
            try {
                const params = {
                    query: searchQuery,
                    category: selectedCategory,
                    page: 1,
                    limit: 50 // Fetch more schemes for better user experience
                };

                const response = await SchemeService.getSchemes(params);
                
                if (response.success) {
                    setSchemes(response.data.schemes);
                    setPagination(response.data.pagination);
                } else {
                    setError('Failed to fetch schemes');
                }
            } catch (error) {
                console.error('Error fetching schemes:', error);
                setError('Failed to connect to server. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchSchemes();
    }, [searchQuery, selectedCategory]);

    // Update URL when filters change
    useEffect(() => {
        const params = new URLSearchParams();
        if (searchQuery) params.set('search', searchQuery);
        if (selectedCategory !== 'all') params.set('category', selectedCategory);
        
        setSearchParams(params);
    }, [searchQuery, selectedCategory, setSearchParams]);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
    };

    const formatBenefit = (benefit) => {
        if (typeof benefit === 'string') return benefit;
        if (typeof benefit === 'object' && benefit.amount) {
            return `₹${benefit.amount}${benefit.period ? `/${benefit.period}` : ''}`;
        }
        return 'Various benefits available';
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-primary mb-4"></div>
                    <p className="text-text-light/60 dark:text-text-dark/60">Loading schemes...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-100 dark:bg-red-900/30 mb-6">
                        <span className="material-symbols-outlined text-6xl text-red-500">error</span>
                    </div>
                    <h3 className="text-2xl font-semibold text-text-light dark:text-text-dark mb-2">Error Loading Schemes</h3>
                    <p className="text-text-light/60 dark:text-text-dark/60 mb-8">{error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="inline-block px-6 py-3 bg-primary hover:bg-primary-hover text-black font-semibold rounded-lg transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark">{/* Header */}
            <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 dark:from-indigo-500/10 dark:to-purple-500/10 border-b border-border-light dark:border-border-dark">
                <div className="max-w-7xl mx-auto px-6 py-12">
                    <div className="flex items-center gap-4 mb-4">
                        <Link to="/home" className="text-text-light dark:text-text-dark hover:text-primary transition-colors">
                            <span className="material-symbols-outlined">arrow_back</span>
                        </Link>
                        <h1 className="text-4xl font-bold text-text-light dark:text-text-dark">Government Schemes</h1>
                    </div>
                    <p className="text-text-light/70 dark:text-text-dark/70">Discover government schemes designed for your needs</p>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="mb-8 space-y-4">
                    {/* Search Bar */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="material-symbols-outlined text-gray-400">search</span>
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            placeholder="Search schemes (e.g., farmer, education, health)..."
                            className="block w-full pl-10 pr-4 py-3 border border-border-light dark:border-border-dark rounded-lg bg-surface-light dark:bg-surface-dark text-text-light dark:text-text-dark placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>

                    {/* Category Filters */}
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => handleCategoryChange('all')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                selectedCategory === 'all'
                                    ? 'bg-primary text-black'
                                    : 'bg-surface-light dark:bg-surface-dark text-text-light dark:text-text-dark hover:bg-primary/10'
                            }`}
                        >
                            All Categories
                        </button>
                        {categories.map((category) => (
                            <button
                                key={category.name}
                                onClick={() => handleCategoryChange(category.name)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                                    selectedCategory === category.name
                                        ? 'bg-primary text-black'
                                        : 'bg-surface-light dark:bg-surface-dark text-text-light dark:text-text-dark hover:bg-primary/10'
                                }`}
                            >
                                {category.displayName} ({category.count})
                            </button>
                        ))}
                    </div>
                </div>

                {/* Results */}
                <div className="space-y-6">
                    {schemes.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 mb-6">
                                <span className="material-symbols-outlined text-6xl text-gray-400">search_off</span>
                            </div>
                            <h3 className="text-2xl font-semibold text-text-light dark:text-text-dark mb-2">No schemes found</h3>
                            <p className="text-text-light/60 dark:text-text-dark/60 mb-8">
                                {searchQuery ? `No schemes match "${searchQuery}"` : 'No schemes available for the selected category'}
                            </p>
                            <button 
                                onClick={() => {setSearchQuery(''); setSelectedCategory('all');}}
                                className="inline-block px-6 py-3 bg-primary hover:bg-primary-hover text-black font-semibold rounded-lg transition-colors"
                            >
                                Clear Filters
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="mb-4">
                                <p className="text-text-light/60 dark:text-text-dark/60">
                                    Found {pagination.totalSchemes} scheme{pagination.totalSchemes !== 1 ? 's' : ''}
                                    {searchQuery && ` matching "${searchQuery}"`}
                                    {selectedCategory !== 'all' && ` in ${selectedCategory}`}
                                </p>
                            </div>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {schemes.map((scheme) => (
                                    <div key={scheme.id} className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-border-light dark:border-border-dark overflow-hidden hover:shadow-lg transition-shadow">
                                        <div className="p-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="inline-block px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full capitalize">
                                                            {scheme.category}
                                                        </span>
                                                        <span className="inline-block px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                                                            {scheme.status === 'active' ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </div>
                                                    <h3 className="text-xl font-semibold text-text-light dark:text-text-dark mb-2">
                                                        {scheme.name}
                                                    </h3>
                                                    <p className="text-text-light/70 dark:text-text-dark/70 text-sm mb-3">
                                                        {scheme.objective}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Key Benefits */}
                                            {scheme.benefits && scheme.benefits.length > 0 && (
                                                <div className="mb-4">
                                                    <p className="text-xs uppercase tracking-wide font-medium text-text-light/60 dark:text-text-dark/60 mb-2">
                                                        Key Benefit
                                                    </p>
                                                    <div className="bg-primary/5 rounded-lg p-3">
                                                        <p className="text-primary font-semibold">
                                                            {formatBenefit(scheme.benefits[0])}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Basic Eligibility */}
                                            {scheme.eligibility && scheme.eligibility.length > 0 && (
                                                <div className="mb-4">
                                                    <p className="text-xs uppercase tracking-wide font-medium text-text-light/60 dark:text-text-dark/60 mb-2">
                                                        Basic Eligibility
                                                    </p>
                                                    <p className="text-sm text-text-light dark:text-text-dark">
                                                        {Array.isArray(scheme.eligibility) ? scheme.eligibility[0] : scheme.eligibility}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Action Buttons */}
                                            <div className="flex gap-3 pt-4 border-t border-border-light dark:border-border-dark">
                                                <Link 
                                                    to={`/scheme-details/${scheme.id}`}
                                                    className="flex-1 px-4 py-2 bg-primary hover:bg-primary-hover text-black font-medium rounded-lg transition-colors text-center"
                                                >
                                                    View Details
                                                </Link>
                                                <button className="px-4 py-2 border border-border-light dark:border-border-dark text-text-light dark:text-text-dark hover:bg-surface-dark dark:hover:bg-surface-light rounded-lg transition-colors">
                                                    Apply Now
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MySchemes;
