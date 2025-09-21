import { Router } from 'itty-router'
import { handleRegister, handleLogin, handleLogout, handleVerify } from './worker-auth.js'
const FIREBASE_API_KEY = "AIzaSyC0E89l78RZxPmE-IUb7YIqhdx5WISs_1I";

const router = Router()

// List of allowed origins
const allowedOrigins = [
    'http://localhost:9000',
    'https://elaborate-duckanoo-4121a7.netlify.app',
    'https://mabduls.github.io/acure-scan',
    'https://mabduls.github.io',
    'http://127.0.0.1:8080'
]

// Dynamic CORS headers
const getCorsHeaders = (origin) => {
    const headers = {
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, Origin, X-Requested-With',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Expose-Headers': 'Authorization'
    }

    // Check if origin is allowed
    const isAllowedOrigin = allowedOrigins.some(allowedOrigin =>
        origin === allowedOrigin ||
        origin.endsWith('.netlify.app') ||
        origin.endsWith('.github.io')
    )

    if (isAllowedOrigin) {
        headers['Access-Control-Allow-Origin'] = origin
    } else {
        headers['Access-Control-Allow-Origin'] = allowedOrigins[0]
    }

    return headers
}

// Handler OPTIONS for preflight requests
router.options('*', (request) => {
    const origin = request.headers.get('origin') || ''
    return new Response(null, {
        status: 200,
        headers: getCorsHeaders(origin)
    })
})

// Simple test route untuk debugging
router.get('/test', () => {
    const origin = '*'
    return new Response(JSON.stringify({
        message: 'API is working!',
        timestamp: new Date().toISOString()
    }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            ...getCorsHeaders(origin)
        }
    })
})

// Health check route
router.get('/health', () => {
    const origin = '*'
    return new Response(JSON.stringify({
        status: 'OK',
        timestamp: new Date().toISOString()
    }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            ...getCorsHeaders(origin)
        }
    })
})

// Apply CORS to auth routes
router.post('/api/auth/register', async (request) => {
    try {
        const origin = request.headers.get('origin') || ''
        const response = await handleRegister(request)

        // Add CORS headers
        const headers = new Headers(response.headers)
        Object.entries(getCorsHeaders(origin)).forEach(([key, value]) => {
            headers.set(key, value)
        })

        return new Response(response.body, {
            status: response.status,
            headers
        })
    } catch (error) {
        const origin = request.headers.get('origin') || ''
        return new Response(JSON.stringify({
            error: error.message || 'Registration failed'
        }), {
            status: error.status || 500,
            headers: {
                'Content-Type': 'application/json',
                ...getCorsHeaders(origin)
            }
        })
    }
})

router.post('/api/auth/login', async (request) => {
    try {
        const origin = request.headers.get('origin') || ''
        const response = await handleLogin(request)

        // Add CORS headers
        const headers = new Headers(response.headers)
        Object.entries(getCorsHeaders(origin)).forEach(([key, value]) => {
            headers.set(key, value)
        })

        return new Response(response.body, {
            status: response.status,
            headers
        })
    } catch (error) {
        const origin = request.headers.get('origin') || ''
        return new Response(JSON.stringify({
            error: error.message || 'Login failed'
        }), {
            status: error.status || 500,
            headers: {
                'Content-Type': 'application/json',
                ...getCorsHeaders(origin)
            }
        })
    }
})

router.post('/api/auth/logout', async (request) => {
    try {
        const origin = request.headers.get('origin') || ''
        const response = await handleLogout(request)

        // Add CORS headers
        const headers = new Headers(response.headers)
        Object.entries(getCorsHeaders(origin)).forEach(([key, value]) => {
            headers.set(key, value)
        })

        return new Response(response.body, {
            status: response.status,
            headers
        })
    } catch (error) {
        const origin = request.headers.get('origin') || ''
        return new Response(JSON.stringify({
            error: error.message || 'Logout failed'
        }), {
            status: error.status || 500,
            headers: {
                'Content-Type': 'application/json',
                ...getCorsHeaders(origin)
            }
        })
    }
})

router.get('/api/auth/verify', async (request) => {
    try {
        const origin = request.headers.get('origin') || '';
        const response = await handleVerify(request);

        // Add CORS headers
        const headers = new Headers(response.headers);
        Object.entries(getCorsHeaders(origin)).forEach(([key, value]) => {
            headers.set(key, value);
        });

        return new Response(response.body, {
            status: response.status,
            headers
        });
    } catch (error) {
        const origin = request.headers.get('origin') || '';
        return new Response(JSON.stringify({
            error: error.message || 'Token verification failed'
        }), {
            status: error.status || 500,
            headers: {
                'Content-Type': 'application/json',
                ...getCorsHeaders(origin)
            }
        });
    }
});

// GET /api/scans - Ambil semua scan milik user
router.get('/api/scans', async (request) => {
    try {
        console.log('GET /api/scans called');
        const origin = request.headers.get('origin') || '';
        const url = new URL(request.url);
        const userId = url.searchParams.get('userId');

        console.log('User ID:', userId);

        if (!userId) {
            return new Response(JSON.stringify({
                success: false,
                error: 'User ID is required'
            }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                    ...getCorsHeaders(origin)
                }
            });
        }

        // Verifikasi token
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return new Response(JSON.stringify({
                success: false,
                error: 'No token provided'
            }), {
                status: 401,
                headers: {
                    'Content-Type': 'application/json',
                    ...getCorsHeaders(origin)
                }
            });
        }

        const token = authHeader.substring(7);

        // Verifikasi token dengan Firebase
        const verifyResponse = await fetch(
            `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ idToken: token })
            }
        );

        if (!verifyResponse.ok) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Invalid token'
            }), {
                status: 401,
                headers: {
                    'Content-Type': 'application/json',
                    ...getCorsHeaders(origin)
                }
            });
        }

        const verifyData = await verifyResponse.json();
        const tokenUserId = verifyData.users[0].localId;

        if (tokenUserId !== userId) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Unauthorized access'
            }), {
                status: 403,
                headers: {
                    'Content-Type': 'application/json',
                    ...getCorsHeaders(origin)
                }
            });
        }

        // **PERBAIKAN: Ambil data dari subcollection scans**
        const projectId = 'acurescan';
        const scansUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${userId}/scans`;

        const scansResponse = await fetch(scansUrl, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!scansResponse.ok) {
            if (scansResponse.status === 404) {
                // Subcollection tidak ada = tidak ada scans
                return new Response(JSON.stringify({
                    success: true,
                    data: []
                }), {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        ...getCorsHeaders(origin)
                    }
                });
            }
            
            const errorText = await scansResponse.text();
            console.error('Firestore error:', errorText);
            throw new Error('Failed to fetch scans from Firestore');
        }

        const scansData = await scansResponse.json();
        const scans = [];

        // Process documents from subcollection
        if (scansData.documents && Array.isArray(scansData.documents)) {
            scansData.documents.forEach(doc => {
                const fields = doc.fields || {};
                const docId = doc.name.split('/').pop(); // Get document ID
                
                scans.push({
                    id: docId,
                    scanId: docId,
                    dominantAcne: fields.dominantAcne?.stringValue || 'Unknown',
                    confidence: fields.confidence?.doubleValue || 0,
                    image: fields.image?.stringValue || '',
                    timestamp: fields.timestamp?.timestampValue || 
                              fields.createdAt?.timestampValue || 
                              new Date().toISOString(),
                    recommendations: parseRecommendations(fields.recommendations),
                    userId: userId
                });
            });
        }

        console.log('Scans found:', scans.length);

        return new Response(JSON.stringify({
            success: true,
            data: scans
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                ...getCorsHeaders(origin)
            }
        });

    } catch (error) {
        console.error('Error fetching scans:', error);
        const origin = request.headers.get('origin') || '';
        return new Response(JSON.stringify({
            success: false,
            error: 'Internal server error',
            message: error.message
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                ...getCorsHeaders(origin)
            }
        });
    }
});

router.post('/api/scans', async (request) => {
    try {
        const origin = request.headers.get('origin') || '';

        // Verifikasi token
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return new Response(JSON.stringify({
                success: false,
                error: 'No token provided'
            }), {
                status: 401,
                headers: {
                    'Content-Type': 'application/json',
                    ...getCorsHeaders(origin)
                }
            });
        }

        const token = authHeader.substring(7);
        const requestBody = await request.json();
        const { userId, ...scanData } = requestBody;

        if (!userId) {
            return new Response(JSON.stringify({
                success: false,
                error: 'User ID is required'
            }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                    ...getCorsHeaders(origin)
                }
            });
        }

        // Verifikasi token dengan Firebase
        const verifyResponse = await fetch(
            `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ idToken: token })
            }
        );

        if (!verifyResponse.ok) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Invalid token'
            }), {
                status: 401,
                headers: {
                    'Content-Type': 'application/json',
                    ...getCorsHeaders(origin)
                }
            });
        }

        const verifyData = await verifyResponse.json();
        const tokenUserId = verifyData.users[0].localId;

        if (tokenUserId !== userId) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Unauthorized access'
            }), {
                status: 403,
                headers: {
                    'Content-Type': 'application/json',
                    ...getCorsHeaders(origin)
                }
            });
        }

        // Generate document ID
        const scanId = generateId();
        const projectId = 'acurescan';

        // **PERBAIKAN: Gunakan format URL yang benar untuk subcollection**
        const scanDocUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${userId}/scans?documentId=${scanId}`;

        // Create scan document dengan format yang sesuai
        const scanDoc = {
            fields: {
                scanId: { stringValue: scanId },
                dominantAcne: { stringValue: scanData.dominantAcne || 'Unknown' },
                confidence: { doubleValue: scanData.confidence || 0 },
                image: { stringValue: scanData.image || '' },
                timestamp: { timestampValue: new Date().toISOString() },
                createdAt: { timestampValue: new Date().toISOString() },
                userEmail: { stringValue: scanData.userEmail || '' },
                userName: { stringValue: scanData.userName || '' },
                userId: { stringValue: userId },
                isMockResult: { booleanValue: scanData.isMockResult || false },
                predictions: {
                    arrayValue: {
                        values: (scanData.predictions || []).map(p => ({
                            mapValue: {
                                fields: {
                                    label: { stringValue: p.label || '' },
                                    confidence: { doubleValue: p.confidence || 0 }
                                }
                            }
                        }))
                    }
                },
                recommendations: formatRecommendationsForFirestore(scanData.recommendations)
            }
        };

        // Save to Firestore subcollection dengan method POST yang benar
        const saveResponse = await fetch(
            scanDocUrl,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    fields: scanDoc.fields
                })
            }
        );

        if (!saveResponse.ok) {
            const errorText = await saveResponse.text();
            console.error('Firestore save error:', errorText);

            return new Response(JSON.stringify({
                success: false,
                error: 'Failed to save scan',
                details: errorText
            }), {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    ...getCorsHeaders(origin)
                }
            });
        }

        const savedData = await saveResponse.json();
        console.log('Scan saved successfully:', savedData);

        return new Response(JSON.stringify({
            success: true,
            data: {
                id: scanId,
                scanId: scanId,
                ...scanData
            }
        }), {
            status: 201,
            headers: {
                'Content-Type': 'application/json',
                ...getCorsHeaders(origin)
            }
        });

    } catch (error) {
        console.error('Error saving scan:', error);
        const origin = request.headers.get('origin') || '';
        return new Response(JSON.stringify({
            success: false,
            error: 'Internal server error',
            message: error.message
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                ...getCorsHeaders(origin)
            }
        });
    }
});

// GET /api/scans/:scanId - Ambil scan spesifik (FIXED)
router.get('/api/scans/:scanId', async (request) => {
    try {
        const origin = request.headers.get('origin') || '';
        const url = new URL(request.url);
        const scanId = url.pathname.split('/').pop();
        const userId = url.searchParams.get('userId');

        if (!userId || !scanId) {
            return new Response(JSON.stringify({
                success: false,
                error: 'User ID and Scan ID are required'
            }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                    ...getCorsHeaders(origin)
                }
            });
        }

        // Verifikasi token
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return new Response(JSON.stringify({
                success: false,
                error: 'No token provided'
            }), {
                status: 401,
                headers: {
                    'Content-Type': 'application/json',
                    ...getCorsHeaders(origin)
                }
            });
        }

        const token = authHeader.substring(7);

        // Verifikasi token dengan Firebase
        const verifyResponse = await fetch(
            `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ idToken: token })
            }
        );

        if (!verifyResponse.ok) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Invalid token'
            }), {
                status: 401,
                headers: {
                    'Content-Type': 'application/json',
                    ...getCorsHeaders(origin)
                }
            });
        }

        const verifyData = await verifyResponse.json();
        const tokenUserId = verifyData.users[0].localId;

        if (tokenUserId !== userId) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Unauthorized access'
            }), {
                status: 403,
                headers: {
                    'Content-Type': 'application/json',
                    ...getCorsHeaders(origin)
                }
            });
        }

        // **PERBAIKAN: Ambil dari subcollection scans**
        const projectId = 'acurescan';
        const scanDocUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${userId}/scans/${scanId}`;

        const firestoreResponse = await fetch(scanDocUrl, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!firestoreResponse.ok) {
            if (firestoreResponse.status === 404) {
                return new Response(JSON.stringify({
                    success: false,
                    error: 'Scan not found'
                }), {
                    status: 404,
                    headers: {
                        'Content-Type': 'application/json',
                        ...getCorsHeaders(origin)
                    }
                });
            }

            return new Response(JSON.stringify({
                success: false,
                error: 'Failed to fetch scan'
            }), {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    ...getCorsHeaders(origin)
                }
            });
        }

        const scanData = await firestoreResponse.json();
        const fields = scanData.fields || {};

        const scan = {
            id: scanId,
            scanId: scanId,
            dominantAcne: fields.dominantAcne?.stringValue || 'Unknown',
            confidence: fields.confidence?.doubleValue || 0,
            image: fields.image?.stringValue || '',
            timestamp: fields.timestamp?.timestampValue || fields.createdAt?.timestampValue || new Date().toISOString(),
            recommendations: parseRecommendations(fields.recommendations),
            predictions: parsePredictions(fields.predictions),
            userId: userId
        };

        return new Response(JSON.stringify({
            success: true,
            data: scan
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                ...getCorsHeaders(origin)
            }
        });

    } catch (error) {
        console.error('Error fetching scan:', error);
        const origin = request.headers.get('origin') || '';
        return new Response(JSON.stringify({
            success: false,
            error: 'Internal server error',
            message: error.message
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                ...getCorsHeaders(origin)
            }
        });
    }
});

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function parseRecommendations(recommendationsField) {
    if (!recommendationsField) {
        return { ingredients: [], treatment: [], severity: 'Unknown' };
    }

    if (recommendationsField.mapValue && recommendationsField.mapValue.fields) {
        const fields = recommendationsField.mapValue.fields;
        return {
            ingredients: parseArrayField(fields.ingredients) || [],
            treatment: parseArrayField(fields.treatment) || [],
            severity: fields.severity?.stringValue || 'Unknown'
        };
    }

    return { ingredients: [], treatment: [], severity: 'Unknown' };
}

function parseArrayField(arrayField) {
    if (!arrayField || !arrayField.arrayValue || !arrayField.arrayValue.values) {
        return [];
    }

    return arrayField.arrayValue.values.map(value => value.stringValue || '');
}

function parsePredictions(predictionsField) {
    if (!predictionsField || !predictionsField.arrayValue || !predictionsField.arrayValue.values) {
        return [];
    }

    return predictionsField.arrayValue.values.map(value => {
        if (value.mapValue && value.mapValue.fields) {
            const fields = value.mapValue.fields;
            return {
                label: fields.label?.stringValue || '',
                confidence: fields.confidence?.doubleValue || 0
            };
        }
        return { label: '', confidence: 0 };
    });
}

function parseFirestoreFields(fields) {
    const result = {};

    for (const [key, value] of Object.entries(fields)) {
        if (value.stringValue !== undefined) {
            result[key] = value.stringValue;
        } else if (value.doubleValue !== undefined) {
            result[key] = value.doubleValue;
        } else if (value.integerValue !== undefined) {
            result[key] = parseInt(value.integerValue);
        } else if (value.booleanValue !== undefined) {
            result[key] = value.booleanValue;
        } else if (value.timestampValue !== undefined) {
            result[key] = value.timestampValue;
        } else if (value.arrayValue !== undefined) {
            result[key] = parseFirestoreArray(value.arrayValue);
        } else if (value.mapValue !== undefined) {
            result[key] = parseFirestoreFields(value.mapValue.fields || {});
        }
    }

    return result;
}

function parseFirestoreArray(arrayValue) {
    if (!arrayValue.values) return [];

    return arrayValue.values.map(value => {
        if (value.stringValue !== undefined) return value.stringValue;
        if (value.doubleValue !== undefined) return value.doubleValue;
        if (value.mapValue !== undefined) return parseFirestoreFields(value.mapValue.fields || {});
        return null;
    }).filter(val => val !== null);
}

function formatRecommendationsForFirestore(recommendations) {
    if (!recommendations) {
        return {
            mapValue: {
                fields: {
                    ingredients: { arrayValue: { values: [] } },
                    treatment: { arrayValue: { values: [] } },
                    severity: { stringValue: 'Unknown' }
                }
            }
        };
    }

    return {
        mapValue: {
            fields: {
                ingredients: {
                    arrayValue: {
                        values: (recommendations.ingredients || []).map(item => ({ stringValue: item }))
                    }
                },
                treatment: {
                    arrayValue: {
                        values: (recommendations.treatment || []).map(item => ({ stringValue: item }))
                    }
                },
                severity: { stringValue: recommendations.severity || 'Unknown' }
            }
        }
    };
}

// Root route
router.get('/', () => {
    const origin = '*'
    return new Response(JSON.stringify({
        message: 'Acure Scan API is running!',
        endpoints: {
            register: 'POST /api/auth/register',
            login: 'POST /api/auth/login',
            logout: 'POST /api/auth/logout',
            test: 'GET /test',
            health: 'GET /health'
        }
    }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            ...getCorsHeaders(origin)
        }
    })
})

// Handle 404
router.all('*', () => {
    const origin = '*'
    return new Response(JSON.stringify({
        error: 'Endpoint not found',
        available_endpoints: ['/api/auth/register', '/api/auth/login', '/api/auth/logout', '/test', '/health']
    }), {
        status: 404,
        headers: {
            'Content-Type': 'application/json',
            ...getCorsHeaders(origin)
        }
    })
})

export default {
    async fetch(request, env, ctx) {
        try {
            // Handle preflight requests
            if (request.method === 'OPTIONS') {
                const origin = request.headers.get('origin') || ''
                return new Response(null, {
                    headers: getCorsHeaders(origin)
                })
            }

            // Handle the request
            const response = await router.handle(request)
            return response

        } catch (error) {
            console.error('Unhandled error in worker:', error)
            const origin = request.headers.get('origin') || ''
            return new Response(JSON.stringify({
                error: 'Internal Server Error',
                message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
            }), {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    ...getCorsHeaders(origin)
                }
            })
        }
    }
}