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
        // Wait for Supabase to initialize
        await waitForSupabase();
        
        // Check authentication
        currentUser = await window.eDocAuth.getCurrentUser();
        
        if (!currentUser) {
            // Redirect to login if not authenticated
            const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
            window.location.href = `login.html?return=${returnUrl}`;
            return;
        }
        
        // Load dashboard data
        await loadDashboardData();
        
        // Initialize dashboard UI
        initializeDashboard();
        
    } catch (error) {
        console.error('Error initializing dashboard:', error);
        showError('Failed to load dashboard. Please refresh the page.');
    }
});

// Wait for Supabase to be available
function waitForSupabase() {
    return new Promise((resolve) => {
        const checkSupabase = () => {
            if (window.eDocAuth && window.eDocDatabase) {
                resolve();
            } else {
                setTimeout(checkSupabase, 100);
            }
        };
        checkSupabase();
    });
}

// Load all dashboard data
async function loadDashboardData() {
    try {
        // Load user profile
        const profileResult = await window.eDocDatabase.getUserProfile(currentUser.id);
        if (profileResult.success) {
            userProfile = profileResult.profile;
        }
        
        // Load user orders
        const ordersResult = await window.eDocDatabase.getUserOrders(currentUser.id);
        if (ordersResult.success) {
            userOrders = ordersResult.orders;
        }
        
        console.log('Dashboard data loaded:', { userProfile, userOrders });
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        throw error;
    }
}

// Initialize dashboard UI
function initializeDashboard() {
    try {
        // Update welcome message
        updateWelcomeMessage();
        
        // Update profile section
        updateProfileSection();
        
        // Update orders section
        updateOrdersSection();
        
        // Update auth buttons
        updateAuthButtons();
        
        // Set up event listeners
        setupEventListeners();
        
    } catch (error) {
        console.error('Error initializing dashboard UI:', error);
        showError('Failed to initialize dashboard interface.');
    }
}

// Update welcome message
function updateWelcomeMessage() {
    const welcomeElement = document.getElementById('welcome-message');
    if (welcomeElement && userProfile) {
        const firstName = userProfile.first_name || 'User';
        welcomeElement.textContent = `Welcome, ${firstName}`;
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