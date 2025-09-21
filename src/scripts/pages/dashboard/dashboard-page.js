import template from './dashboard-page-template.html';
import DashboardPresenter from "./dashboard-presenter.js";
import { navigateToUrl } from '../../routes/routes.js';

class DashboardPage extends HTMLElement {
    constructor() {
        super();
        this.presenter = new DashboardPresenter(this);
    }

    connectedCallback() {
        if (!this._checkAuth()) {
            navigateToUrl('/login');
            return;
        }

        this.render();
        this.presenter.init();
        this._ensureVisibility();
    }

    _ensureVisibility() {
        this.style.display = 'block';
        this.style.opacity = '1';
    }

    render() {
        this.innerHTML = template;
    }

    showNotification(message, isSuccess = true) {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg ${isSuccess ? 'bg-green-500' : 'bg-red-500'} text-white`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    _checkAuth() {
        const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
        return !!token;
    }

    redirectTo(path) {
        navigateToUrl(path);
    }
}

customElements.define('dashboard-page', DashboardPage);

export default DashboardPage;