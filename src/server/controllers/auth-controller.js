// src/server/controllers/auth-controller.js
const { registerUser, loginUser, logoutUser } = require('../services/auth-service');
const { successResponse, errorResponse } = require('../utils/response');

const register = async (request, h) => {
    try {
        const { email, password, name } = request.payload;
        const user = await registerUser(email, password, name);

        // Set session cookie setelah registrasi
        const response = successResponse(h, user, 'User registered successfully', 201)
            .header('Authorization', `Bearer ${user.token}`)
            .state('session', user.token, {
                ttl: 24 * 60 * 60 * 1000, // 1 hari
                isSecure: process.env.NODE_ENV === 'production',
                isHttpOnly: true,
                path: '/',
                encoding: 'none'
            })
            .state('sessionStart', Date.now().toString(), {
                ttl: 24 * 60 * 60 * 1000, // 1 hari
                isSecure: process.env.NODE_ENV === 'production',
                isHttpOnly: true,
                path: '/',
                encoding: 'none'
            });

        return response;
    } catch (error) {
        return errorResponse(h, error.message, 400);
    }
};

const login = async (request, h) => {
    try {
        const { email, password } = request.payload;
        const user = await loginUser(email, password);

        // Set session cookies
        const response = successResponse(h, user, 'Login successful')
            .header('Authorization', `Bearer ${user.token}`)
            .state('session', user.token, {
                ttl: 24 * 60 * 60 * 1000, // 1 hari
                isSecure: process.env.NODE_ENV === 'production',
                isHttpOnly: true,
                path: '/',
                encoding: 'none'
            })
            .state('sessionStart', Date.now().toString(), {
                ttl: 24 * 60 * 60 * 1000, // 1 hari
                isSecure: process.env.NODE_ENV === 'production',
                isHttpOnly: true,
                path: '/',
                encoding: 'none'
            });

        return response;
    } catch (error) {
        return errorResponse(h, error.message, 401);
    }
};

const logout = async (request, h) => {
    try {
        await logoutUser();
        return successResponse(h, null, 'Logout successful')
            .unstate('session')
            .unstate('sessionStart')
            .header('Clear-Site-Data', '"cache", "cookies", "storage", "executionContexts"');
    } catch (error) {
        return errorResponse(h, error.message, 500);
    }
};

// Controller untuk refresh token
const refreshToken = async (request, h) => {
    try {
        const user = request.user; // Dari middleware authenticate
        if (!user) {
            return errorResponse(h, 'User not authenticated', 401);
        }

        // Generate new token (implementasi tergantung Firebase setup)
        // Untuk Firebase, biasanya client-side yang handle refresh
        const newToken = await user.getIdToken(true); // Force refresh

        const response = successResponse(h, { token: newToken }, 'Token refreshed successfully')
            .header('Authorization', `Bearer ${newToken}`)
            .state('session', newToken, {
                ttl: 24 * 60 * 60 * 1000, // 1 hari
                isSecure: process.env.NODE_ENV === 'production',
                isHttpOnly: true,
                path: '/',
                encoding: 'none'
            });

        return response;
    } catch (error) {
        return errorResponse(h, error.message, 500);
    }
};

// Controller untuk check session status
const checkSession = async (request, h) => {
    try {
        const user = request.user; // Dari middleware authenticate
        if (!user) {
            return errorResponse(h, 'No active session', 401);
        }

        return successResponse(h, {
            uid: user.uid,
            email: user.email,
            name: user.name,
            sessionActive: true
        }, 'Session is active');
    } catch (error) {
        return errorResponse(h, error.message, 500);
    }
};

module.exports = {
    register,
    login,
    logout,
    refreshToken,
    checkSession
};