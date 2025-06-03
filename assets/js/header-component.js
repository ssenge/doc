/**
 * Header Component System for TRT Clinic
 * Provides consistent navigation across all pages with dynamic authentication states
 */

class HeaderComponent {
    constructor() {
        this.currentUser = null;
        this.isInitialized = false;
        this.authStateCallbacks = [];
        // Load cached profile if available
        try {
            const cachedProfile = localStorage.getItem('edoc-user-profile');
            if (cachedProfile) {
                window.userProfile = JSON.parse(cachedProfile);
            }
        } catch (e) {
            window.userProfile = undefined;
        }
    }

    // Initialize the header component
    async init() {
        if (this.isInitialized) return;
        
        try {
            console.log('🔧 Initializing header component...');
            
            // Wait for Supabase to be available
            await this.waitForSupabase();
            
            // Check authentication state
            await this.updateAuthState();
            
            // Render the header
            this.render();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Set up auth state monitoring
            this.setupAuthStateMonitoring();
            
            this.isInitialized = true;
            console.log('✅ Header component initialized successfully');
            
        } catch (error) {
            console.error('❌ Header component initialization failed:', error);
            // Fallback to basic header
            this.renderFallback();
        }
    }

    // Wait for Supabase to be available
    waitForSupabase() {
        return new Promise((resolve) => {
            const checkSupabase = () => {
                console.log('🔍 Header: Checking if Supabase is ready...');
                if (window.eDocAuth && window.eDocDatabase && window.eDocSupabase) {
                    console.log('✅ Header: Supabase is ready!');
                    resolve();
                } else {
                    console.log('⏳ Header: Waiting for Supabase...');
                    setTimeout(checkSupabase, 100);
                }
            };
            checkSupabase();
        });
    }

    // Update authentication state
    async updateAuthState() {
        try {
            const previousUser = this.currentUser;
            
            // Retry mechanism for auth state check
            let attempts = 0;
            const maxAttempts = 3;
            
            while (attempts < maxAttempts) {
                attempts++;
                console.log(`🔍 Header: Checking auth state (attempt ${attempts}/${maxAttempts})...`);
                
                this.currentUser = await window.eDocAuth.getCurrentUser();
                
                if (this.currentUser) {
                    console.log('✅ Header: User authenticated -', this.currentUser.email);
                    break;
                } else if (attempts < maxAttempts) {
                    console.log('⏳ Header: No user found, retrying in 200ms...');
                    await new Promise(resolve => setTimeout(resolve, 200));
                } else {
                    console.log('❌ Header: No authenticated user found after retries');
                }
            }
            
            // Log auth state changes
            if (previousUser !== this.currentUser) {
                if (this.currentUser) {
                    console.log('🔄 Header: Auth state changed - User authenticated:', this.currentUser.email);
                } else {
                    console.log('🔄 Header: Auth state changed - User not authenticated');
                }
            }
            
            // Notify callbacks about auth state change
            this.authStateCallbacks.forEach(callback => {
                try {
                    callback(this.currentUser);
                } catch (error) {
                    console.error('Auth state callback error:', error);
                }
            });
            
        } catch (error) {
            console.error('Error updating auth state:', error);
            this.currentUser = null;
        }
    }

    // Subscribe to auth state changes
    onAuthStateChange(callback) {
        this.authStateCallbacks.push(callback);
    }

    // Set up auth state monitoring
    setupAuthStateMonitoring() {
        // Check auth state periodically
        setInterval(() => {
            this.updateAuthState();
        }, 30000); // Check every 30 seconds

        // Listen for storage events (for cross-tab auth state sync)
        window.addEventListener('storage', (e) => {
            if (e.key && e.key.includes('supabase')) {
                setTimeout(() => this.updateAuthState(), 100);
            }
        });
    }

    // Render the complete header
    render() {
        const headerContainer = document.querySelector('nav') || document.querySelector('header');
        
        if (!headerContainer) {
            console.error('No nav or header element found to render header component');
            return;
        }

        headerContainer.innerHTML = this.getHeaderHTML();
        this.updateAuthButtons();
    }

    // Render fallback header (in case of errors)
    renderFallback() {
        const headerContainer = document.querySelector('nav') || document.querySelector('header');
        
        if (!headerContainer) return;

        headerContainer.innerHTML = `
            <div class="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">
                <a href="index.html" class="flex items-center">
                    <span class="self-center text-xl font-semibold whitespace-nowrap text-blue-600">TRT Clinic</span>
                </a>
                <div class="flex items-center space-x-4">
                    <button onclick="window.location.href='login.html'" class="text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-4 py-2.5 border border-gray-300 bg-white">
                        Login
                    </button>
                    <a href="assessment.html" class="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 font-medium rounded-lg text-sm px-4 py-2.5">
                        Start Assessment
                    </a>
                </div>
            </div>
        `;
    }

    // Get the complete header HTML
    getHeaderHTML() {
        return `
            <div class="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">
                <!-- Logo -->
                <a href="index.html" class="flex items-center">
                    <span class="self-center text-xl font-semibold whitespace-nowrap text-blue-600">TRT Clinic</span>
                </a>

                <!-- Navigation Menu (Desktop) -->
                <div class="hidden lg:flex lg:items-center lg:space-x-8">
                    <a href="index.html#how-it-works" class="text-gray-700 hover:text-blue-600 font-medium" data-en="How it Works" data-de="So funktioniert's">How it Works</a>
                    <a href="index.html#testimonials" class="text-gray-700 hover:text-blue-600 font-medium" data-en="Testimonials" data-de="Erfahrungsberichte">Testimonials</a>
                    <a href="index.html#faq" class="text-gray-700 hover:text-blue-600 font-medium" data-en="FAQ" data-de="FAQ">FAQ</a>
                </div>

                <!-- Right Side Controls -->
                <div class="flex items-center space-x-4">
                    <!-- Authentication Buttons Container -->
                    <div id="authButtonsContainer" class="flex items-center space-x-2">
                        <!-- Buttons will be dynamically inserted here -->
                    </div>
                </div>
            </div>
        `;
    }

    // Update authentication buttons based on current state
    updateAuthButtons() {
        const container = document.getElementById('authButtonsContainer');
        if (!container) return;

        if (this.currentUser) {
            // User is authenticated - show welcome, dashboard, lang, logout
            container.innerHTML = this.getAuthenticatedButtonsHTML();
        } else {
            // User is not authenticated - show lang, login
            container.innerHTML = this.getUnauthenticatedButtonsHTML();
        }
        // Always re-attach event listeners after updating buttons
        this.setupEventListeners();
    }

    // Get HTML for authenticated user buttons
    getAuthenticatedButtonsHTML() {
        const firstName = this.getUserFirstName();
        return `
            ${firstName ? `
                <span class="text-sm text-gray-700" data-auth="user-info">
                    <span data-en="Welcome," data-de="Willkommen,">Welcome,</span> 
                    <span id="userFirstName">${firstName}</span>
                </span>
            ` : ''}
            <button onclick="window.location.href='dashboard.html'" class="text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-4 py-2.5 border border-gray-300 bg-white" data-auth="dashboard">
                <span data-en="Dashboard" data-de="Dashboard">Dashboard</span>
            </button>
            <div class="relative">
                <button id="languageDropdown" class="text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-4 py-2.5 text-center inline-flex items-center border border-gray-300 bg-white" type="button">
                    <span id="currentFlag" class="mr-2">🇺🇸</span>
                    <span id="currentLanguage" class="font-semibold">EN</span>
                    <svg class="w-4 h-4 ml-2" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </button>
                <div id="languageMenu" class="z-50 hidden absolute right-0 mt-2 bg-white divide-y divide-gray-100 rounded-lg shadow-lg w-40 border border-gray-200">
                    <ul class="py-2 text-sm text-gray-700">
                        <li><a href="#" onclick="window.eDocLanguage.setLanguage('en')" class="flex items-center px-4 py-2 hover:bg-gray-100 text-gray-900 font-medium">
                            <span class="mr-2">🇺🇸</span>English
                        </a></li>
                        <li><a href="#" onclick="window.eDocLanguage.setLanguage('de')" class="flex items-center px-4 py-2 hover:bg-gray-100 text-gray-900 font-medium">
                            <span class="mr-2">🇩🇪</span>Deutsch
                        </a></li>
                    </ul>
                </div>
            </div>
            <button onclick="window.headerComponent.handleLogout()" class="text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-4 py-2.5 border border-gray-300 bg-white" data-auth="logout">
                <span data-en="Logout" data-de="Abmelden">Logout</span>
            </button>
        `;
    }

    // Get HTML for unauthenticated user buttons
    getUnauthenticatedButtonsHTML() {
        return `
            <div class="relative">
                <button id="languageDropdown" class="text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-4 py-2.5 text-center inline-flex items-center border border-gray-300 bg-white" type="button">
                    <span id="currentFlag" class="mr-2">🇺🇸</span>
                    <span id="currentLanguage" class="font-semibold">EN</span>
                    <svg class="w-4 h-4 ml-2" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </button>
                <div id="languageMenu" class="z-50 hidden absolute right-0 mt-2 bg-white divide-y divide-gray-100 rounded-lg shadow-lg w-40 border border-gray-200">
                    <ul class="py-2 text-sm text-gray-700">
                        <li><a href="#" onclick="window.eDocLanguage.setLanguage('en')" class="flex items-center px-4 py-2 hover:bg-gray-100 text-gray-900 font-medium">
                            <span class="mr-2">🇺🇸</span>English
                        </a></li>
                        <li><a href="#" onclick="window.eDocLanguage.setLanguage('de')" class="flex items-center px-4 py-2 hover:bg-gray-100 text-gray-900 font-medium">
                            <span class="mr-2">🇩🇪</span>Deutsch
                        </a></li>
                    </ul>
                </div>
            </div>
            <button onclick="window.location.href='login.html'" class="text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-4 py-2.5 border border-gray-300 bg-white" data-auth="login">
                <span data-en="Login" data-de="Anmelden">Login</span>
            </button>
        `;
    }

    // Get user's first name for display
    getUserFirstName() {
        if (!this.currentUser) return null;
        
        // First priority: Try to get from user metadata (profile data)
        if (this.currentUser.user_metadata?.first_name) {
            return this.currentUser.user_metadata.first_name;
        }
        
        // Second priority: Try to get from app metadata
        if (this.currentUser.app_metadata?.first_name) {
            return this.currentUser.app_metadata.first_name;
        }
        
        // Third priority: Check if we have access to the global userProfile
        if (window.userProfile?.first_name) {
            return window.userProfile.first_name;
        }
        
        // Fourth priority: Check if dashboard has loaded profile data
        if (window.currentUser && window.userProfile?.first_name) {
            return window.userProfile.first_name;
        }
        
        // DO NOT use email prefix - return null if no real first name available
        // This prevents showing "Welcome, Mail" before profile data loads
        return null;
    }

    // Set up event listeners
    setupEventListeners() {
        // Language dropdown
        this.setupLanguageDropdown();
        
        // Mobile menu toggle (if needed in future)
        this.setupMobileMenu();
    }

    // Set up language dropdown functionality
    setupLanguageDropdown() {
        const dropdownButton = document.getElementById('languageDropdown');
        const dropdownMenu = document.getElementById('languageMenu');
        
        if (dropdownButton && dropdownMenu) {
            dropdownButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropdownMenu.classList.toggle('hidden');
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!dropdownButton.contains(e.target) && !dropdownMenu.contains(e.target)) {
                    dropdownMenu.classList.add('hidden');
                }
            });
            
            // Close dropdown when selecting a language
            dropdownMenu.addEventListener('click', () => {
                dropdownMenu.classList.add('hidden');
            });
        }
    }

    // Set up mobile menu (placeholder for future enhancement)
    setupMobileMenu() {
        // Mobile menu functionality can be added here if needed
    }

    // Handle logout
    async handleLogout() {
        if (confirm('Are you sure you want to logout?')) {
            try {
                if (window.eDocAuth) {
                    await window.eDocAuth.signOut();
                }
                // Remove cached profile
                localStorage.removeItem('edoc-user-profile');
                // Update auth state
                await this.updateAuthState();
                // Update buttons
                this.updateAuthButtons();
                // Redirect to home page
                window.location.href = 'index.html';
            } catch (error) {
                console.error('Logout error:', error);
                alert('Logout failed. Please try again.');
            }
        }
    }

    // Refresh the header (useful for external calls)
    async refresh() {
        console.log('🔄 Header component refresh requested...');
        
        try {
            // Update authentication state
            await this.updateAuthState();
            
            // Update the auth buttons in the UI
            this.updateAuthButtons();
            
            // Apply language if available
            if (window.switchLanguage) {
                const currentLang = localStorage.getItem('selectedLanguage') || 'en';
                window.switchLanguage(currentLang);
            }
            
            console.log('✅ Header component refreshed successfully. Auth state:', 
                this.currentUser ? `Authenticated as ${this.currentUser.email}` : 'Not authenticated');
                
        } catch (error) {
            console.error('❌ Error refreshing header component:', error);
        }
    }

    // Update user's first name (called from dashboard when profile is updated)
    updateUserFirstName(firstName) {
        const userFirstNameElement = document.getElementById('userFirstName');
        if (userFirstNameElement && firstName) {
            userFirstNameElement.textContent = firstName;
        }
    }

    // Force update authentication state (called from dashboard)
    forceAuthUpdate(user) {
        console.log('🔄 Header: Force auth update called with user:', user?.email || 'null');
        this.currentUser = user;
        this.updateAuthButtons();
        console.log('✅ Header: Force auth update completed');
    }

    // Static method to update cached profile
    static cacheUserProfile(profile) {
        try {
            localStorage.setItem('edoc-user-profile', JSON.stringify(profile));
            window.userProfile = profile;
        } catch (e) {
            // Ignore
        }
    }
}

// Make the class available globally immediately
window.HeaderComponent = HeaderComponent;

// Initialize header component when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    // Create global header component instance
    window.headerComponent = new HeaderComponent();
    
    // Initialize the header
    await window.headerComponent.init();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HeaderComponent;
} 