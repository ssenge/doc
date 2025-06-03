/**
 * Dashboard functionality for TRT Clinic
 * Handles user profile, orders, and account management
 */

// Dashboard state
let currentUser = null;
let userProfile = null;
let userOrders = [];

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', async function() {
    try {
        console.log('🚀 Dashboard initialization started');
        
        // Wait for Supabase to be available AND initialized (same as header component)
        let attempts = 0;
        while (attempts < 100) { // Increased attempts
            attempts++;
            console.log(`🔍 Dashboard: Checking if Supabase is ready (attempt ${attempts}/100)...`);
            
            // Check if eDocAuth exists AND Supabase client is actually initialized
            if (window.eDocAuth && window.eDocDatabase && window.eDocSupabase) {
                // Additional check: try to call getCurrentUser to see if it works
                try {
                    const testUser = await window.eDocAuth.getCurrentUser();
                    console.log('✅ Dashboard: Supabase is ready and working!');
                    break;
                } catch (error) {
                    if (error.message && error.message.includes('not initialized')) {
                        console.log('⏳ Dashboard: Supabase client still initializing...');
                        await new Promise(resolve => setTimeout(resolve, 100));
                        continue;
                    } else {
                        // Other error, but Supabase is ready
                        console.log('✅ Dashboard: Supabase is ready (with auth error, but that\'s ok)');
                        break;
                    }
                }
            } else {
                console.log('⏳ Dashboard: Waiting for Supabase objects...');
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
        
        if (attempts >= 100) {
            console.error('❌ Supabase not ready after 10 seconds');
            redirectToLogin();
            return;
        }
        
        console.log('✅ Supabase is ready');
        
        // Check authentication (simplified, same as test page)
        console.log('🔍 Checking authentication...');
        currentUser = await window.eDocAuth.getCurrentUser();
        
        if (!currentUser) {
            console.log('❌ No authenticated user found, redirecting to login');
            redirectToLogin();
            return;
        }
        
        console.log('✅ User authenticated:', currentUser.email);
        
        // SIMPLIFIED: Skip complex data loading for now
        console.log('🔄 Loading dashboard data...');
        try {
            await loadDashboardData();
            console.log('✅ Dashboard data loaded successfully');
            
            // Update header with correct first name from profile
            if (window.headerComponent && userProfile?.first_name) {
                console.log('🔄 Updating header with first name:', userProfile.first_name);
                window.headerComponent.updateUserFirstName(userProfile.first_name);
            }
            
            // Make profile data globally available for header component
            window.userProfile = userProfile;
            
            // Cache profile immediately after loading
            if (window.HeaderComponent && userProfile) {
                console.log('🔄 Immediate caching of user profile after loading');
                window.HeaderComponent.cacheUserProfile(userProfile);
            }
            
        } catch (error) {
            console.warn('⚠️ Dashboard data loading failed, but continuing:', error);
            // Don't redirect on data loading failure - just show empty state
        }
        
        // Initialize dashboard UI
        console.log('🔄 Initializing dashboard UI...');
        initializeDashboard();
        console.log('✅ Dashboard UI initialized successfully');
        
        // Force header component to refresh auth state
        console.log('🔄 Forcing header component refresh...');
        
        // DIRECT METHOD: Force header to use our authenticated user
        if (window.headerComponent && currentUser) {
            console.log('🔄 Directly updating header with authenticated user...');
            window.headerComponent.forceAuthUpdate(currentUser);
        }
        
        // Cache user profile for use on all pages
        if (window.HeaderComponent && window.userProfile) {
            console.log('🔄 Caching user profile:', window.userProfile);
            window.HeaderComponent.cacheUserProfile(window.userProfile);
            console.log('✅ User profile cached successfully');
            
            // Verify cache was set
            const cachedProfile = localStorage.getItem('edoc-user-profile');
            console.log('🔍 Cached profile verification:', cachedProfile ? 'Found in localStorage' : 'NOT found in localStorage');
        } else {
            console.warn('⚠️ Could not cache user profile:', {
                HeaderComponent: !!window.HeaderComponent,
                userProfile: !!window.userProfile,
                userProfileData: window.userProfile
            });
        }
        
        // Try immediate refresh
        if (window.headerComponent) {
            console.log('🔄 Header component found, refreshing immediately...');
            await window.headerComponent.refresh();
        }
        
        // Also try with delays to handle any remaining timing issues
        setTimeout(async () => {
            if (window.headerComponent) {
                console.log('🔄 Header component delayed refresh (500ms)...');
                await window.headerComponent.refresh();
            }
        }, 500);
        
        setTimeout(async () => {
            if (window.headerComponent) {
                console.log('🔄 Header component delayed refresh (1000ms)...');
                await window.headerComponent.refresh();
            }
        }, 1000);
        
        console.log('🏁 Dashboard initialization completed');
        
    } catch (error) {
        console.error('❌ Dashboard initialization failed:', error);
        showError('Failed to initialize dashboard. Please try refreshing the page.');
        // DON'T redirect on general errors - just show error
        // redirectToLogin();
    }
});

function redirectToLogin() {
    console.log('🚨 REDIRECT TO LOGIN TRIGGERED');
    console.log('🚨 Current user:', currentUser);
    console.log('🚨 User profile:', userProfile);
    console.log('🚨 User orders:', userOrders);
    console.log('🚨 Window.eDocAuth:', window.eDocAuth);
    
    const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `login.html?return=${returnUrl}`;
}

// Load all dashboard data
async function loadDashboardData() {
    try {
        console.log('🔄 Loading user profile...');
        // Load user profile
        const profileResult = await window.eDocDatabase.getUserProfile(currentUser.id);
        console.log('📋 Profile result:', profileResult);
        if (profileResult.success) {
            userProfile = profileResult.profile;
            console.log('✅ Loaded user profile successfully:', userProfile);
            
            // Cache profile immediately after loading
            window.userProfile = userProfile; // Make globally available
            if (window.HeaderComponent && userProfile) {
                console.log('🔄 Immediate caching of user profile after loading');
                window.HeaderComponent.cacheUserProfile(userProfile);
            }
        }
        
        console.log('🔄 Loading user orders...');
        // Load user orders
        const ordersResult = await window.eDocDatabase.getUserOrders(currentUser.id);
        console.log('📋 Orders result:', ordersResult);
        if (ordersResult.success) {
            userOrders = ordersResult.orders;
            console.log('✅ Loaded user orders:', { count: userOrders.length, orders: userOrders });
        }
        
        console.log('✅ Dashboard data loaded successfully');
        
    } catch (error) {
        console.error('❌ Error loading dashboard data:', error);
        throw error;
    }
}

// Initialize dashboard UI
function initializeDashboard() {
    try {
        console.log('🔄 Initializing dashboard UI...');
        
        // Update quick stats (these elements exist in dashboard.html)
        updateQuickStats();
        
        // Update recent orders section
        updateRecentOrders();
        
        // Populate profile form if it exists
        populateProfileForm();
        
        // Update auth buttons
        updateAuthButtons();
        
        // Set up event listeners
        setupEventListeners();
        
        console.log('✅ Dashboard UI initialized successfully');
        
    } catch (error) {
        console.error('❌ Error initializing dashboard UI:', error);
        showError('Failed to initialize dashboard interface.');
    }
}

// Update quick stats in the dashboard
function updateQuickStats() {
    try {
        const totalOrdersEl = document.getElementById('totalOrders');
        const activeTreatmentsEl = document.getElementById('activeTreatments');
        const totalSpentEl = document.getElementById('totalSpent');
        
        const totalOrders = userOrders.length;
        const activeTreatments = userOrders.filter(order => 
            order.rx_status === 'approved' || order.rx_status === 'processing'
        ).length;
        const totalSpent = userOrders.reduce((sum, order) => 
            sum + parseFloat(order.price || 0), 0
        ).toFixed(2);
        
        if (totalOrdersEl) totalOrdersEl.textContent = totalOrders;
        if (activeTreatmentsEl) activeTreatmentsEl.textContent = activeTreatments;
        if (totalSpentEl) totalSpentEl.textContent = `€${totalSpent}`;
        
        console.log('📊 Quick stats updated:', { totalOrders, activeTreatments, totalSpent, orders: userOrders });
        
    } catch (error) {
        console.error('Error updating quick stats:', error);
    }
}

// Update recent orders section
function updateRecentOrders() {
    try {
        const recentOrdersContainer = document.getElementById('recentOrdersContainer');
        if (!recentOrdersContainer) {
            console.log('Recent orders container not found');
            return;
        }
        
        if (userOrders.length === 0) {
            // Keep the default "no orders" content
            return;
        }
        
        // Show recent orders (last 3)
        const recentOrders = userOrders.slice(-3).reverse();
        
        const ordersHtml = `
            <div class="space-y-4">
                ${recentOrders.map(order => `
                    <div class="border-l-4 border-blue-500 pl-4">
                        <div class="flex justify-between items-start">
                            <div>
                                <h4 class="font-medium text-gray-900">${order.treatment_name || 'Treatment'}</h4>
                                <p class="text-sm text-gray-500">Order #${order.id.slice(0, 8)}</p>
                                <p class="text-xs text-gray-400">${new Date(order.created_at).toLocaleString()}</p>
                            </div>
                            <div class="text-right">
                                <p class="font-medium text-gray-900">€${parseFloat(order.price || 0).toFixed(2)}</p>
                                <p class="text-sm ${getStatusColor(order.rx_status)}">${formatStatus(order.rx_status)}</p>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        recentOrdersContainer.innerHTML = ordersHtml;
        
    } catch (error) {
        console.error('Error updating recent orders:', error);
    }
}

// Populate profile form
function populateProfileForm() {
    try {
        if (!userProfile) {
            console.log('No user profile to populate');
            return;
        }
        
        console.log('Populating profile form with:', userProfile);
        
        // Populate form fields if they exist
        const fields = {
            'firstName': userProfile.first_name,
            'lastName': userProfile.last_name,
            'email': currentUser.email,
            'billingStreet': userProfile.billing_street,
            'billingCity': userProfile.billing_city,
            'billingPostalCode': userProfile.billing_postal_code,
            'billingCountry': userProfile.billing_country
        };
        
        Object.entries(fields).forEach(([fieldId, value]) => {
            const field = document.getElementById(fieldId);
            if (field && value) {
                field.value = value;
            }
        });
        
        console.log('Profile form populated successfully');
        
    } catch (error) {
        console.error('Error populating profile form:', error);
    }
}

// Update profile section
function updateProfileSection() {
    const profileContainer = document.getElementById('profile-container');
    if (!profileContainer) return;
    
    const profileHtml = `
        <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
            
            ${userProfile ? `
                <div class="space-y-3">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700">First Name</label>
                            <p class="mt-1 text-sm text-gray-900">${userProfile.first_name || 'Not provided'}</p>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Last Name</label>
                            <p class="mt-1 text-sm text-gray-900">${userProfile.last_name || 'Not provided'}</p>
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Email</label>
                        <p class="mt-1 text-sm text-gray-900">${currentUser.email}</p>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Language</label>
                        <p class="mt-1 text-sm text-gray-900">${userProfile.language || 'English'}</p>
                    </div>
                    
                    ${userProfile.billing_street ? `
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Billing Address</label>
                            <div class="mt-1 text-sm text-gray-900">
                                <p>${userProfile.billing_street}</p>
                                <p>${userProfile.billing_city} ${userProfile.billing_postal_code}</p>
                                <p>${userProfile.billing_country}</p>
                            </div>
                        </div>
                    ` : ''}
                </div>
                
                <div class="mt-6">
                    <button onclick="editProfile()" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                        Edit Profile
                    </button>
                </div>
            ` : `
                <div class="text-center py-8">
                    <p class="text-gray-500 mb-4">No profile information available</p>
                    <button onclick="createProfile()" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                        Create Profile
                    </button>
                </div>
            `}
        </div>
    `;
    
    profileContainer.innerHTML = profileHtml;
}

// Update orders section
function updateOrdersSection() {
    const ordersContainer = document.getElementById('orders-container');
    if (!ordersContainer) return;
    
    const ordersHtml = `
        <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Your Orders</h3>
            
            ${userOrders.length > 0 ? `
                <div class="space-y-4">
                    ${userOrders.map(order => `
                        <div class="border border-gray-200 rounded-lg p-4">
                            <div class="flex justify-between items-start mb-2">
                                <div>
                                    <h4 class="font-medium text-gray-900">${order.treatment_name}</h4>
                                    <p class="text-sm text-gray-500">Order #${order.id.slice(0, 8)}</p>
                                </div>
                                <div class="text-right">
                                    <p class="font-medium text-gray-900">€${parseFloat(order.price || 0).toFixed(2)}</p>
                                    <p class="text-sm ${getStatusColor(order.rx_status)}">${formatStatus(order.rx_status)}</p>
                                </div>
                            </div>
                            
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                <div>
                                    <span class="font-medium">Payment:</span>
                                    <span class="${order.payment_status === 'completed' ? 'text-green-600' : 'text-yellow-600'}">
                                        ${order.payment_status === 'completed' ? 'Completed' : 'Pending'}
                                    </span>
                                </div>
                                <div>
                                    <span class="font-medium">Prescription:</span>
                                    <span class="${getStatusColor(order.rx_status)}">${formatStatus(order.rx_status)}</span>
                                </div>
                                <div>
                                    <span class="font-medium">Shipping:</span>
                                    <span class="${getStatusColor(order.shipping_status)}">${formatStatus(order.shipping_status)}</span>
                                </div>
                            </div>
                            
                            <div class="mt-3 text-xs text-gray-500">
                                Ordered on ${new Date(order.created_at).toLocaleDateString()}
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : `
                <div class="text-center py-8">
                    <div class="text-gray-400 mb-4">
                        <svg class="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                        </svg>
                    </div>
                    <p class="text-gray-500 mb-4">No orders found</p>
                    <a href="treatments.html" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                        Browse Treatments
                    </a>
                </div>
            `}
        </div>
    `;
    
    ordersContainer.innerHTML = ordersHtml;
}

// Helper functions for order status
function getStatusColor(status) {
    switch (status) {
        case 'completed':
        case 'delivered':
        case 'approved':
            return 'text-green-600';
        case 'pending':
        case 'processing':
        case 'review':
            return 'text-yellow-600';
        case 'shipped':
        case 'ready':
            return 'text-blue-600';
        case 'cancelled':
        case 'rejected':
            return 'text-red-600';
        default:
            return 'text-gray-600';
    }
}

function formatStatus(status) {
    if (!status) return 'Unknown';
    
    return status
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Update auth buttons
function updateAuthButtons() {
    // Hide login button, show logout and user info
    const loginBtn = document.querySelector('[data-auth="login"]');
    const logoutBtn = document.querySelector('[data-auth="logout"]');
    const userInfo = document.querySelector('[data-auth="user-info"]');
    
    if (loginBtn) loginBtn.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'inline-block';
    
    if (userInfo && currentUser) {
        const firstName = userProfile?.first_name || currentUser.email.split('@')[0];
        userInfo.textContent = `Hello, ${firstName}`;
        userInfo.style.display = 'inline-block';
    }
}

// Set up event listeners
function setupEventListeners() {
    // Refresh button
    const refreshBtn = document.getElementById('refresh-dashboard');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshDashboard);
    }
    
    // Logout button
    const logoutBtn = document.querySelector('[data-auth="logout"]');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

// Refresh dashboard data
async function refreshDashboard() {
    try {
        showLoading('Refreshing dashboard...');
        await loadDashboardData();
        initializeDashboard();
        hideLoading();
        showSuccess('Dashboard refreshed successfully');
    } catch (error) {
        console.error('Error refreshing dashboard:', error);
        hideLoading();
        showError('Failed to refresh dashboard');
    }
}

// Handle logout
async function handleLogout() {
    try {
        await window.eDocAuth.signOut();
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Error signing out:', error);
        showError('Failed to sign out');
    }
}

// Edit profile (placeholder)
function editProfile() {
    showInfo('Profile editing feature coming soon!');
}

// Create profile (placeholder)
function createProfile() {
    showInfo('Profile creation feature coming soon!');
}

// Utility functions for notifications
function showError(message) {
    showNotification(message, 'error');
}

function showSuccess(message) {
    showNotification(message, 'success');
}

function showInfo(message) {
    showNotification(message, 'info');
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg max-w-sm ${
        type === 'error' ? 'bg-red-50 border border-red-200 text-red-800' :
        type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' :
        'bg-blue-50 border border-blue-200 text-blue-800'
    }`;
    
    notification.innerHTML = `
        <div class="flex items-center">
            <div class="flex-1">
                <p class="text-sm font-medium">${message}</p>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-3 text-gray-400 hover:text-gray-600">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

function showLoading(message = 'Loading...') {
    const loadingElement = document.getElementById('loading-indicator');
    if (loadingElement) {
        loadingElement.textContent = message;
        loadingElement.style.display = 'block';
    }
}

function hideLoading() {
    const loadingElement = document.getElementById('loading-indicator');
    if (loadingElement) {
        loadingElement.style.display = 'none';
    }
}

// Export functions for global access
window.TRTDashboard = {
    refreshDashboard,
    editProfile,
    createProfile,
    handleLogout
};

// Tab functionality
function showTab(tabName) {
    console.log('🔄 Switching to tab:', tabName);
    
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.classList.add('hidden');
    });
    
    // Remove active state from all tabs
    const tabButtons = document.querySelectorAll('[id$="Tab"]');
    tabButtons.forEach(button => {
        button.classList.remove('border-blue-600', 'text-blue-600');
        button.classList.add('border-transparent', 'text-gray-500');
    });
    
    // Show selected tab content
    const selectedContent = document.getElementById(tabName + 'Content');
    if (selectedContent) {
        selectedContent.classList.remove('hidden');
    }
    
    // Activate selected tab button
    const selectedTab = document.getElementById(tabName + 'Tab');
    if (selectedTab) {
        selectedTab.classList.remove('border-transparent', 'text-gray-500');
        selectedTab.classList.add('border-blue-600', 'text-blue-600');
    }
    
    // Load tab-specific content
    if (tabName === 'orders') {
        updateOrdersList();
    } else if (tabName === 'profile') {
        populateProfileForm();
    }
}

// Update orders list for the Orders tab
function updateOrdersList() {
    try {
        const ordersListContainer = document.getElementById('ordersListContainer');
        if (!ordersListContainer) {
            console.log('Orders list container not found');
            return;
        }
        
        if (userOrders.length === 0) {
            ordersListContainer.innerHTML = `
                <div class="p-6 text-center">
                    <div class="text-gray-400 mb-4">
                        <svg class="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                        </svg>
                    </div>
                    <p class="text-gray-500 mb-4">No orders found</p>
                    <a href="treatments.html" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                        Browse Treatments
                    </a>
                </div>
            `;
            return;
        }
        
        // Show all orders
        const ordersHtml = userOrders.map(order => `
            <div class="p-6 border-b border-gray-200 last:border-b-0">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h4 class="font-medium text-gray-900 text-lg">${order.treatment_name || 'Treatment'}</h4>
                        <p class="text-sm text-gray-500">Order #${order.id.slice(0, 8)}</p>
                        <p class="text-xs text-gray-400">${new Date(order.created_at).toLocaleString()}</p>
                    </div>
                    <div class="text-right">
                        <p class="font-medium text-gray-900 text-lg">€${parseFloat(order.price || 0).toFixed(2)}</p>
                        <p class="text-sm ${getStatusColor(order.rx_status)}">${formatStatus(order.rx_status)}</p>
                    </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div class="bg-gray-50 p-3 rounded">
                        <span class="font-medium text-gray-700">Payment Status:</span>
                        <div class="mt-1">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                order.payment_status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }">
                                ${order.payment_status === 'completed' ? 'Completed' : 'Pending'}
                            </span>
                        </div>
                    </div>
                    <div class="bg-gray-50 p-3 rounded">
                        <span class="font-medium text-gray-700">Prescription:</span>
                        <div class="mt-1">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                order.rx_status === 'approved' ? 'bg-green-100 text-green-800' : 
                                order.rx_status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                            }">
                                ${formatStatus(order.rx_status)}
                            </span>
                        </div>
                    </div>
                    <div class="bg-gray-50 p-3 rounded">
                        <span class="font-medium text-gray-700">Shipping:</span>
                        <div class="mt-1">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                order.shipping_status === 'delivered' ? 'bg-green-100 text-green-800' : 
                                order.shipping_status === 'shipped' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                            }">
                                ${formatStatus(order.shipping_status)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        
        ordersListContainer.innerHTML = ordersHtml;
        
    } catch (error) {
        console.error('Error updating orders list:', error);
    }
}

// Handle profile form submission
function handleProfileUpdate(event) {
    event.preventDefault();
    
    // Get form data
    const formData = new FormData(event.target);
    const profileData = {
        first_name: formData.get('firstName'),
        last_name: formData.get('lastName'),
        billing_street: formData.get('billingStreet'),
        billing_city: formData.get('billingCity'),
        billing_postal_code: formData.get('billingPostalCode'),
        billing_country: formData.get('billingCountry')
    };
    
    console.log('Profile update requested:', profileData);
    showInfo('Profile update functionality coming soon!');
}

// Make functions globally available
window.showTab = showTab;
window.handleProfileUpdate = handleProfileUpdate; 