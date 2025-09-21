import template from './article-page-template.html';
import ArticlePresenter from "./article-presenter.js";

class ArticlePage extends HTMLElement {
    constructor() {
        super();
        this._presenter = null;
    }

    connectedCallback() {
        this.render();
        this._presenter = new ArticlePresenter(this);
        this._presenter.init();
    }

    render() {
        this.innerHTML = template;
    }
}

customElements.define("article-page", ArticlePage);
export default ArticlePage;