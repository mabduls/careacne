import template from './history-page-template.html';
import HistoryPresenter from './history-presenter.js';

class HistoryPage extends HTMLElement {
    constructor() {
        super();
        this.presenter = null;
    }

    connectedCallback() {
        this.render();
        this.presenter = new HistoryPresenter(this);
        this.presenter.init().catch(error => {
            console.error('Failed to initialize history page:', error);
        });
    }

    disconnectedCallback() {
        // Clean up auth listener when component is removed
        if (this.presenter && this.presenter.unsubscribeAuth) {
            this.presenter.unsubscribeAuth();
        }
    }

    render() {
        this.innerHTML = template;
    }
}

customElements.define('history-page', HistoryPage);
export default HistoryPage;