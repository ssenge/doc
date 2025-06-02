// Dashboard functionality for TRT Clinic
// This file handles user dashboard operations, order management, and profile updates

// Global variables
let currentUser = null;
let userProfile = null;
let userOrders = [];
let realTimeSubscription = null;

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Dashboard initializing...');
    
    try {
        // Wait for Supabase to be available
        await waitForSupabase();
        
        // Check authentication
        const { data: { user }, error } = await window.eDocAuth.getUser();
        
        if (error || !user) {
            console.log('User not authenticated, redirecting to login');
            window.location.href = 'login.html?return=' + encodeURIComponent(window.location.pathname);
            return;
        }
        
        currentUser = user;
        console.log('User authenticated:', currentUser.email);
        
        // Update UI with user info
        document.getElementById('userEmail').textContent = currentUser.email;
        
        // Load user data
        await loadUserProfile();
        await loadUserOrders();
        
        // Update dashboard
        updateQuickStats();
        displayOrders();
        displayTreatmentTimeline();
        populateProfileForm();
        
        // Setup real-time updates
        setupRealTimeUpdates();
        
        // Setup language dropdown
        setupLanguageDropdown();
        
        // Apply current language
        if (window.switchLanguage) {
            const currentLang = localStorage.getItem('selectedLanguage') || 'en';
            window.switchLanguage(currentLang);
        }
        
        // Hide loading and show dashboard
        document.getElementById('loadingState').classList.add('hidden');
        document.getElementById('dashboardContent').classList.remove('hidden');
        
    } catch (error) {
        console.error('Dashboard initialization error:', error);
        showError('Failed to load dashboard. Please try refreshing the page.');
    }
});

// Load user profile from database
async function loadUserProfile() {
    try {
        const result = await window.eDocDatabase.getUserProfile(currentUser.id);
        if (result.success) {
            userProfile = result.profile;
            console.log('User profile loaded:', userProfile);
        } else {
            console.log('No profile found, will create one on first update');
            userProfile = {
                user_id: currentUser.id,
                email: currentUser.email,
                first_name: '',
                last_name: '',
                date_of_birth: null,
                billing_street: '',
                billing_city: '',
                billing_postal_code: '',
                billing_country: 'DE',
                preferred_language: 'en'
            };
        }
    } catch (error) {
        console.error('Error loading user profile:', error);
        showError('Failed to load profile information.');
    }
}

// Load user orders from database
async function loadUserOrders() {
    try {
        const result = await window.eDocDatabase.getUserOrders(currentUser.id);
        if (result.success) {
            userOrders = result.orders;
            console.log('User orders loaded:', userOrders.length, 'orders');
        } else {
            console.error('Failed to load orders:', result.error);
            userOrders = [];
        }
    } catch (error) {
        console.error('Error loading user orders:', error);
        userOrders = [];
    }
}

// Update quick stats in dashboard
function updateQuickStats() {
    const totalOrders = userOrders.length;
    const activeTreatments = userOrders.filter(order => 
        ['pending', 'approved', 'shipped'].includes(order.status)
    ).length;
    const totalSpent = userOrders.reduce((sum, order) => sum + (order.payment_amount || 0), 0);
    
    document.getElementById('totalOrders').textContent = totalOrders;
    document.getElementById('activeTreatments').textContent = activeTreatments;
    document.getElementById('totalSpent').textContent = window.eDocUtils.formatPrice(totalSpent);
}

// Display orders in the orders tab
function displayOrders() {
    const container = document.getElementById('ordersContainer');
    
    if (userOrders.length === 0) {
        container.innerHTML = `
            <div class="p-6 text-center">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <h3 class="mt-2 text-sm font-medium text-gray-900" data-en="No orders yet" data-de="Noch keine Bestellungen">No orders yet</h3>
                <p class="mt-1 text-sm text-gray-500" data-en="Start your treatment journey by placing your first order." data-de="Beginnen Sie Ihre Behandlung mit Ihrer ersten Bestellung.">Start your treatment journey by placing your first order.</p>
                <div class="mt-6">
                    <a href="treatments.html" class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        <span data-en="Browse Treatments" data-de="Behandlungen ansehen">Browse Treatments</span>
                    </a>
                </div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = userOrders.map(order => `
        <div class="p-6">
            <div class="flex items-center justify-between">
                <div class="flex-1">
                    <div class="flex items-center justify-between">
                        <h4 class="text-lg font-medium text-gray-900">${order.treatment_name || 'Treatment'}</h4>
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(order.status)}">
                            ${getStatusText(order.status)}
                        </span>
                    </div>
                    <div class="mt-2 flex items-center text-sm text-gray-500 space-x-4">
                        <span>Order #${order.id.slice(0, 8)}</span>
                        <span>${window.eDocUtils.formatDate(order.created_at)}</span>
                        <span class="font-medium text-gray-900">${window.eDocUtils.formatPrice(order.payment_amount)}</span>
                    </div>
                    ${order.notes ? `<p class="mt-2 text-sm text-gray-600">${order.notes}</p>` : ''}
                </div>
                <div class="ml-4">
                    <button onclick="viewOrderDetails('${order.id}')" class="text-blue-600 hover:text-blue-500 text-sm font-medium">
                        <span data-en="View Details" data-de="Details anzeigen">View Details</span>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Get status badge CSS class
function getStatusBadgeClass(status) {
    const statusClasses = {
        'pending': 'bg-yellow-100 text-yellow-800',
        'approved': 'bg-green-100 text-green-800',
        'shipped': 'bg-blue-100 text-blue-800',
        'delivered': 'bg-purple-100 text-purple-800',
        'cancelled': 'bg-red-100 text-red-800'
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
}

// Get status text
function getStatusText(status) {
    const statusTexts = {
        'pending': 'Pending',
        'approved': 'Approved',
        'shipped': 'Shipped',
        'delivered': 'Delivered',
        'cancelled': 'Cancelled'
    };
    return statusTexts[status] || status;
}

// Populate profile form with user data
function populateProfileForm() {
    if (!userProfile) return;
    
    document.getElementById('firstName').value = userProfile.first_name || '';
    document.getElementById('lastName').value = userProfile.last_name || '';
    document.getElementById('email').value = userProfile.email || currentUser.email;
    document.getElementById('dateOfBirth').value = userProfile.date_of_birth || '';
    document.getElementById('billingStreet').value = userProfile.billing_street || '';
    document.getElementById('billingCity').value = userProfile.billing_city || '';
    document.getElementById('billingPostalCode').value = userProfile.billing_postal_code || '';
    document.getElementById('billingCountry').value = userProfile.billing_country || 'DE';
    document.getElementById('preferredLanguage').value = userProfile.preferred_language || 'en';
}

// Display treatment timeline
function displayTreatmentTimeline() {
    const container = document.getElementById('treatmentTimelineContainer');
    if (!container) return;
    
    if (userOrders.length === 0) {
        container.innerHTML = `
            <div class="text-center py-6">
                <p class="text-gray-500" data-en="No treatment history available." data-de="Keine Behandlungshistorie verfügbar.">No treatment history available.</p>
            </div>
        `;
        return;
    }
    
    // Create timeline events from orders
    const timelineEvents = [];
    userOrders.forEach(order => {
        timelineEvents.push({
            id: `order-${order.id}`,
            title: `Order Placed: ${order.treatment_name}`,
            description: `Order #${order.id.slice(0, 8)} - ${window.eDocUtils.formatPrice(order.payment_amount)}`,
            date: order.created_at,
            type: 'order'
        });
        
        if (order.status === 'approved' || order.status === 'shipped' || order.status === 'delivered') {
            timelineEvents.push({
                id: `approval-${order.id}`,
                title: 'Order Approved',
                description: 'Your order has been reviewed and approved by our medical team.',
                date: order.updated_at,
                type: 'approval'
            });
        }
        
        if (order.status === 'shipped' || order.status === 'delivered') {
            timelineEvents.push({
                id: `shipping-${order.id}`,
                title: 'Order Shipped',
                description: 'Your treatment has been shipped and is on its way.',
                date: order.updated_at,
                type: 'shipping'
            });
        }
    });
    
    // Sort events by date (newest first)
    timelineEvents.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    container.innerHTML = `
        <div class="flow-root">
            <ul class="-mb-8">
                ${timelineEvents.map((event, index) => `
                    <li>
                        <div class="relative pb-8">
                            ${index < timelineEvents.length - 1 ? '<span class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>' : ''}
                            <div class="relative flex space-x-3">
                                <div>
                                    <span class="h-8 w-8 rounded-full ${getTimelineIconColor(event.type)} flex items-center justify-center ring-8 ring-white">
                                        ${getTimelineIcon(event.type)}
                                    </span>
                                </div>
                                <div class="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                    <div>
                                        <p class="text-sm text-gray-900 font-medium">${event.title}</p>
                                        <p class="text-sm text-gray-500">${event.description}</p>
                                    </div>
                                    <div class="text-right text-sm whitespace-nowrap text-gray-500">
                                        ${window.eDocUtils.formatDate(event.date)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </li>
                `).join('')}
            </ul>
        </div>
    `;
}

function setupRealTimeUpdates() {
    if (window.EDOC_CONFIG.features.enableRealTimeUpdates) {
        realTimeSubscription = window.eDocDatabase.subscribeToOrderChanges(currentUser.id, (payload) => {
            console.log('Real-time order update:', payload);
            // Reload orders and update display
            loadUserOrders().then(() => {
                updateQuickStats();
                displayOrders();
                displayTreatmentTimeline();
            });
        });
    }
}

// Tab switching
function showTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
    });
    
    // Reset all tab buttons
    document.querySelectorAll('[id$="Tab"]').forEach(tab => {
        tab.className = 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 py-2 px-1 text-sm font-medium';
    });
    
    // Show selected tab content
    document.getElementById(tabName + 'Content').classList.remove('hidden');
    
    // Highlight selected tab
    document.getElementById(tabName + 'Tab').className = 'border-transparent text-blue-600 border-b-2 border-blue-600 py-2 px-1 text-sm font-medium';
}

// Profile update handler
async function handleProfileUpdate(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const profileData = {
        first_name: formData.get('firstName'),
        last_name: formData.get('lastName'),
        date_of_birth: formData.get('dateOfBirth') || null,
        billing_street: formData.get('billingStreet'),
        billing_city: formData.get('billingCity'),
        billing_postal_code: formData.get('billingPostalCode'),
        billing_country: formData.get('billingCountry'),
        preferred_language: formData.get('preferredLanguage'),
        updated_at: new Date().toISOString()
    };
    
    try {
        const result = await window.eDocDatabase.updateUserProfile(currentUser.id, profileData);
        if (result.success) {
            userProfile = result.profile;
            showSuccess('Profile updated successfully!');
        } else {
            showError('Failed to update profile: ' + result.error);
        }
    } catch (error) {
        console.error('Profile update error:', error);
        showError('An unexpected error occurred while updating your profile.');
    }
}

// Logout handler
async function handleLogout() {
    try {
        // Unsubscribe from real-time updates
        if (realTimeSubscription) {
            realTimeSubscription.unsubscribe();
        }
        
        await window.eDocAuth.signOut();
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// Utility functions
function getStatusColor(color) {
    const colorMap = {
        'yellow': 'text-yellow-600',
        'green': 'text-green-600',
        'red': 'text-red-600',
        'gray': 'text-gray-600',
        'blue': 'text-blue-600',
        'purple': 'text-purple-600'
    };
    return colorMap[color] || 'text-gray-600';
}

function getTimelineIconColor(type) {
    const colorMap = {
        'order': 'bg-blue-500',
        'approval': 'bg-green-500',
        'shipping': 'bg-purple-500'
    };
    return colorMap[type] || 'bg-gray-500';
}

function getTimelineIcon(type) {
    const iconMap = {
        'order': '<svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>',
        'approval': '<svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>',
        'shipping': '<svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"></path><path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1V8a1 1 0 00-.293-.707L15 4.586A1 1 0 0014.414 4H14v3z"></path></svg>'
    };
    return iconMap[type] || '<svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>';
}

function viewOrderDetails(orderId) {
    // For now, just show an alert. In a full implementation, this would open a modal or navigate to a details page
    const order = userOrders.find(o => o.id === orderId);
    if (order) {
        alert(`Order Details:\n\nOrder ID: ${order.id}\nTreatment: ${order.treatment_name}\nAmount: ${window.eDocUtils.formatPrice(order.payment_amount)}\nDate: ${window.eDocUtils.formatDate(order.created_at)}`);
    }
}

function setupLanguageDropdown() {
    const dropdownButton = document.getElementById('languageDropdown');
    const dropdownMenu = document.getElementById('languageMenu');
    
    if (dropdownButton && dropdownMenu) {
        dropdownButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            dropdownMenu.classList.toggle('hidden');
        });
        
        document.addEventListener('click', function(e) {
            if (!dropdownButton.contains(e.target) && !dropdownMenu.contains(e.target)) {
                dropdownMenu.classList.add('hidden');
            }
        });
        
        dropdownMenu.addEventListener('click', function() {
            dropdownMenu.classList.add('hidden');
        });
    }
}

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

function showSuccess(message) {
    // Simple success notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function showError(message) {
    // Simple error notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Make functions globally available
window.showTab = showTab;
window.handleProfileUpdate = handleProfileUpdate;
window.handleLogout = handleLogout;
window.viewOrderDetails = viewOrderDetails; 