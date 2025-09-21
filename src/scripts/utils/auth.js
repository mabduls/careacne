import { BASE_URL } from '../data/api.js';

export const initializeAuth = () => {
    return new Promise(async (resolve) => {
        try {
            // Cek token di localStorage
            const userToken = localStorage.getItem('userToken');
            const userDataStr = localStorage.getItem('userData');

            console.log('Auth init - Token found:', !!userToken);
            console.log('Auth init - User data found:', !!userDataStr);

            if (!userToken || !userDataStr) {
                console.log('No token or user data, resolving null');
                resolve(null);
                return;
            }

            // Verifikasi token dengan backend
            console.log('Sending verification request with token:', userToken.substring(0, 10) + '...');
            
            const response = await fetch(`${BASE_URL}/api/auth/verify`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${userToken}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include' // Tambahkan ini
            });

            console.log('Verification response status:', response.status);

            if (response.ok) {
                const result = await response.json();
                console.log('Verification result:', result);
                
                if (result.success) {
                    const userData = JSON.parse(userDataStr);
                    resolve(userData);
                } else {
                    console.log('Verification failed:', result.error);
                    throw new Error(result.error || 'Verification failed');
                }
            } else {
                const errorText = await response.text();
                console.log('Verification HTTP error:', response.status, errorText);
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Auth initialization error:', error);
            // Bersihkan storage pada error
            localStorage.removeItem('userToken');
            localStorage.removeItem('userData');
            resolve(null);
        }
    });
};

export const getCurrentUser = () => {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
};

export const getToken = () => {
    return localStorage.getItem('userToken');
};