// result-detail-page.js
import template from './result-detail-page-template.html';
import ResultDetailPresenter from './result-detail-presenter.js';

class ResultDetailPage extends HTMLElement {
    constructor() {
        super();
        this.presenter = new ResultDetailPresenter(this);
    }

    connectedCallback() {
        this.render();
        this.presenter.init().catch(error => {
            console.error('Failed to initialize result detail page:', error);
            this.showError(error.message);
        });
    }

    render() {
        this.innerHTML = template;
        // Add intersection observer for scroll animations
        this.setupScrollAnimations();
    }

    setupScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fade-in-up');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        // Observe elements that should animate on scroll
        setTimeout(() => {
            const elementsToAnimate = this.querySelectorAll('.animate-on-load');
            elementsToAnimate.forEach(el => {
                observer.observe(el);
            });
        }, 100);
    }

    showLoading() {
        this.querySelector('#loadingIndicator').classList.remove('hidden');
        this.querySelector('#errorMessage').classList.add('hidden');
        this.querySelector('#resultDetailContent').classList.add('hidden');
    }

    hideLoading() {
        const loadingIndicator = this.querySelector('#loadingIndicator');
        loadingIndicator.style.opacity = '0';
        loadingIndicator.style.transform = 'scale(0.8)';
        loadingIndicator.style.transition = 'all 0.3s ease-out';

        setTimeout(() => {
            loadingIndicator.classList.add('hidden');
            loadingIndicator.style.opacity = '';
            loadingIndicator.style.transform = '';
        }, 300);
    }

    showError(message) {
        this.querySelector('#loadingIndicator').classList.add('hidden');

        const errorElement = this.querySelector('#errorMessage');
        const errorTextElement = errorElement.querySelector('p');

        if (errorTextElement) {
            errorTextElement.textContent = message;
        }

        errorElement.classList.remove('hidden');
        errorElement.classList.add('animate-fade-in-up');
        this.querySelector('#resultDetailContent').classList.add('hidden');
    }

    showContent() {
        this.hideLoading();
        this.querySelector('#errorMessage').classList.add('hidden');

        const contentElement = this.querySelector('#resultDetailContent');
        contentElement.classList.remove('hidden');

        // Trigger entrance animations
        setTimeout(() => {
            contentElement.classList.remove('animate-on-load');
            contentElement.classList.add('animate-fade-in-scale');

            // Animate child elements with staggered delays
            this.animateContentElements();
        }, 100);
    }

    animateContentElements() {
        const elementsToAnimate = [
            { selector: 'h1', animation: 'animate-fade-in-left', delay: 0 },
            { selector: '#scanTimestamp', animation: 'animate-fade-in-right', delay: 100 },
            { selector: '.space-y-4', animation: 'animate-fade-in-left', delay: 200 },
            { selector: '.space-y-6', animation: 'animate-fade-in-right', delay: 300 },
            { selector: '[class*="gradient"]', animation: 'animate-bounce-in', delay: 400 }
        ];

        elementsToAnimate.forEach(({ selector, animation, delay }) => {
            setTimeout(() => {
                const element = this.querySelector(selector);
                if (element) {
                    element.classList.add(animation);
                }
            }, delay);
        });
    }

    setImage(src) {
        const img = this.querySelector('#resultImage');
        if (img) {
            // Add loading shimmer effect
            img.style.background = 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)';
            img.style.backgroundSize = '200% 100%';
            img.classList.add('shimmer');

            img.onload = () => {
                img.classList.remove('shimmer');
                img.style.background = '';
                img.classList.add('animate-fade-in-scale');
            };

            img.src = src;
        }
    }

    setTimestamp(date) {
        const element = this.querySelector('#scanTimestamp');
        if (element) {
            element.textContent = `Scanned on ${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;
            element.classList.add('animate-fade-in-right', 'animate-delayed-1');
        }
    }

    renderPredictions(predictions, dominantAcne) {
        const container = this.querySelector('#resultsContainer');
        if (!container) return;

        container.innerHTML = predictions.map((pred, index) => `
            <div class="flex justify-between items-center p-3 ${dominantAcne === pred.label ? 'bg-blue-50 border border-blue-200' : 'bg-white border border-gray-100'} rounded-lg transition-all duration-300 hover:shadow-md hover-scale stagger-item" style="animation-delay: ${index * 0.1}s">
                <span class="${dominantAcne === pred.label ? 'font-semibold text-blue-800' : 'text-gray-700'} transition-colors duration-200">
                    ${pred.label}
                </span>
                <div class="flex items-center">
                    <div class="w-24 bg-gray-200 rounded-full h-3 mr-3 overflow-hidden">
                        <div class="h-3 rounded-full ${dominantAcne === pred.label ? 'bg-gradient-to-r from-blue-400 to-blue-600' : 'bg-gradient-to-r from-gray-300 to-gray-500'} confidence-bar transition-all duration-1000 ease-out" 
                            style="width: ${Math.round(pred.confidence * 100)}%; animation-delay: ${index * 0.2}s"></div>
                    </div>
                    <span class="text-sm font-medium ${dominantAcne === pred.label ? 'text-blue-600' : 'text-gray-600'} transition-colors duration-200">
                        ${Math.round(pred.confidence * 100)}%
                    </span>
                </div>
            </div>
        `).join('');

        // Animate progress bars
        setTimeout(() => {
            container.querySelectorAll('.confidence-bar').forEach((bar, index) => {
                setTimeout(() => {
                    bar.classList.add('animate-progress');
                }, index * 100);
            });
        }, 500);
    }

    renderDominantResult(dominantAcne, confidence) {
        const container = this.querySelector('#dominantResult');
        if (!container) return;

        container.innerHTML = `
            <div class="flex items-center space-x-3 animate-bounce-in">
                <div class="w-5 h-5 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full animate-pulse"></div>
                <div>
                    <h4 class="text-xl font-bold text-blue-900 animate-fade-in-up">${dominantAcne}</h4>
                    <p class="text-sm text-blue-700 animate-fade-in-up animate-delayed-1">
                        Confidence: <span class="font-bold">${Math.round(confidence * 100)}%</span>
                    </p>
                </div>
            </div>
        `;
    }

    renderRecommendations(recommendations) {
        const container = this.querySelector('#recommendation');
        if (!container || !recommendations) return;

        container.innerHTML = `
            <div class="grid md:grid-cols-2 gap-6">
                <div class="bg-green-50 p-6 rounded-lg border border-green-200 card-hover hover-lift animate-fade-in-left animate-delayed-1">
                    <h3 class="text-lg font-semibold text-green-800 mb-4 flex items-center">
                        <svg class="w-5 h-5 mr-2 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        Treatment Steps
                    </h3>
                    <ul class="space-y-3">
                        ${recommendations.treatment.map((step, index) => `
                            <li class="flex items-start stagger-item hover-scale transition-transform duration-200" style="animation-delay: ${index * 0.1}s">
                                <div class="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0 animate-pulse"></div>
                                <span class="text-green-700 hover:text-green-800 transition-colors duration-200">${step}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>

                <div class="bg-blue-50 p-6 rounded-lg border border-blue-200 card-hover hover-lift animate-fade-in-right animate-delayed-2">
                    <h3 class="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                        <svg class="w-5 h-5 mr-2 animate-float" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5L8 4z"/>
                        </svg>
                        Key Ingredients
                    </h3>
                    <div class="flex flex-wrap gap-2 mb-4">
                        ${recommendations.ingredients.map((ingredient, index) => `
                            <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium hover:bg-blue-200 transition-all duration-200 hover-scale stagger-item" style="animation-delay: ${index * 0.05}s">
                                ${ingredient}
                            </span>
                        `).join('')}
                    </div>
                    <div class="p-3 bg-blue-100 rounded-lg animate-bounce-in animate-delayed-3">
                        <p class="text-blue-800 font-medium">Severity Level: 
                            <span class="font-bold text-lg animate-pulse">${recommendations.severity}</span>
                        </p>
                    </div>
                </div>
            </div>
        `;

        // Add entrance animations to recommendation cards
        setTimeout(() => {
            const cards = container.querySelectorAll('.card-hover');
            cards.forEach((card, index) => {
                setTimeout(() => {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    card.style.transition = 'all 0.6s ease-out';

                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 50);
                }, index * 200);
            });
        }, 100);
    }

    // Enhanced method to add micro-interactions
    addMicroInteractions() {
        // Add hover effects to all buttons
        this.querySelectorAll('button').forEach(button => {
            button.addEventListener('mouseenter', () => {
                button.style.transform = 'translateY(-1px)';
                button.style.transition = 'transform 0.2s ease-out';
            });

            button.addEventListener('mouseleave', () => {
                button.style.transform = 'translateY(0)';
            });
        });

        // Add click ripple effect
        this.querySelectorAll('.card-hover, button').forEach(element => {
            element.addEventListener('click', (e) => {
                const ripple = document.createElement('div');
                const rect = element.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;

                ripple.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    left: ${x}px;
                    top: ${y}px;
                    background: rgba(255, 255, 255, 0.3);
                    border-radius: 50%;
                    transform: scale(0);
                    animation: ripple 0.6s linear;
                    pointer-events: none;
                `;

                element.style.position = 'relative';
                element.style.overflow = 'hidden';
                element.appendChild(ripple);

                ripple.addEventListener('animationend', () => {
                    ripple.remove();
                });
            });
        });
    }
}

// Add CSS for ripple animation
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

customElements.define('result-detail-page', ResultDetailPage);
export default ResultDetailPage;