const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

class SchemeService {
    // Get all schemes with optional search and filters
    static async getSchemes(params = {}) {
        try {
            const queryString = new URLSearchParams();
            
            if (params.query) queryString.append('query', params.query);
            if (params.category && params.category !== 'all') queryString.append('category', params.category);
            if (params.ministry && params.ministry !== 'all') queryString.append('ministry', params.ministry);
            if (params.page) queryString.append('page', params.page);
            if (params.limit) queryString.append('limit', params.limit);
            
            const url = `${API_BASE_URL}/api/schemes${queryString.toString() ? `?${queryString}` : ''}`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching schemes:', error);
            throw error;
        }
    }

    // Search schemes using POST method
    static async searchSchemes(searchParams) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/schemes/search`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(searchParams)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error searching schemes:', error);
            throw error;
        }
    }

    // Get scheme by ID
    static async getSchemeById(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/schemes/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Scheme not found');
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching scheme by ID:', error);
            throw error;
        }
    }

    // Get schemes by category
    static async getSchemesByCategory(category, params = {}) {
        try {
            const queryString = new URLSearchParams();
            
            if (params.page) queryString.append('page', params.page);
            if (params.limit) queryString.append('limit', params.limit);
            
            const url = `${API_BASE_URL}/api/schemes/category/${category}${queryString.toString() ? `?${queryString}` : ''}`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching schemes by category:', error);
            throw error;
        }
    }

    // Get all categories
    static async getCategories() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/schemes/meta/categories`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching categories:', error);
            throw error;
        }
    }

    // Get scheme statistics
    static async getStatistics() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/schemes/meta/statistics`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching statistics:', error);
            throw error;
        }
    }
}

export default SchemeService;