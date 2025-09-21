import { login } from '../../../data/api.js';
import { navigateToUrl } from '../../../routes/routes.js';
import { initializeAuth } from '../../../utils/auth.js';

class LoginPresenter {
    constructor(view) {
        this._view = view;
        this._initFormListener();
    }

    _initFormListener() {
        const form = this._view.querySelector('#loginForm');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();

                const email = form.querySelector('#email').value;
                const password = form.querySelector('#password').value;

                if (!this._validateEmail(email)) {
                    this._showNotification('Please enter a valid email address', 'error');
                    return;
                }

                if (password.length < 6) {
                    this._showNotification('Password must be at least 6 characters', 'error');
                    return;
                }

                const submitButton = form.querySelector('button[type="submit"]');
                const originalButtonText = submitButton.textContent;
                submitButton.disabled = true;
                submitButton.innerHTML = '<span class="animate-pulse">Signing in...</span>';

                try {
                    document.getElementById('loadingOverlay').classList.remove('hidden');

                    // Panggil fungsi login yang sudah diperbaiki
                    const userData = await login(email, password);

                    document.getElementById('loadingOverlay').classList.add('hidden');

                    if (userData && userData.token) {
                        this._showNotification('Login successful! Redirecting...', 'success');
                        setTimeout(() => {
                            navigateToUrl('/dashboard');
                        }, 1500);
                    } else {
                        throw new Error('Login failed - no user data received');
                    }

                } catch (error) {
                    document.getElementById('loadingOverlay').classList.add('hidden');
                    this._showFormError(error);

                    // Tampilkan pesan error yang lebih spesifik
                    let errorMessage = error.message || 'Login failed';
                    if (errorMessage.includes('auth/invalid-credential')) {
                        errorMessage = 'Invalid email or password';
                    }

                    this._showNotification(errorMessage, 'error');
                    console.error('Login error:', error);
                } finally {
                    submitButton.disabled = false;
                    submitButton.textContent = originalButtonText;
                    document.getElementById('loadingOverlay').classList.add('hidden');
                }
            });

            this._view.querySelector('#email').addEventListener('input', () => {
                this._view.querySelector('#emailError').classList.add('hidden');
                this._view.querySelector('#email').classList.remove('border-red-500');
            });

            this._view.querySelector('#password').addEventListener('input', () => {
                this._view.querySelector('#passwordError').classList.add('hidden');
                this._view.querySelector('#password').classList.remove('border-red-500');
            });
        }
    }

    _validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    _showNotification(message, type = 'info') {
        const notification = document.getElementById('loginNotification');
        notification.innerHTML = '';

        const alert = document.createElement('div');
        alert.className = `p-4 rounded-lg shadow-lg ${type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`;
        alert.textContent = message;

        notification.appendChild(alert);

        setTimeout(() => {
            alert.remove();
        }, 5000);

        if (type === 'error') {
            if (message.toLowerCase().includes('email')) {
                this._view.querySelector('#email').classList.add('border-red-500');
            }
            if (message.toLowerCase().includes('password')) {
                this._view.querySelector('#password').classList.add('border-red-500');
            }
        }
    }

    _showFormError(error) {
        this._resetFormErrors();

        const emailError = this._view.querySelector('#emailError');
        const passwordError = this._view.querySelector('#passwordError');
        const emailInput = this._view.querySelector('#email');
        const passwordInput = this._view.querySelector('#password');

        emailInput.classList.remove('border-red-500');
        passwordInput.classList.remove('border-red-500');

        if (error.message.includes('email') || error.code === 'auth/invalid-email' || error.code === 'auth/user-not-found') {
            emailError.textContent = error.message;
            emailError.classList.remove('hidden');
            emailInput.classList.add('border-red-500');
        } else if (error.message.includes('password') || error.code === 'auth/wrong-password') {
            passwordError.textContent = error.message;
            passwordError.classList.remove('hidden');
            passwordInput.classList.add('border-red-500');
        } else {
            emailError.textContent = 'Invalid credentials';
            emailError.classList.remove('hidden');
            passwordError.textContent = 'Invalid credentials';
            passwordError.classList.remove('hidden');
            emailInput.classList.add('border-red-500');
            passwordInput.classList.add('border-red-500');
        }
    }

    _resetFormErrors() {
        const emailError = this._view.querySelector('#emailError');
        const passwordError = this._view.querySelector('#passwordError');
        const emailInput = this._view.querySelector('#email');
        const passwordInput = this._view.querySelector('#password');

        emailError.classList.add('hidden');
        passwordError.classList.add('hidden');
        emailInput.classList.remove('border-red-500');
        passwordInput.classList.remove('border-red-500');
    }
}

export default LoginPresenter;