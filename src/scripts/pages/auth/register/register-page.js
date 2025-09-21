import template from './register-page-template.html';
import RegisterPresenter from "./register-presenter.js";

class RegisterPage extends HTMLElement {
    constructor() {
        super();
        this._presenter = null;
    }

    connectedCallback() {
        this.render();
        this._presenter = new RegisterPresenter(this);
    }

    render() {
        this.innerHTML = template;
    }
}

customElements.define("register-page", RegisterPage);
export default RegisterPage;