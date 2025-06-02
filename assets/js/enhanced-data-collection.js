/**
 * Enhanced eDoc Data Collection with Supabase Integration
 * Bridges existing localStorage system with new user account system
 */

// Enhanced data collection that works with both localStorage and Supabase
const eDocDataCollectionEnhanced = {
    
    // Save assessment data (enhanced version)
    async saveAssessmentData(formData) {
        try {
            // Save to localStorage (existing functionality)
            const assessmentData = window.eDocDataCollection.saveAssessmentData(formData);
            
            // If user is authenticated, also save to Supabase
            const user = await window.eDocAuth.getCurrentUser();
            if (user) {
                await this.syncAssessmentToDatabase(user.id, assessmentData);
            }
            
            return assessmentData;
        } catch (error) {
            console.error('Error saving assessment data:', error);
            // Fallback to localStorage only
            return window.eDocDataCollection.saveAssessmentData(formData);
        }
    },

    // Save treatment data (enhanced version)
    async saveTreatmentData(treatmentId, treatmentDetails) {
        try {
            // Save to localStorage (existing functionality)
            const treatmentData = window.eDocDataCollection.saveTreatmentData(treatmentId, treatmentDetails);
            
            // If user is authenticated, also save to Supabase
            const user = await window.eDocAuth.getCurrentUser();
            if (user) {
                await this.syncTreatmentToDatabase(user.id, treatmentData);
            }
            
            return treatmentData;
        } catch (error) {
            console.error('Error saving treatment data:', error);
            // Fallback to localStorage only
            return window.eDocDataCollection.saveTreatmentData(treatmentId, treatmentDetails);
        }
    },

    // Save consultation data (enhanced version)
    async saveConsultationData(consultationType, price) {
        try {
            // Save to localStorage (existing functionality)
            const consultationData = window.eDocDataCollection.saveConsultationData(consultationType, price);
            
            // If user is authenticated, also save to Supabase
            const user = await window.eDocAuth.getCurrentUser();
            if (user) {
                await this.syncConsultationToDatabase(user.id, consultationData);
            }
            
            return consultationData;
        } catch (error) {
            console.error('Error saving consultation data:', error);
            // Fallback to localStorage only
            return window.eDocDataCollection.saveConsultationData(consultationType, price);
        }
    },

    // Create user account during checkout process
    async createAccountDuringCheckout(email, password, personalData = {}) {
        try {
            window.debugLog('Creating account during checkout for:', email);
            
            // 1. Sign up the user
            const signUpResult = await window.eDocAuth.signUp(email, password, {
                full_name: personalData.fullName || '',
                preferred_language: window.eDocLanguage?.getCurrentLanguage() || 'en'
            });
            
            if (!signUpResult.success) {
                throw new Error(signUpResult.error);
            }
            
            const user = signUpResult.user;
            
            // 2. Create user profile
            const profileData = {
                email: email,
                first_name: personalData.firstName || '',
                last_name: personalData.lastName || '',
                date_of_birth: personalData.dateOfBirth || null,
                preferred_language: window.eDocLanguage?.getCurrentLanguage() || 'en',
                billing_street: personalData.street || '',
                billing_city: personalData.city || '',
                billing_postal_code: personalData.postalCode || '',
                billing_country: personalData.country || 'DE',
                created_at: new Date().toISOString()
            };
            
            const profileResult = await window.eDocDatabase.createUserProfile(user.id, profileData);
            
            if (!profileResult.success) {
                console.warn('Failed to create user profile, but account was created');
            }
            
            // 3. Sync existing localStorage data to database
            await this.syncAllDataToDatabase(user.id);
            
            window.debugLog('Account created successfully during checkout');
            return { success: true, user, profile: profileResult.profile };
            
        } catch (error) {
            console.error('Error creating account during checkout:', error);
            return { success: false, error: error.message };
        }
    },

    // Create order in database after successful payment
    async createOrderAfterPayment(paymentData, userEmail = null) {
        try {
            let user = await window.eDocAuth.getCurrentUser();
            
            // If no authenticated user but we have an email, try to find/create account
            if (!user && userEmail) {
                // For now, we'll create a guest order and link it later
                // In a full implementation, you might want to create an account here
                window.debugLog('Creating guest order for:', userEmail);
            }
            
            // Get all collected data
            const collectedData = window.eDocDataCollection.getAllCollectedData();
            
            // Prepare order data
            const orderData = {
                user_id: user?.id || null,
                guest_email: user ? null : userEmail,
                
                // Assessment data
                assessment_age: collectedData.assessment.age,
                assessment_height: collectedData.assessment.height,
                assessment_weight: collectedData.assessment.weight,
                assessment_symptoms: collectedData.assessment.symptoms || {},
                assessment_medical_history: collectedData.assessment.medicalHistory || {},
                assessment_lifestyle: collectedData.assessment.lifestyle || {},
                
                // Treatment data
                treatment_type: collectedData.treatment.treatmentId || paymentData.treatment,
                treatment_name: collectedData.treatment.treatmentName || paymentData.product,
                treatment_price: parseFloat(paymentData.amount) || collectedData.treatment.price,
                treatment_currency: 'EUR',
                treatment_interval: collectedData.treatment.interval,
                
                // Consultation data
                consultation_type: collectedData.consultation.type || 'none',
                consultation_price: collectedData.consultation.price || 0,
                
                // Payment data
                stripe_session_id: paymentData.sessionId,
                payment_amount: parseFloat(paymentData.amount),
                payment_currency: 'EUR',
                payment_status: paymentData.status || 'completed',
                payment_method: paymentData.paymentMethod,
                
                // Status
                rx_status: 'pending',
                shipping_status: 'not_ready',
                
                // Metadata
                session_id: collectedData.session.sessionId,
                user_agent: navigator.userAgent,
                referrer: document.referrer,
                browser_language: navigator.language,
                site_language: window.eDocLanguage?.getCurrentLanguage() || 'en',
                
                created_at: new Date().toISOString()
            };
            
            // Create order in database
            const orderResult = await window.eDocDatabase.createOrder(orderData);
            
            if (orderResult.success) {
                window.debugLog('Order created in database:', orderResult.order);
                
                // Store order ID for reference
                localStorage.setItem('edoc-order-id', orderResult.order.id);
                
                return orderResult;
            } else {
                throw new Error(orderResult.error);
            }
            
        } catch (error) {
            console.error('Error creating order after payment:', error);
            return { success: false, error: error.message };
        }
    },

    // Sync assessment data to database
    async syncAssessmentToDatabase(userId, assessmentData) {
        try {
            // This could be stored in a separate assessments table or as part of user profile
            // For now, we'll update the user profile with latest assessment
            const updateData = {
                last_assessment_data: assessmentData,
                last_assessment_at: new Date().toISOString()
            };
            
            return await window.eDocDatabase.updateUserProfile(userId, updateData);
        } catch (error) {
            console.error('Error syncing assessment to database:', error);
            return { success: false, error: error.message };
        }
    },

    // Sync treatment data to database
    async syncTreatmentToDatabase(userId, treatmentData) {
        try {
            const updateData = {
                last_treatment_selection: treatmentData,
                last_treatment_selected_at: new Date().toISOString()
            };
            
            return await window.eDocDatabase.updateUserProfile(userId, updateData);
        } catch (error) {
            console.error('Error syncing treatment to database:', error);
            return { success: false, error: error.message };
        }
    },

    // Sync consultation data to database
    async syncConsultationToDatabase(userId, consultationData) {
        try {
            const updateData = {
                last_consultation_selection: consultationData,
                last_consultation_selected_at: new Date().toISOString()
            };
            
            return await window.eDocDatabase.updateUserProfile(userId, updateData);
        } catch (error) {
            console.error('Error syncing consultation to database:', error);
            return { success: false, error: error.message };
        }
    },

    // Sync all localStorage data to database
    async syncAllDataToDatabase(userId) {
        try {
            const collectedData = window.eDocDataCollection.getAllCollectedData();
            
            const updateData = {
                last_assessment_data: collectedData.assessment,
                last_treatment_selection: collectedData.treatment,
                last_consultation_selection: collectedData.consultation,
                last_sync_at: new Date().toISOString()
            };
            
            return await window.eDocDatabase.updateUserProfile(userId, updateData);
        } catch (error) {
            console.error('Error syncing all data to database:', error);
            return { success: false, error: error.message };
        }
    },

    // Enhanced send to Zapier that also creates database records
    async sendToZapierAndDatabase(additionalData = {}) {
        try {
            // First, try to create order in database
            const paymentData = window.eDocDataCollection.getPaymentDataFromURL();
            const orderResult = await this.createOrderAfterPayment(paymentData, paymentData.email);
            
            // Then send to Zapier (existing functionality)
            const zapierResult = await window.eDocDataCollection.sendToZapier({
                ...additionalData,
                database_order_id: orderResult.success ? orderResult.order.id : null,
                database_sync_status: orderResult.success ? 'success' : 'failed'
            });
            
            return {
                database: orderResult,
                zapier: zapierResult
            };
            
        } catch (error) {
            console.error('Error in enhanced send to Zapier and database:', error);
            
            // Fallback to just Zapier
            const zapierResult = await window.eDocDataCollection.sendToZapier({
                ...additionalData,
                database_sync_status: 'failed',
                database_error: error.message
            });
            
            return {
                database: { success: false, error: error.message },
                zapier: zapierResult
            };
        }
    },

    // Check if user should be prompted to create account
    shouldPromptAccountCreation() {
        // Check if we have data but no authenticated user
        const hasData = localStorage.getItem('edoc-assessment') || 
                       localStorage.getItem('edoc-treatment') || 
                       localStorage.getItem('edoc-consultation');
        
        return hasData && !window.eDocAuth.getCurrentUser();
    },

    // Get summary of collected data for account creation prompt
    getDataSummary() {
        const collectedData = window.eDocDataCollection.getAllCollectedData();
        
        return {
            hasAssessment: !!collectedData.assessment.age,
            hasTreatment: !!collectedData.treatment.treatmentId,
            hasConsultation: !!collectedData.consultation.type,
            treatmentName: collectedData.treatment.treatmentName,
            totalValue: (collectedData.treatment.price || 0) + (collectedData.consultation.price || 0)
        };
    }
};

// Enhanced success page functionality
const eDocSuccessPageEnhanced = {
    
    // Initialize success page with account creation option
    async initializeSuccessPage() {
        try {
            // Check if user is already authenticated
            const user = await window.eDocAuth.getCurrentUser();
            
            if (user) {
                // User is logged in, show order details
                await this.showAuthenticatedSuccessPage(user);
            } else {
                // User is not logged in, show account creation option
                await this.showGuestSuccessPage();
            }
            
            // Send data to Zapier and database
            await eDocDataCollectionEnhanced.sendToZapierAndDatabase();
            
        } catch (error) {
            console.error('Error initializing success page:', error);
            // Fallback to basic success page
            this.showBasicSuccessPage();
        }
    },

    // Show success page for authenticated users
    async showAuthenticatedSuccessPage(user) {
        // Get user's orders
        const ordersResult = await window.eDocDatabase.getUserOrders(user.id);
        
        if (ordersResult.success && ordersResult.orders.length > 0) {
            const latestOrder = ordersResult.orders[0];
            this.displayOrderDetails(latestOrder, user);
        }
        
        this.showAccountDashboardLink();
    },

    // Show success page for guest users with account creation option
    async showGuestSuccessPage() {
        const dataSummary = eDocDataCollectionEnhanced.getDataSummary();
        this.showAccountCreationPrompt(dataSummary);
    },

    // Display order details
    displayOrderDetails(order, user) {
        const orderDetailsHtml = `
            <div class="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                <h3 class="text-lg font-semibold text-green-800 mb-4">Order Confirmation</h3>
                <div class="space-y-2 text-sm">
                    <p><strong>Order ID:</strong> ${order.id}</p>
                    <p><strong>Treatment:</strong> ${order.treatment_name}</p>
                    <p><strong>Amount:</strong> ${window.eDocUtils.formatPrice(order.payment_amount)}</p>
                    <p><strong>Status:</strong> ${window.eDocUtils.formatOrderStatus(order).prescription.label}</p>
                    <p><strong>Email:</strong> ${user.email}</p>
                </div>
            </div>
        `;
        
        const container = document.getElementById('order-details-container');
        if (container) {
            container.innerHTML = orderDetailsHtml;
        }
    },

    // Show account creation prompt
    showAccountCreationPrompt(dataSummary) {
        // Get email from Stripe payment data
        const paymentData = window.eDocDataCollection.getPaymentDataFromURL();
        const stripeEmail = paymentData.email;
        
        const promptHtml = `
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <h3 class="text-lg font-semibold text-blue-800 mb-4">Create Your Account</h3>
                <p class="text-blue-700 mb-4">
                    Create an account to track your order, view your treatment history, and communicate with our medical team.
                </p>
                
                ${paymentData.amount && paymentData.product ? `
                <div class="bg-white border border-blue-200 rounded-md p-3 mb-4">
                    <h4 class="text-sm font-medium text-gray-800 mb-2">Your Purchase:</h4>
                    <div class="text-sm text-gray-600">
                        <p><strong>Treatment:</strong> ${paymentData.product}</p>
                        <p><strong>Amount:</strong> €${paymentData.amount}</p>
                        ${stripeEmail ? `<p><strong>Email:</strong> ${stripeEmail}</p>` : ''}
                    </div>
                </div>
                ` : ''}
                
                <div class="space-y-4">
                    ${stripeEmail ? `
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input type="email" id="account-email" value="${stripeEmail}" readonly class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed">
                        <p class="text-xs text-gray-500 mt-1">Email from your payment information</p>
                    </div>
                    ` : `
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input type="email" id="account-email" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter your email address">
                    </div>
                    `}
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input type="password" id="account-password" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Choose a secure password">
                        <p class="text-xs text-gray-500 mt-1">Minimum 8 characters with letters and numbers</p>
                    </div>
                    <button onclick="eDocSuccessPageEnhanced.createAccountFromPrompt()" class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                        Create Account
                    </button>
                    <button onclick="eDocSuccessPageEnhanced.skipAccountCreation()" class="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors">
                        Skip for Now
                    </button>
                </div>
            </div>
        `;
        
        const container = document.getElementById('account-creation-container');
        if (container) {
            container.innerHTML = promptHtml;
        }
    },

    // Create account from prompt
    async createAccountFromPrompt() {
        const email = document.getElementById('account-email')?.value;
        const password = document.getElementById('account-password')?.value;
        
        if (!email || !password) {
            alert('Please enter both email and password');
            return;
        }
        
        // Validate email and password
        if (!window.eDocUtils?.validateEmail(email)) {
            alert('Please enter a valid email address');
            return;
        }
        
        const passwordValidation = window.eDocUtils?.validatePassword(password);
        if (!passwordValidation?.isValid) {
            alert('Password requirements:\n' + (passwordValidation?.errors?.join('\n') || 'Invalid password'));
            return;
        }
        
        try {
            // Show loading state
            const createButton = document.querySelector('button[onclick="eDocSuccessPageEnhanced.createAccountFromPrompt()"]');
            if (createButton) {
                createButton.disabled = true;
                createButton.textContent = 'Creating Account...';
            }
            
            // Get payment data for additional context
            const paymentData = window.eDocDataCollection.getPaymentDataFromURL();
            
            const result = await eDocDataCollectionEnhanced.createAccountDuringCheckout(email, password, {
                email: email,
                source: 'success_page_prompt',
                payment_session_id: paymentData.sessionId
            });
            
            if (result.success) {
                // Show success message
                const container = document.getElementById('account-creation-container');
                if (container) {
                    container.innerHTML = `
                        <div class="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                            <h3 class="text-lg font-semibold text-green-800 mb-2">Account Created Successfully!</h3>
                            <p class="text-green-700 mb-4">
                                Your account has been created and you are now logged in. Redirecting to your dashboard...
                            </p>
                        </div>
                    `;
                }
                
                // Redirect to dashboard after a short delay
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 2000);
            } else {
                // Reset button state
                if (createButton) {
                    createButton.disabled = false;
                    createButton.textContent = 'Create Account';
                }
                
                alert('Error creating account: ' + result.error);
            }
            
        } catch (error) {
            console.error('Error creating account:', error);
            
            // Reset button state
            const createButton = document.querySelector('button[onclick="eDocSuccessPageEnhanced.createAccountFromPrompt()"]');
            if (createButton) {
                createButton.disabled = false;
                createButton.textContent = 'Create Account';
            }
            
            alert('Error creating account. Please try again.');
        }
    },

    // Skip account creation
    skipAccountCreation() {
        const container = document.getElementById('account-creation-container');
        if (container) {
            container.innerHTML = `
                <div class="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
                    <p class="text-gray-700">
                        You can create an account later to track your orders and access additional features.
                    </p>
                </div>
            `;
        }
    },

    // Show link to account dashboard
    showAccountDashboardLink() {
        const linkHtml = `
            <div class="text-center mt-6">
                <a href="dashboard.html" class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                    View Your Dashboard
                    <svg class="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                </a>
            </div>
        `;
        
        const container = document.getElementById('dashboard-link-container');
        if (container) {
            container.innerHTML = linkHtml;
        }
    },

    // Show basic success page (fallback)
    showBasicSuccessPage() {
        console.log('Showing basic success page');
        // Existing success page functionality
    }
};

// Export enhanced functions globally (new naming)
window.eDocDataCollectionEnhanced = eDocDataCollectionEnhanced;
window.eDocSuccessPageEnhanced = eDocSuccessPageEnhanced;

// Backward compatibility - keep old naming working
window.TRTDataCollectionEnhanced = eDocDataCollectionEnhanced;
window.TRTSuccessPageEnhanced = eDocSuccessPageEnhanced; 