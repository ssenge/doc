/**
 * eDoc Supabase Client Configuration
 * Handles database connection and authentication for eDoc platform
 */

// Global Supabase client instance
let supabase;

// Initialize Supabase client
async function initSupabase() {
    try {
        // Wait for config to be loaded
        if (!window.EDOC_CONFIG) {
            console.error('❌ EDOC_CONFIG not found. Make sure config.js is loaded first.');
            return;
        }

        const config = window.EDOC_CONFIG.supabase;
        
        // Check if anon key is configured
        if (config.anonKey === 'YOUR_SUPABASE_ANON_KEY_HERE') {
            console.error('❌ Please configure your Supabase anon key in config.js');
            return;
        }

        // Load Supabase from CDN if not already loaded
        if (!window.supabase) {
            await loadSupabaseFromCDN();
        }

        // Initialize client
        supabase = window.supabase.createClient(config.url, config.anonKey);
        window.eDocSupabase = supabase;
        
        // Backward compatibility
        window.TRTSupabase = supabase;
        
        console.log('✅ eDoc Supabase client initialized');
        
        // Set up auth state listener
        setupAuthStateListener();
        
        return supabase;
    } catch (error) {
        console.error('❌ Failed to initialize Supabase:', error);
    }
}

// Load Supabase library from CDN
function loadSupabaseFromCDN() {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Set up authentication state listener
function setupAuthStateListener() {
    supabase.auth.onAuthStateChange((event, session) => {
        window.debugLog('Auth state changed:', event, session?.user?.email);
        
        // Update UI based on auth state
        updateAuthUI(session);
        
        // Trigger custom event for other components to listen to
        window.dispatchEvent(new CustomEvent('authStateChanged', {
            detail: { event, session }
        }));
    });
}

// Update UI elements based on authentication state
function updateAuthUI(session) {
    const isAuthenticated = !!session;
    
    // Update login/logout buttons
    const loginButtons = document.querySelectorAll('[data-auth="login"]');
    const logoutButtons = document.querySelectorAll('[data-auth="logout"]');
    const dashboardLinks = document.querySelectorAll('[data-auth="dashboard"]');
    const userInfo = document.querySelectorAll('[data-auth="user-info"]');
    
    loginButtons.forEach(btn => {
        btn.style.display = isAuthenticated ? 'none' : 'block';
    });
    
    logoutButtons.forEach(btn => {
        btn.style.display = isAuthenticated ? 'block' : 'none';
    });
    
    dashboardLinks.forEach(link => {
        link.style.display = isAuthenticated ? 'block' : 'none';
    });
    
    userInfo.forEach(info => {
        if (isAuthenticated) {
            info.textContent = session.user.email;
            info.style.display = 'block';
        } else {
            info.style.display = 'none';
        }
    });
}

// Authentication helper functions
const eDocAuth = {
    // Get current user
    async getCurrentUser() {
        try {
            if (!supabase) {
                console.warn('Supabase client not initialized yet');
                return null;
            }
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error) throw error;
            return user;
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    },

    // Sign up new user
    async signUp(email, password, metadata = {}, options = {}) {
        try {
            // Add default redirect URL if not provided
            const defaultOptions = {
                emailRedirectTo: `${window.location.origin}/auth-confirm.html`,
                ...options
            };
            
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: metadata,
                    ...defaultOptions
                }
            });
            
            if (error) {
                console.error('Sign up error:', error);
                return { success: false, error: error.message, user: null };
            }
            
            console.log('Sign up successful:', data);
            return { success: true, error: null, user: data.user };
        } catch (error) {
            console.error('Sign up exception:', error);
            return { success: false, error: error.message, user: null };
        }
    },

    // Sign in user
    async signIn(email, password) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            
            if (error) throw error;
            
            window.debugLog('User signed in successfully');
            return { success: true, user: data.user, session: data.session };
        } catch (error) {
            console.error('❌ Sign in error:', error);
            return { success: false, error: error.message };
        }
    },

    // Sign out user
    async signOut() {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            
            window.debugLog('User signed out successfully');
            return { success: true };
        } catch (error) {
            console.error('❌ Sign out error:', error);
            return { success: false, error: error.message };
        }
    },

    // Check if user is authenticated
    async isAuthenticated() {
        const user = await this.getCurrentUser();
        return !!user;
    },

    // Reset password
    async resetPassword(email) {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email);
            if (error) throw error;
            
            return { success: true };
        } catch (error) {
            console.error('❌ Password reset error:', error);
            return { success: false, error: error.message };
        }
    }
};

// Database helper functions
const eDocDatabase = {
    // Create user profile
    async createUserProfile(userId, profileData) {
        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .insert([{
                    id: userId,
                    ...profileData
                }])
                .select()
                .single();
            
            if (error) throw error;
            
            window.debugLog('User profile created');
            return { success: true, profile: data };
        } catch (error) {
            console.error('❌ Error creating user profile:', error);
            return { success: false, error: error.message };
        }
    },

    // Update user profile
    async updateUserProfile(userId, profileData) {
        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .update(profileData)
                .eq('id', userId)
                .select()
                .single();
            
            if (error) throw error;
            
            window.debugLog('User profile updated');
            return { success: true, profile: data };
        } catch (error) {
            console.error('❌ Error updating user profile:', error);
            return { success: false, error: error.message };
        }
    },

    // Get user profile
    async getUserProfile(userId) {
        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', userId)
                .single();
            
            if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
            
            return { success: true, profile: data };
        } catch (error) {
            console.error('❌ Error getting user profile:', error);
            return { success: false, error: error.message };
        }
    },

    // Create order
    async createOrder(orderData) {
        try {
            const { data, error } = await supabase
                .from('orders')
                .insert([orderData])
                .select()
                .single();
            
            if (error) throw error;
            
            window.debugLog('Order created successfully');
            return { success: true, order: data };
        } catch (error) {
            console.error('❌ Error creating order:', error);
            return { success: false, error: error.message };
        }
    },

    // Update order
    async updateOrder(orderId, orderData) {
        try {
            const { data, error } = await supabase
                .from('orders')
                .update(orderData)
                .eq('id', orderId)
                .select()
                .single();
            
            if (error) throw error;
            
            window.debugLog('Order updated successfully');
            return { success: true, order: data };
        } catch (error) {
            console.error('❌ Error updating order:', error);
            return { success: false, error: error.message };
        }
    },

    // Get user orders
    async getUserOrders(userId) {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            
            return { success: true, orders: data };
        } catch (error) {
            console.error('❌ Error getting user orders:', error);
            return { success: false, error: error.message };
        }
    },

    // Get all orders (for testing/admin)
    async getOrders(limit = 50) {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(limit);
            
            if (error) throw error;
            
            return { success: true, orders: data };
        } catch (error) {
            console.error('❌ Error getting orders:', error);
            return { success: false, error: error.message };
        }
    },

    // Get order by ID
    async getOrder(orderId) {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('id', orderId)
                .single();
            
            if (error) throw error;
            
            return { success: true, order: data };
        } catch (error) {
            console.error('❌ Error getting order:', error);
            return { success: false, error: error.message };
        }
    },

    // Subscribe to order changes for real-time updates
    subscribeToOrderChanges(userId, callback) {
        return supabase
            .channel('order-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'orders',
                    filter: `user_id=eq.${userId}`
                },
                callback
            )
            .subscribe();
    }
};

// Utility functions
const eDocUtils = {
    // Format order status for display
    formatOrderStatus(order) {
        const config = window.EDOC_CONFIG.orderStatus;
        
        return {
            prescription: config.rx[order.rx_status] || { label: order.rx_status, color: 'gray' },
            shipping: config.shipping[order.shipping_status] || { label: order.shipping_status, color: 'gray' }
        };
    },

    // Format price for display
    formatPrice(price, currency = null) {
        const curr = currency || window.EDOC_CONFIG.ui.currency;
        const locale = window.EDOC_CONFIG.ui.dateFormat;
        
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: curr
        }).format(price);
    },

    // Format date for display
    formatDate(dateString) {
        const locale = window.EDOC_CONFIG.ui.dateFormat;
        
        return new Date(dateString).toLocaleDateString(locale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    // Validate email
    validateEmail(email) {
        // Fallback pattern if config isn't loaded
        const fallbackPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        try {
            return window.EDOC_CONFIG?.validation?.email?.pattern?.test(email) || fallbackPattern.test(email);
        } catch (error) {
            console.warn('Email validation config error, using fallback:', error);
            return fallbackPattern.test(email);
        }
    },

    // Validate password
    validatePassword(password) {
        const rules = window.EDOC_CONFIG.validation.password;
        const errors = [];

        if (password.length < rules.minLength) {
            errors.push(`Password must be at least ${rules.minLength} characters long`);
        }

        if (rules.requireUppercase && !/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }

        if (rules.requireLowercase && !/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }

        if (rules.requireNumbers && !/\d/.test(password)) {
            errors.push('Password must contain at least one number');
        }

        if (rules.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errors.push('Password must contain at least one special character');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
};

// Initialize when DOM is ready and config is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait for config to be available
    const waitForConfig = () => {
        if (window.EDOC_CONFIG) {
            initSupabase();
        } else {
            console.log('Waiting for EDOC_CONFIG...');
            setTimeout(waitForConfig, 50);
        }
    };
    waitForConfig();
});

// Export for global access (new naming)
window.eDocAuth = eDocAuth;
window.eDocDatabase = eDocDatabase;
window.eDocUtils = eDocUtils;

// Backward compatibility - keep old naming working
window.TRTAuth = eDocAuth;
window.TRTDatabase = eDocDatabase;
window.TRTUtils = eDocUtils; 