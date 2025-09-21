import template from './login-page-template.html';
import LoginPresenter from "./login-presenter.js";

class LoginPage extends HTMLElement {
    constructor() {
        super();
        this._presenter = null;
    }

    connectedCallback() {
        // Check if user is already logged in
        if (this._checkAuth()) {
            this._redirectToDashboard();
            return;
        }

        this.render();
        this._addEventListeners();
        this._presenter = new LoginPresenter(this);
    }

    render() {
        this.innerHTML = template;
    }

    _addEventListeners() {
        // Back button
        const backButton = this.querySelector("#backToLanding");
        if (backButton) {
            backButton.addEventListener("click", (e) => {
                e.preventDefault();
                this._navigateTo("/");
            });
        }

        // Sign up link
        const signUpLink = this.querySelector("#signupLink");
        if (signUpLink) {
            signUpLink.addEventListener("click", (e) => {
                e.preventDefault();
                this._navigateTo("/register");
            });
        }
    }

    _checkAuth() {
        return localStorage.getItem('userToken') !== null;
    }

    _redirectToDashboard() {
        this._navigateTo('/dashboard');
    }

    _navigateTo(path) {
        window.location.hash = `#${path}`;
    }
}

customElements.define("login-page", LoginPage);
export default LoginPage;