import { register } from '../../../data/api.js';

class RegisterPresenter {
    constructor(view) {
        this._view = view;
        this._initFormListener();
    }

    _initFormListener() {
        const form = this._view.querySelector('#registerForm');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();

                const email = form.querySelector('#email').value.trim();
                const password = form.querySelector('#password').value;
                const confirmPassword = form.querySelector('#confirmPassword').value;
                const name = form.querySelector('#name')?.value.trim() || email.split('@')[0];

                if (!name || name.length < 3) {
                    this._showNotification('Please enter a valid name (min 3 characters)', 'error');
                    return;
                }

                // Validasi
                if (password !== confirmPassword) {
                    this._showNotification('Passwords do not match', 'error');
                    return;
                }

                if (password.length < 6) {
                    this._showNotification('Password must be at least 6 characters', 'error');
                    return;
                }

                if (!this._validateEmail(email)) {
                    this._showNotification('Please enter a valid email address', 'error');
                    return;
                }

                const submitButton = form.querySelector('button[type="submit"]');
                const originalButtonText = submitButton.textContent;
                submitButton.disabled = true;
                submitButton.innerHTML = '<span class="animate-pulse">Registering...</span>';

                try {
                    document.getElementById('loadingOverlay').classList.remove('hidden');

                    await register(name, email, password);

                    document.getElementById('loadingOverlay').classList.add('hidden');

                    this._showNotification('Registration successful! Redirecting to login...', 'success');

                    setTimeout(() => {
                        window.location.hash = '#/login';
                    }, 2000);

                } catch (error) {
                    document.getElementById('loadingOverlay').classList.add('hidden');
                    this._showNotification(error.message || 'Registration failed. Please try again.', 'error');
                    console.error('Registration error:', error);
                } finally {
                    submitButton.disabled = false;
                    submitButton.textContent = originalButtonText;
                }
            });
        }
    }

    _validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    _showNotification(message, type = 'info') {
        const notification = document.getElementById('registerNotification');
        notification.innerHTML = '';

        const alert = document.createElement('div');
        alert.className = `p-4 rounded-lg shadow-lg ${type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`;
        alert.textContent = message;

        notification.appendChild(alert);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            alert.remove();
        }, 5000);
    }
}

export default RegisterPresenter;