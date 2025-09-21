export const BASE_URL = 'https://acure-scan-api.abdabdulziza.workers.dev'

export const register = async (name, email, password) => {
    try {
        const response = await fetch(`${BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || data.message || 'Registration failed');
        }

        return data.data;
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
};

export const login = async (email, password) => {
    try {
        const response = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || data.message || 'Login failed');
        }

        // Simpan token dan data user
        if (data.data && data.data.token) {
            localStorage.setItem('userToken', data.data.token);
            localStorage.setItem('userData', JSON.stringify(data.data));
        }

        return data.data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

export const getUserScans = async (userId, token) => {
    try {
        if (!token) {
            token = localStorage.getItem('userToken');
        }

        if (!token) {
            throw new Error('No authentication token available');
        }

        const response = await fetch(`${BASE_URL}/api/scans?userId=${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch scans');
        }

        return data.data;
    } catch (error) {
        console.error('Failed to fetch scans:', error);
        throw error;
    }
};

export const logout = async () => {
    try {
        const token = localStorage.getItem('userToken');

        if (!token) {
            localStorage.removeItem('userToken');
            localStorage.removeItem('userData');
            return { success: true };
        }

        const response = await fetch(`${BASE_URL}/api/auth/logout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });

        const data = await response.json();

        localStorage.removeItem('userToken');
        localStorage.removeItem('userData');

        if (!response.ok) {
            throw new Error(data.message || 'Logout failed');
        }

        return data;
    } catch (error) {
        console.error('Logout error:', error);
        localStorage.removeItem('userToken');
        localStorage.removeItem('userData');
        throw error;
    }
};