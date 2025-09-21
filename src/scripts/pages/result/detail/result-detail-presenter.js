// result-detail-presenter.js
import { navigateToUrl, getQueryParams } from '../../../routes/routes';
import ScanService from '../../../services/scan-service';
import { auth } from '../../../../server/config/firebase';

class ResultDetailPresenter {
    constructor(view) {
        this.view = view;
        this.scanId = null;
        this.scanData = null;
        this.animationQueue = [];
    }

    async init() {
        try {
            this.setupEventListeners();
            this.setupAnimationObserver();
            await this.loadScanData();
        } catch (error) {
            console.error('Initialization error:', error);
            this.showErrorState(error.message);
        }
    }

    setupEventListeners() {
        const backButton = this.view.querySelector('#backButton');
        if (backButton) {
            // Add enhanced back button animation
            backButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.animateExit(() => {
                    navigateToUrl('/history');
                });
            });

            // Add hover sound effect (optional)
            backButton.addEventListener('mouseenter', () => {
                backButton.style.transform = 'translateX(-2px)';
                backButton.style.transition = 'transform 0.2s ease-out';
            });

            backButton.addEventListener('mouseleave', () => {
                backButton.style.transform = 'translateX(0)';
            });
        }

        const retryButton = this.view.querySelector('#retryButton');
        if (retryButton) {
            retryButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.animateRetry();
            });
        }
    }

    setupAnimationObserver() {
        // Intersection Observer for scroll-triggered animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.triggerElementAnimation(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        // Observe sections for scroll animations
        setTimeout(() => {
            const sections = this.view.querySelectorAll('.animate-on-scroll');
            sections.forEach(section => observer.observe(section));
        }, 100);
    }

    triggerElementAnimation(element) {
        const animationType = element.dataset.animation || 'fadeInUp';
        element.classList.add(`animate-${animationType}`);
    }

    animateExit(callback) {
        const content = this.view.querySelector('#resultDetailContent');
        if (content) {
            content.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
            content.style.transform = 'translateX(-100%)';
            content.style.opacity = '0';

            setTimeout(callback, 500);
        } else {
            callback();
        }
    }

    animateRetry() {
        const retryButton = this.view.querySelector('#retryButton');
        if (retryButton) {
            retryButton.style.transform = 'scale(0.95)';
            retryButton.style.transition = 'transform 0.1s ease-out';

            setTimeout(() => {
                retryButton.style.transform = 'scale(1)';
                this.loadScanData();
            }, 100);
        }
    }

    async loadScanData() {
        try {
            this.showLoadingState();

            // Get scan ID from URL
            const queryParams = getQueryParams();
            this.scanId = queryParams.scanId;

            if (!this.scanId) {
                throw new Error('No scan ID provided');
            }

            // Get current user
            const user = auth.currentUser;
            if (!user) {
                const userData = JSON.parse(localStorage.getItem('userData'));
                if (!userData || !userData.uid) {
                    throw new Error('User not authenticated');
                }
                this.userId = userData.uid;
            } else {
                this.userId = user.uid;
            }

            // Simulate loading delay for better UX
            await new Promise(resolve => setTimeout(resolve, 500));

            // Load scan data from Firestore
            this.scanData = await ScanService.getScanById(this.userId, this.scanId);

            if (!this.scanData) {
                throw new Error('Scan data not found');
            }

            // Animate the transition from loading to content
            await this.animateLoadingToContent();
            this.renderScanData();

        } catch (error) {
            console.error('Failed to load scan data:', error);
            this.showErrorState(error.message);
        }
    }

    async animateLoadingToContent() {
        return new Promise(resolve => {
            const loadingIndicator = this.view.querySelector('#loadingIndicator');
            const resultContent = this.view.querySelector('#resultDetailContent');

            // Animate loading out
            loadingIndicator.style.transition = 'all 0.4s ease-out';
            loadingIndicator.style.transform = 'scale(0.8)';
            loadingIndicator.style.opacity = '0';

            setTimeout(() => {
                loadingIndicator.classList.add('hidden');
                resultContent.classList.remove('hidden');

                // Animate content in
                resultContent.style.opacity = '0';
                resultContent.style.transform = 'translateY(20px)';
                resultContent.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';

                setTimeout(() => {
                    resultContent.style.opacity = '1';
                    resultContent.style.transform = 'translateY(0)';
                    resolve();
                }, 50);
            }, 400);
        });
    }

    renderScanData() {
        // Set timestamp with animation
        this.animateTimestamp();

        // Set image with progressive loading
        this.animateImageLoad();

        // Render predictions with staggered animation
        this.animatePredictions();

        // Render dominant result with emphasis
        this.animateDominantResult();

        // Render recommendations with cascading effect
        this.animateRecommendations();

        // Add micro-interactions
        this.addMicroInteractions();
    }

    animateTimestamp() {
        const timestampElement = this.view.querySelector('#scanTimestamp');
        if (timestampElement && this.scanData.timestamp) {
            const date = new Date(this.scanData.timestamp);

            // Typewriter effect for timestamp
            const text = `Scanned on ${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;
            let index = 0;

            timestampElement.textContent = '';
            timestampElement.classList.add('animate-fade-in-right');

            const typeWriter = () => {
                if (index < text.length) {
                    timestampElement.textContent += text.charAt(index);
                    index++;
                    setTimeout(typeWriter, 30);
                }
            };

            setTimeout(typeWriter, 300);
        }
    }

    animateImageLoad() {
        const imageElement = this.view.querySelector('#resultImage');
        if (imageElement && this.scanData.image) {
            // Add loading shimmer
            imageElement.style.background = 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)';
            imageElement.style.backgroundSize = '200% 100%';
            imageElement.classList.add('shimmer');

            const img = new Image();
            img.onload = () => {
                imageElement.classList.remove('shimmer');
                imageElement.style.background = '';
                imageElement.src = this.scanData.image;
                imageElement.alt = `Scan result showing ${this.scanData.dominantAcne}`;

                // Add reveal animation
                imageElement.style.opacity = '0';
                imageElement.style.transform = 'scale(1.1)';
                imageElement.style.transition = 'all 0.6s ease-out';

                setTimeout(() => {
                    imageElement.style.opacity = '1';
                    imageElement.style.transform = 'scale(1)';
                }, 100);
            };

            img.src = this.scanData.image;
        }
    }

    animatePredictions() {
        const resultsContainer = this.view.querySelector('#resultsContainer');
        if (!resultsContainer || !this.scanData.predictions) return;

        const predictions = this.scanData.predictions.map((prediction, index) => {
            const percentage = Math.round(prediction.confidence * 100);
            const isHighest = this.scanData.dominantAcne === prediction.label;

            return {
                html: `
                    <div class="flex justify-between items-center p-3 ${isHighest ? 'bg-blue-50 border border-blue-200' : 'bg-white border border-gray-100'} rounded-lg transition-all duration-300 hover:shadow-md hover-scale prediction-item" 
                         style="opacity: 0; transform: translateX(-20px);" data-index="${index}">
                        <span class="${isHighest ? 'font-semibold text-blue-800' : 'text-gray-700'} transition-colors duration-200">
                            ${prediction.label}
                        </span>
                        <div class="flex items-center">
                            <div class="w-24 bg-gray-200 rounded-full h-3 mr-3 overflow-hidden">
                                <div class="h-3 rounded-full ${isHighest ? 'bg-gradient-to-r from-blue-400 to-blue-600' : 'bg-gradient-to-r from-gray-300 to-gray-500'} confidence-bar" 
                                    style="width: 0%; transition: width 1s ease-out;" data-width="${percentage}%"></div>
                            </div>
                            <span class="text-sm font-medium ${isHighest ? 'text-blue-600' : 'text-gray-600'} transition-colors duration-200">
                                ${percentage}%
                            </span>
                        </div>
                    </div>
                `,
                percentage
            };
        });

        resultsContainer.innerHTML = predictions.map(p => p.html).join('');

        // Animate each prediction item
        const predictionItems = resultsContainer.querySelectorAll('.prediction-item');
        predictionItems.forEach((item, index) => {
            setTimeout(() => {
                item.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
                item.style.opacity = '1';
                item.style.transform = 'translateX(0)';

                // Animate progress bar
                setTimeout(() => {
                    const progressBar = item.querySelector('.confidence-bar');
                    const targetWidth = progressBar.dataset.width;
                    progressBar.style.width = targetWidth;
                }, 200);
            }, index * 100);
        });
    }

    animateDominantResult() {
        const dominantResultContainer = this.view.querySelector('#dominantResult');
        if (!dominantResultContainer || !this.scanData.dominantAcne) return;

        const confidence = Math.round(this.scanData.confidence * 100);

        dominantResultContainer.innerHTML = `
            <div class="flex items-center space-x-3" style="opacity: 0; transform: scale(0.8);">
                <div class="w-5 h-5 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full animate-pulse"></div>
                <div>
                    <h4 class="text-xl font-bold text-blue-900">${this.scanData.dominantAcne}</h4>
                    <p class="text-sm text-blue-700">
                        Confidence: <span class="font-bold confidence-number">0</span>%
                    </p>
                </div>
            </div>
        `;

        // Animate dominant result
        setTimeout(() => {
            const container = dominantResultContainer.querySelector('div');
            container.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            container.style.opacity = '1';
            container.style.transform = 'scale(1)';

            // Animate confidence number
            this.animateNumber(dominantResultContainer.querySelector('.confidence-number'), 0, confidence, 1000);
        }, 800);
    }

    animateRecommendations() {
        const recommendationContainer = this.view.querySelector('#recommendation');
        if (!recommendationContainer || !this.scanData.recommendations) return;

        const rec = this.scanData.recommendations;

        recommendationContainer.innerHTML = `
            <div class="grid md:grid-cols-2 gap-6">
                <div class="bg-green-50 p-6 rounded-lg border border-green-200 card-hover hover-lift recommendation-card" 
                     style="opacity: 0; transform: translateY(30px);">
                    <h3 class="text-lg font-semibold text-green-800 mb-4 flex items-center">
                        <svg class="w-5 h-5 mr-2 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        Treatment Steps
                    </h3>
                    <ul class="space-y-3 treatment-list">
                        ${rec.treatment.map((step, index) => `
                            <li class="flex items-start treatment-item" style="opacity: 0; transform: translateX(-20px);" data-index="${index}">
                                <div class="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0 animate-pulse"></div>
                                <span class="text-green-700 hover:text-green-800 transition-colors duration-200">${step}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>

                <div class="bg-blue-50 p-6 rounded-lg border border-blue-200 card-hover hover-lift recommendation-card" 
                     style="opacity: 0; transform: translateY(30px);">
                    <h3 class="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                        <svg class="w-5 h-5 mr-2 animate-float" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5L8 4z"/>
                        </svg>
                        Key Ingredients
                    </h3>
                    <div class="flex flex-wrap gap-2 mb-4 ingredients-container">
                        ${rec.ingredients.map((ingredient, index) => `
                            <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium hover:bg-blue-200 transition-all duration-200 hover-scale ingredient-tag" 
                                  style="opacity: 0; transform: scale(0.8);" data-index="${index}">
                                ${ingredient}
                            </span>
                        `).join('')}
                    </div>
                    <div class="p-3 bg-blue-100 rounded-lg severity-info" style="opacity: 0; transform: translateY(10px);">
                        <p class="text-blue-800 font-medium">Severity Level: 
                            <span class="font-bold text-lg animate-pulse">${rec.severity}</span>
                        </p>
                    </div>
                </div>
            </div>
        `;

        // Animate recommendation cards
        const cards = recommendationContainer.querySelectorAll('.recommendation-card');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';

                // Animate treatment items
                if (index === 0) {
                    const treatmentItems = card.querySelectorAll('.treatment-item');
                    treatmentItems.forEach((item, itemIndex) => {
                        setTimeout(() => {
                            item.style.transition = 'all 0.4s ease-out';
                            item.style.opacity = '1';
                            item.style.transform = 'translateX(0)';
                        }, itemIndex * 100);
                    });
                }

                // Animate ingredient tags
                if (index === 1) {
                    const ingredientTags = card.querySelectorAll('.ingredient-tag');
                    ingredientTags.forEach((tag, tagIndex) => {
                        setTimeout(() => {
                            tag.style.transition = 'all 0.3s ease-out';
                            tag.style.opacity = '1';
                            tag.style.transform = 'scale(1)';
                        }, tagIndex * 50);
                    });

                    // Animate severity info
                    setTimeout(() => {
                        const severityInfo = card.querySelector('.severity-info');
                        severityInfo.style.transition = 'all 0.4s ease-out';
                        severityInfo.style.opacity = '1';
                        severityInfo.style.transform = 'translateY(0)';
                    }, ingredientTags.length * 50 + 200);
                }
            }, index * 200 + 1000);
        });
    }

    animateNumber(element, start, end, duration) {
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const easeOutCubic = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(start + (end - start) * easeOutCubic);

            element.textContent = current;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    addMicroInteractions() {
        // Add subtle hover effects to cards
        const cards = this.view.querySelectorAll('.card-hover');
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-2px)';
                card.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)';
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
                card.style.boxShadow = '';
            });
        });

        // Add click feedback
        const interactiveElements = this.view.querySelectorAll('button, .hover-scale, .card-hover');
        interactiveElements.forEach(element => {
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
                    background: rgba(59, 130, 246, 0.3);
                    border-radius: 50%;
                    transform: scale(0);
                    animation: ripple 0.6s ease-out;
                    pointer-events: none;
                    z-index: 1000;
                `;

                element.style.position = 'relative';
                element.style.overflow = 'hidden';
                element.appendChild(ripple);

                setTimeout(() => ripple.remove(), 600);
            });
        });
    }

    showLoadingState() {
        this.view.querySelector('#loadingIndicator').classList.remove('hidden');
        this.view.querySelector('#errorMessage').classList.add('hidden');
        this.view.querySelector('#resultDetailContent').classList.add('hidden');
    }

    showErrorState(message) {
        this.view.querySelector('#loadingIndicator').classList.add('hidden');

        const errorElement = this.view.querySelector('#errorMessage');
        errorElement.classList.remove('hidden');
        errorElement.classList.add('animate-fade-in-up');

        this.view.querySelector('#resultDetailContent').classList.add('hidden');

        const errorMessage = this.view.querySelector('#errorMessage p');
        if (errorMessage) {
            errorMessage.textContent = message || 'Failed to load scan details';
        }
    }
}

export default ResultDetailPresenter;