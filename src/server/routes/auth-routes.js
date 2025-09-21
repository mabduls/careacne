const { register, login, logout } = require('../controllers/auth-controller');

const authRoutes = [
    {
        method: 'POST',
        path: '/api/auth/register',
        handler: register,
        options: {
            auth: false
        }
    },
    {
        method: 'POST',
        path: '/api/auth/login',
        handler: login,
        options: {
            auth: false
        }
    },
    {
        method: 'POST',
        path: '/api/auth/logout',
        handler: logout,
        options: {
            auth: false
        }
    }
];

module.exports = authRoutes;