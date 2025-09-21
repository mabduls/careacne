import { navigateToUrl } from '../../routes/routes';
import ScanService from '../../../scripts/services/scan-service';
import { auth } from '../../../server/config/firebase';
import { initializeAuth, getCurrentUser, getToken } from '../../utils/auth';

class HistoryPresenter {
    constructor(view) {
        this.view = view;
        initializeAuth();
        this.scans = [];
        this.currentPage = 1;
        this.scansPerPage = 6;
        this.currentFilter = 'all';
        this.currentSort = 'newest';
        this.userId = null;
        this.unsubscribeAuth = null;
        this.init = this.init.bind(this);
    }

    async init() {
        try {
            this.setupEventListeners();
            await this.initializeUser();
            await this.loadScanHistory();
        } catch (error) {
            console.error('Initialization error:', error);
            this.showErrorState(error.message);
        }
    }

    setupEventListeners() {
        const backButton = this.view.querySelector('#backButton');
        backButton?.addEventListener('click', () => {
            this.animateButtonClick(backButton);
            setTimeout(() => navigateToUrl('/dashboard'), 150);
        });

        const startScanButton = this.view.querySelector('#startScanButton');
        startScanButton?.addEventListener('click', () => {
            this.animateButtonClick(startScanButton);
            setTimeout(() => navigateToUrl('/dashboard'), 150);
        });

        const filterType = this.view.querySelector('#filterType');
        filterType?.addEventListener('change', (e) => {
            this.currentFilter = e.target.value;
            this.animateFilterChange();
            setTimeout(() => this.filterAndSortScans(), 200);
        });

        const sortBy = this.view.querySelector('#sortBy');
        sortBy?.addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.animateFilterChange();
            setTimeout(() => this.filterAndSortScans(), 200);
        });

        this.view.querySelector('#prevPageButton')?.addEventListener('click', (e) => {
            if (this.currentPage > 1) {
                this.animateButtonClick(e.target);
                this.currentPage--;
                this.animatePageTransition(() => this.renderScans());
            }
        });

        this.view.querySelector('#nextPageButton')?.addEventListener('click', (e) => {
            const totalPages = Math.ceil(this.filteredScans.length / this.scansPerPage);
            if (this.currentPage < totalPages) {
                this.animateButtonClick(e.target);
                this.currentPage++;
                this.animatePageTransition(() => this.renderScans());
            }
        });
    }

    // Animation helper methods
    animateButtonClick(button) {
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 150);
    }

    animateFilterChange() {
        const grid = this.view.querySelector('#scanResultsGrid');
        if (grid) {
            grid.style.opacity = '0.5';
            grid.style.transform = 'translateY(10px)';
        }
    }

    animatePageTransition(callback) {
        const grid = this.view.querySelector('#scanResultsGrid');
        if (grid) {
            grid.style.opacity = '0';
            grid.style.transform = 'translateY(20px)';

            setTimeout(() => {
                callback();
                grid.style.opacity = '1';
                grid.style.transform = 'translateY(0)';
            }, 200);
        } else {
            callback();
        }
    }

    resetGridAnimation() {
        const grid = this.view.querySelector('#scanResultsGrid');
        if (grid) {
            grid.style.opacity = '1';
            grid.style.transform = 'translateY(0)';
        }
    }

    async initializeUser() {
        // First check localStorage
        const storedUser = JSON.parse(localStorage.getItem('userData'));
        if (storedUser) {
            this.userId = storedUser.uid;
            return;
        }

        // Then check auth state
        const user = await initializeAuth();
        if (user) {
            this.userId = user.uid;
            return;
        }

        // If still no user, redirect to login
        throw new Error('User not authenticated');
    }

    async loadScanHistory() {
        try {
            this.showLoadingState();
            if (!this.userId) throw new Error('User ID not available');

            const token = await getToken();

            console.log('Loading scans for user:', this.userId);

            this.scans = await ScanService.getUserScans(this.userId, token);

            console.log('Loaded scans:', this.scans);

            if (this.scans.length === 0) {
                this.showEmptyState('No scan history yet. Start your first scan!');
                return;
            }

            this.filterAndSortScans();
        } catch (error) {
            console.error('Failed to load scan history:', error);

            let errorMessage = error.message;
            if (error.message.includes('permission-denied')) {
                errorMessage = 'Access denied. Please login again.';
            } else if (error.message.includes('failed-precondition')) {
                errorMessage = 'Database configuration issue. Please contact support.';
            }

            this.showErrorState(errorMessage);

            if (/auth|authenticated|permission|denied/i.test(error.message)) {
                localStorage.clear();
                sessionStorage.clear();
                setTimeout(() => navigateToUrl('/login'), 2000);
            }
        }
    }

    filterAndSortScans() {
        if (!Array.isArray(this.scans)) {
            console.error('Scans is not an array:', this.scans);
            this.scans = [];
        }

        this.filteredScans = this.scans.filter(scan => {
            if (this.currentFilter === 'all') return true;
            return (scan.dominantAcne || '').toLowerCase().includes(this.currentFilter.toLowerCase());
        });

        this.filteredScans.sort((a, b) => {
            const aTime = new Date(a.timestamp || a.createdAt || 0);
            const bTime = new Date(b.timestamp || b.createdAt || 0);

            switch (this.currentSort) {
                case 'newest': return bTime - aTime;
                case 'oldest': return aTime - bTime;
                case 'confidence': return (b.confidence || 0) - (a.confidence || 0);
                default: return 0;
            }
        });

        this.currentPage = 1;

        // Add smooth transition
        setTimeout(() => {
            this.renderScans();
            this.resetGridAnimation();
        }, 100);
    }

    renderScans() {
        const scanResultsGrid = this.view.querySelector('#scanResultsGrid');
        const paginationControls = this.view.querySelector('#paginationControls');
        const pageInfo = this.view.querySelector('#pageInfo');
        const emptyState = this.view.querySelector('#emptyState');
        const loadingIndicator = this.view.querySelector('#loadingIndicator');

        loadingIndicator?.classList.add('hidden');

        if (!this.filteredScans || this.filteredScans.length === 0) {
            scanResultsGrid?.classList.add('hidden');
            paginationControls?.classList.add('hidden');
            this.showEmptyState('No scan results found for the selected filter.');
            return;
        }

        emptyState?.classList.add('hidden');
        scanResultsGrid?.classList.remove('hidden');

        const startIndex = (this.currentPage - 1) * this.scansPerPage;
        const endIndex = startIndex + this.scansPerPage;
        const scansToShow = this.filteredScans.slice(startIndex, endIndex);
        const totalPages = Math.ceil(this.filteredScans.length / this.scansPerPage);

        scanResultsGrid.innerHTML = scansToShow.map(scan => this.createScanCard(scan)).join('');

        if (this.filteredScans.length > this.scansPerPage) {
            paginationControls?.classList.remove('hidden');
            if (pageInfo) {
                pageInfo.textContent = `Page ${this.currentPage} of ${totalPages}`;
            }

            const prevButton = this.view.querySelector('#prevPageButton');
            const nextButton = this.view.querySelector('#nextPageButton');

            if (prevButton) prevButton.disabled = this.currentPage === 1;
            if (nextButton) nextButton.disabled = this.currentPage === totalPages;
        } else {
            paginationControls?.classList.add('hidden');
        }

        // Enhanced event listeners for scan cards
        this.view.querySelectorAll('.scan-card').forEach((card, index) => {
            // Reset animation state and trigger staggered animation
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';

            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);

            card.addEventListener('click', (e) => {
                this.animateCardClick(card);
                const scanId = card.dataset.scanId;
                if (scanId) {
                    setTimeout(() => navigateToUrl(`/result-detail?scanId=${scanId}`), 200);
                }
            });

            // Add hover sound effect simulation (visual feedback)
            card.addEventListener('mouseenter', () => {
                this.addHoverEffect(card);
            });

            card.addEventListener('mouseleave', () => {
                this.removeHoverEffect(card);
            });
        });
    }

    animateCardClick(card) {
        card.style.transform = 'translateY(-8px) scale(0.98)';
        setTimeout(() => {
            card.style.transform = 'translateY(-8px) scale(1.02)';
        }, 100);
    }

    addHoverEffect(card) {
        const img = card.querySelector('img');
        if (img) {
            img.style.transform = 'scale(1.05)';
        }

        const badge = card.querySelector('.date-badge');
        if (badge) {
            badge.style.background = 'rgba(0, 0, 0, 0.8)';
        }
    }

    removeHoverEffect(card) {
        const img = card.querySelector('img');
        if (img) {
            img.style.transform = 'scale(1)';
        }

        const badge = card.querySelector('.date-badge');
        if (badge) {
            badge.style.background = 'rgba(0, 0, 0, 0.5)';
        }
    }

    createScanCard(scan) {
        const date = new Date(scan.timestamp || scan.createdAt || Date.now());
        const formattedDate = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        const confidencePercentage = Math.round((scan.confidence || 0) * 100);
        const severityClass = confidencePercentage >= 80 ? 'bg-red-100 text-red-800' :
            confidencePercentage >= 60 ? 'bg-orange-100 text-orange-800' :
                'bg-green-100 text-green-800';

        let recommendations = [];
        if (scan.recommendations) {
            if (Array.isArray(scan.recommendations)) {
                recommendations = scan.recommendations;
            } else if (scan.recommendations.ingredients) {
                recommendations = scan.recommendations.ingredients;
            } else if (scan.recommendations.treatment) {
                recommendations = scan.recommendations.treatment;
            }
        }

        return `
        <div class="scan-card bg-white rounded-xl shadow-md overflow-hidden cursor-pointer" data-scan-id="${scan.id || scan.scanId}">
            <div class="relative h-40 bg-gray-100 overflow-hidden">
                ${scan.image ?
                `<img src="${scan.image}" alt="Scan result" class="w-full h-full object-cover transition-transform duration-300">` :
                `<div class="w-full h-full flex items-center justify-center bg-gray-200">
                        <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                    </div>`
            }
                <div class="absolute bottom-2 right-2 date-badge bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                    ${formattedDate}
                </div>
            </div>
            <div class="p-4">
                <div class="flex justify-between items-start mb-2">
                    <h3 class="font-semibold text-teal-700">${scan.dominantAcne || 'Acne Detection'}</h3>
                    <span class="confidence-badge text-xs px-2 py-1 rounded-full ${severityClass}">${confidencePercentage}%</span>
                </div>
                <div class="flex flex-wrap gap-1 mt-2">
                    ${recommendations.slice(0, 3).map((item, index) => `
                        <span class="recommendation-tag text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full" style="animation-delay: ${index * 0.1}s">
                            ${typeof item === 'string' ? item : (item.name || 'Item')}
                        </span>
                    `).join('')}
                </div>
            </div>
        </div>`;
    }

    showLoadingState() {
        const elements = {
            scanResultsGrid: this.view.querySelector('#scanResultsGrid'),
            paginationControls: this.view.querySelector('#paginationControls'),
            emptyState: this.view.querySelector('#emptyState'),
            loadingIndicator: this.view.querySelector('#loadingIndicator')
        };

        elements.scanResultsGrid?.classList.add('hidden');
        elements.paginationControls?.classList.add('hidden');
        elements.emptyState?.classList.add('hidden');
        elements.loadingIndicator?.classList.remove('hidden');

        // Add pulsing effect to loading
        const spinner = elements.loadingIndicator?.querySelector('div');
        if (spinner) {
            spinner.classList.add('loading-spinner');
        }
    }

    showEmptyState(message) {
        const elements = {
            loadingIndicator: this.view.querySelector('#loadingIndicator'),
            scanResultsGrid: this.view.querySelector('#scanResultsGrid'),
            paginationControls: this.view.querySelector('#paginationControls'),
            emptyState: this.view.querySelector('#emptyState')
        };

        elements.loadingIndicator?.classList.add('hidden');
        elements.scanResultsGrid?.classList.add('hidden');
        elements.paginationControls?.classList.add('hidden');

        if (elements.emptyState) {
            elements.emptyState.classList.remove('hidden');
            elements.emptyState.innerHTML = `
                <div class="p-6 bg-gray-50 rounded-xl border border-gray-200">
                    <div class="flex flex-col items-center text-center">
                        <svg class="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="animation: pulse 2s infinite">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                        </svg>
                        <h3 class="text-xl font-semibold text-gray-700 mb-2">No Scan History</h3>
                        <p class="text-gray-600 mb-4">${message}</p>
                        <button id="startFirstScanButton" class="btn-primary bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700">
                            Start Your First Scan
                        </button>
                    </div>
                </div>
            `;

            // Add click event with animation
            const startFirstScanButton = this.view.querySelector('#startFirstScanButton');
            startFirstScanButton?.addEventListener('click', (e) => {
                this.animateButtonClick(e.target);
                setTimeout(() => navigateToUrl('/dashboard'), 200);
            });
        }
    }

    showErrorState(message) {
        const elements = {
            loadingIndicator: this.view.querySelector('#loadingIndicator'),
            scanResultsGrid: this.view.querySelector('#scanResultsGrid'),
            paginationControls: this.view.querySelector('#paginationControls'),
            emptyState: this.view.querySelector('#emptyState')
        };

        elements.loadingIndicator?.classList.add('hidden');
        elements.scanResultsGrid?.classList.add('hidden');
        elements.paginationControls?.classList.add('hidden');

        if (elements.emptyState) {
            elements.emptyState.classList.remove('hidden');
            elements.emptyState.innerHTML = `
                <div class="p-6 bg-red-50 rounded-xl border border-red-200" style="animation: fadeIn 0.8s ease-out">
                    <div class="flex flex-col items-center text-center">
                        <svg class="w-16 h-16 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="animation: pulse 2s infinite">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                        </svg>
                        <h3 class="text-xl font-semibold text-red-700 mb-2">Failed to Load History</h3>
                        <p class="text-gray-600 mb-4">${message}</p>
                        <button id="retryButton" class="btn-primary bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700">
                            Try Again
                        </button>
                    </div>
                </div>
            `;

            // Add retry button animation
            const retryButton = this.view.querySelector('#retryButton');
            retryButton?.addEventListener('click', (e) => {
                this.animateButtonClick(e.target);
                setTimeout(() => this.loadScanHistory(), 200);
            });
        }
    }

    // Additional utility methods for enhanced UX
    showSuccessMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        messageDiv.style.animation = 'slideInRight 0.3s ease-out';
        messageDiv.textContent = message;

        document.body.appendChild(messageDiv);

        setTimeout(() => {
            messageDiv.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => messageDiv.remove(), 300);
        }, 3000);
    }

    addLoadingShimmer() {
        const grid = this.view.querySelector('#scanResultsGrid');
        if (grid) {
            const shimmerCards = Array.from({ length: 6 }, (_, i) => `
                <div class="bg-white rounded-xl shadow-md overflow-hidden">
                    <div class="h-40 bg-gray-200 loading-shimmer"></div>
                    <div class="p-4">
                        <div class="h-4 bg-gray-200 loading-shimmer rounded mb-2"></div>
                        <div class="h-3 bg-gray-200 loading-shimmer rounded w-2/3"></div>
                        <div class="flex gap-2 mt-2">
                            <div class="h-6 w-16 bg-gray-200 loading-shimmer rounded-full"></div>
                            <div class="h-6 w-20 bg-gray-200 loading-shimmer rounded-full"></div>
                        </div>
                    </div>
                </div>
            `).join('');

            grid.innerHTML = shimmerCards;
            grid.classList.remove('hidden');
        }
    }
}

export default HistoryPresenter;