const Hapi = require('@hapi/hapi');

const init = async () => {
    const server = Hapi.server({
        port: process.env.PORT || 5000,
        host: process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost',
        routes: {
            cors: {
                origin: [
                    'http://localhost:9000',
                    'https://elaborate-duckanoo-4121a7.netlify.app',
                    'https://mabduls.github.io/acure-scan',
                    'https://mabduls.github.io',
                ],
                credentials: true,
                additionalHeaders: [
                    'cache-control',
                    'x-requested-with',
                    'accept',
                    'origin',
                    'authorization',
                    'content-type'
                ],
                additionalExposedHeaders: [
                    'cache-control',
                    'content-language',
                    'content-type',
                    'expires',
                    'last-modified',
                    'pragma',
                    'authorization'
                ]
            },
            payload: {
                parse: true,
                allow: 'application/json'
            }
        }
    });

    // Plugin untuk handle preflight requests
    await server.register({
        plugin: {
            name: 'cors-headers',
            register: async function (server) {
                server.ext('onPreResponse', (request, h) => {
                    const response = request.response;

                    if (response.isBoom && request.method === 'options') {
                        const origin = request.headers.origin;

                        const corsResponse = h.response().code(200);
                        corsResponse.header('Access-Control-Allow-Origin', origin);
                        corsResponse.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
                        corsResponse.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
                        corsResponse.header('Access-Control-Allow-Credentials', 'true');
                        return corsResponse;
                    }

                    return h.continue;
                });
            }
        }
    });

    return server;
};

module.exports = init;