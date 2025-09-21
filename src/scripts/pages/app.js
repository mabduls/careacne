// app.js - DIPERBAIKI
import { routes, getCurrentPath, getQueryParams } from '../routes/routes'
import { checkAuth } from '../routes/routes';

class App {
    constructor({ content }) {
        this._content = content
    }

    async renderPage() {
        try {
            // PERBAIKAN: Gunakan getCurrentPath untuk mendapatkan path tanpa query
            const pathname = getCurrentPath();
            const queryParams = getQueryParams();

            console.log('Rendering page:', pathname, 'with params:', queryParams);

            const route = routes[pathname] || routes['/'];

            if (!checkAuth(route)) {
                return;
            }

            this._content.innerHTML = '';

            await new Promise(resolve => setTimeout(resolve, 10));

            this._content.innerHTML = route.template;

            await new Promise(resolve => setTimeout(resolve, 10));

            // PERBAIKAN: Pass query parameters ke init functions
            if (pathname === '/') {
                await this._initLandingPage();
            } else if (pathname === '/login') {
                await this._initLoginPage();
            } else if (pathname === '/register') {
                await this._initRegisterPage();
            } else if (pathname === '/dashboard') {
                await this._initDashboardPage();
            } else if (pathname === '/result') {
                await this._initResultPage(queryParams)
            } else if (pathname === '/result-detail') {
                await this._initResultDetailPage(queryParams)
            } else if (pathname === '/history') {
                await this._initHistoryPage();
            } else if (pathname === '/article') {
                await this._initArticlePage();
            } else if (pathname === '/article-detail') {
                await this._initArticleDetailPage(queryParams);
            }
        } catch (error) {
            console.error('Failed to render page:', error)
            this._content.innerHTML = `
        <div style="color: white; padding: 2rem; text-align: center;">
            <h2>Error</h2>
            <p>${error.message}</p>
            <button onclick="window.location.hash='#/'">Back to Home</button>
        </div>
        `
        }
    }

    async _initLandingPage() {
        await customElements.whenDefined('landing-page')
        const landingPage = this._content.querySelector('landing-page')
        if (landingPage) {
            console.log('Landing page initialized')
        }
    }

    async _initLoginPage() {
        await customElements.whenDefined('login-page')
        const loginPage = this._content.querySelector('login-page')
        if (loginPage) {
            console.log('Login page initialized')
        }
    }

    async _initRegisterPage() {
        await customElements.whenDefined('register-page')
        const registerPage = this._content.querySelector('register-page')
        if (registerPage) {
            console.log('Register page initialized')
        }
    }

    async _initDashboardPage() {
        await customElements.whenDefined('dashboard-page')
        const dashboardPage = this._content.querySelector('dashboard-page')
        if (dashboardPage) {
            console.log('Dashboard page initialized')
        }
    }

    async _initArticlePage() {
        await customElements.whenDefined('article-page')
        const articlePage = this._content.querySelector('article-page')
        if (articlePage) {
            console.log('Article page initialized')
        }
    }

    async _initArticleDetailPage(queryParams = {}) {
        await customElements.whenDefined('article-detail-page');
        const articleDetailPage = this._content.querySelector('article-detail-page');
        if (articleDetailPage) {
            console.log('Article Detail page initialized with params:', queryParams);

            if (articleDetailPage._presenter && queryParams.slug) {
                articleDetailPage._presenter._articleSlug = queryParams.slug;
            }

            if (articleDetailPage._presenter) {
                await articleDetailPage._presenter.init();
            }
        }
    }

    async _initHistoryPage() {
        await customElements.whenDefined('history-page')
        const historyPage = this._content.querySelector('history-page')
        if (historyPage) {
            console.log('History page initialized')
        }
    }

    async _initResultDetailPage(queryParams = {}) {
        await customElements.whenDefined('result-detail-page');
        const resultDetailPage = this._content.querySelector('result-detail-page');
        if (resultDetailPage) {
            console.log('Result Detail page initialized with params:', queryParams);

            if (resultDetailPage._presenter && queryParams.scanId) {
                resultDetailPage._presenter._scanId = queryParams.scanId;
            }

            if (resultDetailPage._presenter) {
                await resultDetailPage._presenter.init();
            }
        }
    }

    async _initResultPage(queryParams = {}) {
        try {
            await customElements.whenDefined('result-page');
            const resultPage = this._content.querySelector('result-page');
            if (resultPage) {
                console.log('Result page initialized with params:', queryParams);

                if (queryParams.scanId && resultPage.setScanId) {
                    resultPage.setScanId(queryParams.scanId);
                }

                if (resultPage.loadScanResult) {
                    await resultPage.loadScanResult();
                }
            }
        } catch (error) {
            console.error('Failed to init result page:', error);
            this._content.innerHTML = `
            <div class="error-message">
                Failed to load results. <a href="#/dashboard">Back to Dashboard</a>
            </div>
        `;
        }
    }
}

export default App