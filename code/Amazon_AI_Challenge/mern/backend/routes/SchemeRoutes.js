const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Load schemes data
const getSchemesData = () => {
    try {
        const dataPath = path.join(__dirname, '../data/schemes.json');
        const data = fs.readFileSync(dataPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading schemes data:', error);
        return { schemes: [], categories: [], ministries: [] };
    }
};

// Helper function to search schemes
const searchSchemes = (schemes, query, category, ministry) => {
    let filtered = [...schemes];

    // Filter by category
    if (category && category !== 'all') {
        filtered = filtered.filter(scheme => 
            scheme.category.toLowerCase() === category.toLowerCase()
        );
    }

    // Filter by ministry
    if (ministry && ministry !== 'all') {
        filtered = filtered.filter(scheme => 
            scheme.ministry.toLowerCase().includes(ministry.toLowerCase())
        );
    }

    // Filter by search query
    if (query && query.trim()) {
        const searchTerm = query.toLowerCase().trim();
        filtered = filtered.filter(scheme => {
            const searchableText = [
                scheme.name,
                scheme.objective,
                scheme.category,
                scheme.ministry,
                ...scheme.eligibility,
                ...scheme.benefits.map(b => b.description || ''),
                ...scheme.documents,
                ...scheme.applicationProcess
            ].join(' ').toLowerCase();

            return searchableText.includes(searchTerm);
        });
    }

    return filtered;
};

// GET /api/schemes - Get all schemes or search schemes
router.get('/', (req, res) => {
    try {
        const { query, category, ministry, page = 1, limit = 20 } = req.query;
        const data = getSchemesData();
        
        // Search/filter schemes
        let schemes = searchSchemes(data.schemes, query, category, ministry);
        
        // Pagination
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const startIndex = (pageNum - 1) * limitNum;
        const endIndex = startIndex + limitNum;
        
        const totalSchemes = schemes.length;
        const paginatedSchemes = schemes.slice(startIndex, endIndex);
        
        res.json({
            success: true,
            data: {
                schemes: paginatedSchemes,
                pagination: {
                    current: pageNum,
                    total: Math.ceil(totalSchemes / limitNum),
                    count: paginatedSchemes.length,
                    totalSchemes: totalSchemes
                },
                filters: {
                    query: query || '',
                    category: category || 'all',
                    ministry: ministry || 'all'
                }
            }
        });
    } catch (error) {
        console.error('Error fetching schemes:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// POST /api/schemes/search - Search schemes (for compatibility)
router.post('/search', (req, res) => {
    try {
        const { query, category, ministry, page = 1, limit = 20 } = req.body;
        const data = getSchemesData();
        
        // Search/filter schemes
        let schemes = searchSchemes(data.schemes, query, category, ministry);
        
        // Pagination
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const startIndex = (pageNum - 1) * limitNum;
        const endIndex = startIndex + limitNum;
        
        const totalSchemes = schemes.length;
        const paginatedSchemes = schemes.slice(startIndex, endIndex);
        
        res.json({
            success: true,
            data: {
                schemes: paginatedSchemes,
                pagination: {
                    current: pageNum,
                    total: Math.ceil(totalSchemes / limitNum),
                    count: paginatedSchemes.length,
                    totalSchemes: totalSchemes
                },
                filters: {
                    query: query || '',
                    category: category || 'all',
                    ministry: ministry || 'all'
                }
            }
        });
    } catch (error) {
        console.error('Error searching schemes:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// GET /api/schemes/:id - Get specific scheme by ID
router.get('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const data = getSchemesData();
        
        const scheme = data.schemes.find(s => s.id === id);
        
        if (!scheme) {
            return res.status(404).json({
                success: false,
                message: 'Scheme not found'
            });
        }
        
        res.json({
            success: true,
            data: scheme
        });
    } catch (error) {
        console.error('Error fetching scheme:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// GET /api/schemes/category/:category - Get schemes by category
router.get('/category/:category', (req, res) => {
    try {
        const { category } = req.params;
        const { page = 1, limit = 20 } = req.query;
        const data = getSchemesData();
        
        let schemes = data.schemes.filter(scheme => 
            scheme.category.toLowerCase() === category.toLowerCase()
        );
        
        // Pagination
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const startIndex = (pageNum - 1) * limitNum;
        const endIndex = startIndex + limitNum;
        
        const totalSchemes = schemes.length;
        const paginatedSchemes = schemes.slice(startIndex, endIndex);
        
        res.json({
            success: true,
            data: {
                schemes: paginatedSchemes,
                category: category,
                pagination: {
                    current: pageNum,
                    total: Math.ceil(totalSchemes / limitNum),
                    count: paginatedSchemes.length,
                    totalSchemes: totalSchemes
                }
            }
        });
    } catch (error) {
        console.error('Error fetching schemes by category:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// GET /api/schemes/meta/categories - Get all categories
router.get('/meta/categories', (req, res) => {
    try {
        const data = getSchemesData();
        
        // Get unique categories with counts
        const categoryStats = data.categories.map(category => {
            const count = data.schemes.filter(scheme => 
                scheme.category === category
            ).length;
            
            return {
                name: category,
                count: count,
                displayName: category.charAt(0).toUpperCase() + category.slice(1)
            };
        });
        
        res.json({
            success: true,
            data: categoryStats
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// GET /api/schemes/meta/statistics - Get overall statistics
router.get('/meta/statistics', (req, res) => {
    try {
        const data = getSchemesData();
        
        const stats = {
            totalSchemes: data.schemes.length,
            totalCategories: data.categories.length,
            totalMinistries: data.ministries.length,
            activeSchemes: data.schemes.filter(scheme => scheme.status === 'active').length,
            categoryBreakdown: data.categories.map(category => ({
                category: category,
                count: data.schemes.filter(scheme => scheme.category === category).length
            })),
            recentlyLaunched: data.schemes
                .sort((a, b) => new Date(b.launchDate) - new Date(a.launchDate))
                .slice(0, 5)
                .map(scheme => ({
                    id: scheme.id,
                    name: scheme.name,
                    launchDate: scheme.launchDate,
                    category: scheme.category
                }))
        };
        
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

module.exports = router;
