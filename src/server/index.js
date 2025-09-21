require('dotenv').config();
const init = require('./config/hapi');
const authRoutes = require('./routes/auth-routes');

const startServer = async () => {
    const server = await init();

    // Register routes
    server.route(authRoutes);

    await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

startServer();