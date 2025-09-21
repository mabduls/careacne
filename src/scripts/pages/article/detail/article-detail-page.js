import template from './article-detail-page-template.html';
import ArticleDetailPresenter from "./article-detail-presenter.js";

class ArticleDetailPage extends HTMLElement {
    constructor() {
        super();
        this._presenter = null;
    }

    connectedCallback() {
        this.render();
        this._presenter = new ArticleDetailPresenter(this);
        this._presenter.init();
    }

    render() {
        this.innerHTML = template;
    }

    setSlug(slug) {
        if (this._presenter) {
            this._presenter._articleSlug = slug;
        }
    }

    async loadDetail() {
        if (this._presenter) {
            await this._presenter.init();
        }
    }

    async init() {
        try {
            // Coba dapatkan slug dari URL atau dari property yang sudah diset
            const articleSlug = this._articleSlug || this._extractArticleSlugFromUrl();
            if (!articleSlug) {
                this._showErrorMessage("Artikel tidak ditemukan");
                return;
            }

            const article = this._articles[articleSlug];
            if (!article) {
                this._showErrorMessage(`Artikel dengan slug ${articleSlug} tidak ditemukan`);
                return;
            }

            this._renderArticle(article);
            this._setupEventListeners();
        } catch (error) {
            console.error("Error initializing article detail:", error);
            this._showErrorMessage("Terjadi kesalahan saat memuat artikel");
        }
    }
}

customElements.define("article-detail-page", ArticleDetailPage);
export default ArticleDetailPage;