import template from './landing-page-template.html';
import LandingPresenter from "./landing-presenter.js";
import { navigateToUrl } from '../../routes/routes.js';

class LandingPage extends HTMLElement {
    connectedCallback() {
        if (this._checkAuth()) {
            navigateToUrl('/dashboard');
            return;
        }

        this.render();
        this.setupEventListeners();
    }

    render() {
        this.innerHTML = template;

        // Add smooth scrolling to navigation links
        this.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    setupEventListeners() {
        // Updated selectors to match new design
        const loginButton = this.querySelector('.login-btn');
        if (loginButton) {
            loginButton.addEventListener('click', (e) => {
                e.preventDefault();
                navigateToUrl('/login');
            });
        }

        const signUpButton = this.querySelector('.signup-btn');
        if (signUpButton) {
            signUpButton.addEventListener('click', (e) => {
                e.preventDefault();
                navigateToUrl('/register');
            });
        }

        const startSignButton = this.querySelector('.start-btn');
        if (startSignButton) {
            startSignButton.addEventListener('click', (e) => {
                e.preventDefault();
                navigateToUrl('/login');
            });
        }

        const dashboardButton = this.querySelector('.dashboard-btn');
        if (dashboardButton) {
            dashboardButton.addEventListener('click', (e) => {
                e.preventDefault();
                navigateToUrl('/login');
            });
        }
    }

    _checkAuth() {
        const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
        return !!token;
    }
}

customElements.define('landing-page', LandingPage);

export default LandingPage;