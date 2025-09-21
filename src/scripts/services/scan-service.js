import { BASE_URL } from '../data/api.js';

class ScanService {
    /**
     * Simpan scan result ke database melalui API
     */
    static async saveScan(userId, scanData) {
        try {
            const token = localStorage.getItem('userToken');
            if (!token) {
                throw new Error('Authentication token not available');
            }

            // Timeout untuk mencegah proses terlalu lama
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 detik timeout

            const response = await fetch(`${BASE_URL}/api/scans`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId,
                    ...scanData,
                    timestamp: new Date().toISOString()
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('userToken');
                    localStorage.removeItem('userData');
                    throw new Error('Authentication expired. Please login again.');
                }
                throw new Error(data.error || data.message || 'Failed to save scan');
            }

            return data.data?.id || data.data?.scanId;
        } catch (error) {
            console.error('Error saving scan:', error);
            if (error.name === 'AbortError') {
                throw new Error('Save operation timed out. Please try again.');
            }
            throw error;
        }
    }

    /**
     * Ambil semua scan milik user melalui API
     */
    static async getUserScans(userId, userToken = null) {
        try {
            console.log('Trying to get scans for user:', userId);

            // Langsung gunakan API, karena kita tidak bisa menggunakan Firebase SDK di frontend
            let token = userToken || localStorage.getItem('userToken');

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

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('userToken');
                    localStorage.removeItem('userData');
                    throw new Error('Authentication expired. Please login again.');
                }
                throw new Error(`API failed: ${response.status}`);
            }

            const data = await response.json();
            console.log('API response:', data);
            
            // Process the scans to ensure consistent format
            const scans = (data.data || []).map((scan, index) => ({
                id: scan.id || scan.scanId || `scan-${index}-${Date.now()}`,
                scanId: scan.scanId || scan.id || `scan-${index}-${Date.now()}`,
                dominantAcne: scan.dominantAcne || 'Unknown',
                confidence: scan.confidence || 0,
                image: scan.image || '',
                timestamp: scan.timestamp || scan.createdAt || new Date().toISOString(),
                recommendations: this.normalizeRecommendations(scan.recommendations),
                userId: userId
            }));

            console.log('Processed scans:', scans);
            return scans;

        } catch (error) {
            console.error('Error getting user scans:', error);
            throw new Error('Failed to fetch scans: ' + error.message);
        }
    }

    /**
     * Ambil scan spesifik berdasarkan ID
     */
    static async getScanById(userId, scanId) {
        try {
            const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
            if (!token) {
                throw new Error('Authentication token not available');
            }

            const response = await fetch(`${BASE_URL}/api/scans/${scanId}?userId=${userId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));

                if (response.status === 401) {
                    localStorage.removeItem('userToken');
                    localStorage.removeItem('userData');
                    sessionStorage.removeItem('userToken');
                    throw new Error('Authentication expired. Please login again.');
                } else if (response.status === 404) {
                    throw new Error('Scan not found');
                } else {
                    throw new Error(errorData.error || 'Failed to fetch scan');
                }
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Failed to fetch scan');
            }

            const scan = data.data;
            return {
                id: scan.id || scan.scanId,
                scanId: scan.id || scan.scanId,
                ...scan,
                timestamp: scan.timestamp || scan.createdAt || new Date().toISOString(),
                recommendations: this.normalizeRecommendations(scan.recommendations)
            };

        } catch (error) {
            console.error('Error getting scan:', error);
            throw error;
        }
    }

    /**
     * Normalisasi format recommendations agar konsisten
     */
    static normalizeRecommendations(recommendations) {
        if (!recommendations) {
            return { ingredients: [], treatment: [], severity: 'Unknown' };
        }

        // Jika recommendations sudah dalam format yang benar
        if (recommendations.ingredients && recommendations.treatment) {
            return recommendations;
        }

        // Jika recommendations adalah array
        if (Array.isArray(recommendations)) {
            return {
                ingredients: recommendations.slice(0, 5) || [],
                treatment: [],
                severity: 'Unknown'
            };
        }

        // Jika recommendations adalah string atau format lain
        return {
            ingredients: [],
            treatment: [],
            severity: 'Unknown'
        };
    }

    /**
     * Delete scan (jika diperlukan)
     */
    static async deleteScan(userId, scanId) {
        try {
            const token = localStorage.getItem('userToken');
            if (!token) {
                throw new Error('Authentication token not available');
            }

            const response = await fetch(`${BASE_URL}/api/scans/${scanId}?userId=${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to delete scan');
            }

            const data = await response.json();
            return data.success;

        } catch (error) {
            console.error('Error deleting scan:', error);
            throw error;
        }
    }
}

export default ScanService;