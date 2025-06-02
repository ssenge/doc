/**
 * eDoc Platform Configuration
 * Generic health platform - currently configured for TRT Clinic
 */

// eDoc Configuration (internal)
const EDOC_CONFIG = {
    supabase: {
        url: 'https://clsknohsqcqiymjgrrxc.supabase.co',
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsc2tub2hzcWNxaXltamdycnhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4NjE1NjAsImV4cCI6MjA2NDQzNzU2MH0.QLPc_v5Au5LwpZECH5-u-7zyfzz-qIltvwFOGD22zwE'
    },
    
    // Application settings
    app: {
        name: 'eDoc',                    // Internal name
        displayName: 'TRT Clinic',      // User-facing name
        version: '1.0.0',
        environment: 'development',      // 'development' or 'production'
        debug: true
    },
    
    // Feature flags
    features: {
        enableRegistration: true,
        enableGuestCheckout: true,
        enableRealTimeUpdates: true,
        enableEmailNotifications: false, // Future feature
        enableZapierIntegration: false   // Disabled for now
    },
    
    // UI Configuration
    ui: {
        defaultLanguage: 'en',
        supportedLanguages: ['en', 'de', 'es', 'fr'],
        dateFormat: 'de-DE',
        currency: 'EUR',
        theme: 'light'
    },
    
    // Order status configurations
    orderStatus: {
        rx: {
            pending: { label: '⏳ Awaiting doctor review', color: 'yellow' },
            approved: { label: '✅ Prescription approved', color: 'green' },
            rejected: { label: '❌ Prescription rejected', color: 'red' }
        },
        shipping: {
            not_ready: { label: '⏸️ Waiting for prescription approval', color: 'gray' },
            ready: { label: '📋 Ready for shipping', color: 'blue' },
            shipped: { label: '📦 Shipped', color: 'purple' },
            delivered: { label: '✅ Delivered', color: 'green' }
        }
    },
    
    // Validation rules
    validation: {
        password: {
            minLength: 8,
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSpecialChars: false
        },
        email: {
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        }
    }
};

// Export configuration globally (new naming)
window.EDOC_CONFIG = EDOC_CONFIG;

// Backward compatibility - keep old naming working
window.TRT_CONFIG = EDOC_CONFIG;

// Helper function to check if we're in development mode
window.isDevelopment = () => EDOC_CONFIG.app.environment === 'development';

// Helper function for debug logging (updated prefix)
window.debugLog = (...args) => {
    if (EDOC_CONFIG.app.debug && isDevelopment()) {
        console.log('[eDoc Debug]', ...args);
    }
};

// Validate configuration on load
document.addEventListener('DOMContentLoaded', () => {
    if (EDOC_CONFIG.supabase.anonKey === 'YOUR_SUPABASE_ANON_KEY_HERE') {
        console.warn('⚠️ Please update your Supabase anon key in assets/js/config.js');
    } else {
        console.log(`✅ ${EDOC_CONFIG.app.displayName} (${EDOC_CONFIG.app.name}) configuration loaded`);
    }
}); 