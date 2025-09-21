import template from './result-page-template.html';
import ResultPresenter from './result-presenter.js';
import { navigateToUrl, getQueryParams } from '../../routes/routes';

class ResultPage extends HTMLElement {
    constructor() {
        super();
        this.presenter = new ResultPresenter(this);
    }

    connectedCallback() {
        this.render();
        this.presenter.init();
    }

    render() {
        this.innerHTML = template;
    }

    async loadScanResult() {
        try {
            const queryParams = getQueryParams();
            const scanId = queryParams.scanId;

            console.log('Loading scan result with ID:', scanId);

            if (!scanId) {
                throw new Error('No scan ID provided');
            }

            const storageKey = `scan_${scanId}`;
            const savedData = localStorage.getItem(storageKey);

            if (!savedData) {
                throw new Error('Scan result not found');
            }

            this.scanResult = JSON.parse(savedData);
            console.log('Scan result loaded:', this.scanResult);

            // Hide loading and show content
            this.toggleLoading(false);

            // Let the presenter handle the display
            this.presenter.displayResult();

        } catch (error) {
            console.error('Failed to load scan result:', error);
            this.toggleLoading(true, error);
        }
    }

    toggleLoading(showError, error = null) {
        const loadingIndicator = this.querySelector('#loadingIndicator');
        const resultContent = this.querySelector('#resultContent');
        const errorMessage = this.querySelector('#errorMessage');

        if (loadingIndicator) loadingIndicator.style.display = showError ? 'none' : 'flex';
        if (resultContent) resultContent.style.display = showError ? 'none' : 'block';

        if (errorMessage) {
            errorMessage.style.display = showError ? 'block' : 'none';
            if (showError && error) {
                const errorText = errorMessage.querySelector('p');
                if (errorText) {
                    errorText.textContent = error.message || 'Failed to load scan results';
                }
            }
        }
    }

    showNotification(message, isSuccess = true, isPersistent = false) {
        // Hapus notifikasi sebelumnya
        const existingNotifications = document.querySelectorAll('.custom-notification');
        existingNotifications.forEach(notif => notif.remove());

        const notification = document.createElement('div');
        notification.className = `custom-notification fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${isSuccess ? 'bg-green-500' : 'bg-red-500'} text-white`;
        notification.textContent = message;
        document.body.appendChild(notification);

        if (!isPersistent) {
            setTimeout(() => {
                notification.remove();
            }, 3000);
        }

        return notification;
    }

    showError(message) {
        this.showNotification(message, false);
        this.toggleLoading(true, new Error(message));
    }

    redirectTo(path) {
        navigateToUrl(path);
    }
}

customElements.define('result-page', ResultPage);
export default ResultPage;