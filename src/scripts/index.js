import '../styles/styles.css';
import App from './pages/app';

async function safeDefine(name, importPromise) {
    if (!customElements.get(name)) {
        try {
            const { default: Component } = await importPromise;
            if (!customElements.get(name)) {
                customElements.define(name, Component);
                console.log(`Successfully registered: ${name}`);
            } else {
                console.log(`${name} already registered, skipping`);
            }
        } catch (error) {
            console.error(`Failed to register ${name}:`, error);
            // Jangan throw error di production
            if (process.env.NODE_ENV === 'development') {
                throw error;
            }
        }
    }
}

async function initializeApp() {
    try {
        await Promise.all([
            safeDefine('landing-page', import('./pages/landing/landing-page')),
            safeDefine('login-page', import('./pages/auth/login/login-page')),
            safeDefine('register-page', import('./pages/auth/register/register-page')),
            safeDefine('dashboard-page', import('./pages/dashboard/dashboard-page')),
            safeDefine('result-page', import('./pages/result/result-page')),
            safeDefine('result-detail-page', import('./pages/result/detail/result-detail-page')),
            safeDefine('history-page', import('./pages/history/history-page')),
            safeDefine('article-page', import('./pages/article/article-page')),
            safeDefine('article-detail-page', import('./pages/article/detail/article-detail-page')),
        ]);

        const app = new App({
            content: document.getElementById('mainContent'),
        });

        app.renderPage();

        if ('serviceWorker' in navigator) {
            try {
                await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker registered');
            } catch (error) {
                console.error('Service Worker registration failed:', error);
            }
        }

        window.addEventListener('hashchange', () => app.renderPage());
        window.addEventListener('load', () => app.renderPage());

    } catch (error) {
        console.error('Application initialization failed:', error);
        document.getElementById('mainContent').innerHTML = `
            <div style="color: white; text-align: center; padding: 20px;">
                <h2>Application Error</h2>
                <p>Sorry, something went wrong. Please try again later.</p>
            </div>
    `;
    }
}

initializeApp();