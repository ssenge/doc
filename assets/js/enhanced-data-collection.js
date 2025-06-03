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
                full_name: personalData.firstName && personalData.lastName ? 
                    `${personalData.firstName} ${personalData.lastName}` : '',
                preferred_language: window.eDocLanguage?.getCurrentLanguage() || 'en'
            });
            
            if (!signUpResult.success) {
                throw new Error(signUpResult.error);
            }
            
            const user = signUpResult.user;
            
            // 2. Create user profile with enhanced data
            const profileData = {
                first_name: personalData.firstName || '',
                last_name: personalData.lastName || '',
                language: window.eDocLanguage?.getCurrentLanguage() || 'en',
                billing_street: personalData.street || '',
                billing_city: personalData.city || '',
                billing_postal_code: personalData.postalCode || '',
                billing_country: personalData.country || 'Germany'
            };
            
            console.log('Creating profile with data:', profileData);
            
            const profileResult = await window.eDocDatabase.createUserProfile(user.id, profileData);
            
            if (!profileResult.success) {
                console.warn('Failed to create user profile:', profileResult.error);
                // Don't fail the entire process if profile creation fails
            } else {
                console.log('✅ User profile created successfully:', profileResult.profile);
            }
            
            // 3. Sync existing localStorage data to database
            await this.syncAllDataToDatabase(user.id);
            
            window.debugLog('Account created successfully during checkout');
            return { 
                success: true, 
                user, 
                profile: profileResult.success ? profileResult.profile : null 
            };
            
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
            
            // Prepare order data with correct column names
            const orderData = {
                user_id: user?.id || null,
                email: user ? null : userEmail, // Correct column name
                session_id: collectedData.session?.sessionId || null,
                
                // Treatment data
                treatment_type: collectedData.treatment.treatmentId || paymentData.treatment,
                treatment_name: collectedData.treatment.treatmentName || paymentData.product,
                price: paymentData.amount ? parseFloat(paymentData.amount) : (collectedData.treatment.price ? collectedData.treatment.price / 100 : 0),
                currency: 'EUR',
                
                // Assessment data as JSON (correct column name)
                assessment_data: {
                    age: collectedData.assessment.age,
                    height: collectedData.assessment.height,
                    weight: collectedData.assessment.weight,
                    symptoms: collectedData.assessment.symptoms || {},
                    medical_history: collectedData.assessment.medicalHistory || {},
                    lifestyle: collectedData.assessment.lifestyle || {},
                    treatment_interval: collectedData.treatment.interval,
                    consultation_price: collectedData.consultation.price || 0
                },
                
                // Consultation data
                consultation_type: collectedData.consultation.type || 'none',
                
                // Payment data
                stripe_session_id: paymentData.sessionId,
                payment_status: paymentData.status || 'completed',
                payment_method: paymentData.paymentMethod || 'stripe',
                
                // Status
                rx_status: 'pending',
                shipping_status: 'not_ready'
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

    // Get customer email from Stripe session (if session_id is available)
    async getCustomerEmailFromStripe(sessionId) {
        try {
            // Since we can't call Stripe API from frontend without backend,
            // we'll return null and handle this case in the UI
            console.log('Session ID available but cannot retrieve customer email from frontend:', sessionId);
            console.log('Email collection will need to be handled through form input');
            return null;
        } catch (error) {
            console.error('Error retrieving customer email from Stripe:', error);
            return null;
        }
    },

    // Enhanced payment data extraction that handles missing email
    async getEnhancedPaymentDataFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const paymentData = {
            email: urlParams.get('email'),
            amount: urlParams.get('amount'),
            product: urlParams.get('product'),
            treatment: urlParams.get('treatment'),
            sessionId: urlParams.get('session_id'),
            status: 'completed' // Assume completed if we're on success page
        };

        // If we don't have email but have session_id, we can't retrieve it without backend
        // So we'll prompt user to enter their email in the form
        if (!paymentData.email && paymentData.sessionId) {
            console.log('Email not provided in URL parameters and session ID cannot be used without backend');
            console.log('User will need to provide email in the account creation form');
        }

        return paymentData;
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
            const paymentData = await this.getEnhancedPaymentDataFromURL();
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
    },

    // Show account creation prompt
    async showAccountCreationPrompt(dataSummary) {
        // Get email from Stripe payment data
        const paymentData = await this.getEnhancedPaymentDataFromURL();
        const stripeEmail = paymentData.email;
        
        const promptHtml = `
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <div class="text-center mb-6">
                    <h3 class="text-2xl font-bold text-blue-800 mb-2">🎉 Payment Successful!</h3>
                    <p class="text-blue-700 text-lg">
                        Complete your account setup to track your order and access your treatment plan.
                    </p>
                </div>
                
                ${paymentData.amount && paymentData.product ? `
                <div class="bg-white border border-blue-200 rounded-md p-4 mb-6">
                    <h4 class="text-lg font-semibold text-gray-800 mb-3">📋 Order Summary</h4>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                            <span class="font-medium text-gray-600">Treatment:</span>
                            <p class="text-gray-800">${paymentData.product}</p>
                        </div>
                        <div>
                            <span class="font-medium text-gray-600">Amount:</span>
                            <p class="text-gray-800 font-semibold">€${paymentData.amount}</p>
                        </div>
                        <div>
                            <span class="font-medium text-gray-600">Email:</span>
                            <p class="text-gray-800">${stripeEmail || 'Confirmed'}</p>
                        </div>
                    </div>
                </div>
                ` : ''}
                
                <div class="bg-white border border-blue-200 rounded-md p-4 mb-4">
                    <h4 class="text-lg font-semibold text-gray-800 mb-3">✨ Account Benefits</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
                        <div class="flex items-center">
                            <span class="text-green-500 mr-2">✅</span>
                            Track your order status in real-time
                        </div>
                        <div class="flex items-center">
                            <span class="text-green-500 mr-2">✅</span>
                            Access your personalized treatment plan
                        </div>
                        <div class="flex items-center">
                            <span class="text-green-500 mr-2">✅</span>
                            Communicate with our medical team
                        </div>
                        <div class="flex items-center">
                            <span class="text-green-500 mr-2">✅</span>
                            View your complete treatment history
                        </div>
                    </div>
                </div>
                
                <form id="enhanced-account-form" class="space-y-4">
                    <h4 class="text-lg font-semibold text-gray-800 mb-4">👤 Complete Your Profile</h4>
                    
                    <!-- Email (pre-filled from Stripe if available) -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        ${stripeEmail ? `
                        <input type="email" id="account-email" value="${stripeEmail}" readonly class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed">
                        <p class="text-xs text-gray-500 mt-1">✅ Confirmed from your payment</p>
                        ` : `
                        <input type="email" id="account-email" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter your email address" required>
                        `}
                    </div>
                    
                    <!-- Name fields (separate first/last) -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                            <input type="text" id="account-first-name" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter your first name" required>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                            <input type="text" id="account-last-name" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter your last name" required>
                        </div>
                    </div>
                    
                    <!-- Billing Address -->
                    <div class="border-t border-gray-200 pt-4">
                        <h5 class="text-md font-medium text-gray-800 mb-3">🏠 Billing Address</h5>
                        <p class="text-sm text-gray-600 mb-4">This should match the address you used during payment.</p>
                        
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
                                <input type="text" id="account-street" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter your street address" required>
                            </div>
                            
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">City *</label>
                                    <input type="text" id="account-city" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter your city" required>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Postal Code *</label>
                                    <input type="text" id="account-postal" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter postal code" required>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                                    <select id="account-country" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                                        <option value="">Select your country</option>
                                        <option value="Germany">Germany</option>
                                        <option value="Austria">Austria</option>
                                        <option value="Switzerland">Switzerland</option>
                                        <option value="Netherlands">Netherlands</option>
                                        <option value="Belgium">Belgium</option>
                                        <option value="Luxembourg">Luxembourg</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Password -->
                    <div class="border-t border-gray-200 pt-4">
                        <h5 class="text-md font-medium text-gray-800 mb-3">🔒 Account Security</h5>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                            <input type="password" id="account-password" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Choose a secure password" required>
                            <p class="text-xs text-gray-500 mt-1">Minimum 8 characters with letters and numbers</p>
                        </div>
                    </div>
                    
                    <!-- Error/Success Messages -->
                    <div id="account-form-messages" class="hidden"></div>
                    
                    <!-- Action Buttons -->
                    <div class="flex flex-col sm:flex-row gap-3 pt-4">
                        <button type="submit" class="flex-1 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors font-medium">
                            🚀 Create Account & Access Dashboard
                        </button>
                        <button type="button" onclick="eDocDataCollectionEnhanced.skipAccountCreation()" class="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-md hover:bg-gray-300 transition-colors font-medium">
                            ⏭️ Skip for Now
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        const container = document.getElementById('account-creation-container');
        if (container) {
            container.innerHTML = promptHtml;
            
            // Add form submission handler
            const form = document.getElementById('enhanced-account-form');
            if (form) {
                form.addEventListener('submit', this.handleEnhancedAccountCreation.bind(this));
            }
        }
    },

    // Handle enhanced account creation form submission
    async handleEnhancedAccountCreation(event) {
        event.preventDefault();
        
        const messagesDiv = document.getElementById('account-form-messages');
        const submitButton = event.target.querySelector('button[type="submit"]');
        
        // Show loading state
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.innerHTML = '⏳ Creating Account...';
        }
        
        // Clear previous messages
        if (messagesDiv) {
            messagesDiv.classList.add('hidden');
            messagesDiv.innerHTML = '';
        }
        
        try {
            // Collect form data
            const formData = {
                email: document.getElementById('account-email')?.value?.trim(),
                firstName: document.getElementById('account-first-name')?.value?.trim(),
                lastName: document.getElementById('account-last-name')?.value?.trim(),
                street: document.getElementById('account-street')?.value?.trim(),
                city: document.getElementById('account-city')?.value?.trim(),
                postalCode: document.getElementById('account-postal')?.value?.trim(),
                country: document.getElementById('account-country')?.value,
                password: document.getElementById('account-password')?.value
            };
            
            // Validate form data
            const validation = this.validateEnhancedAccountForm(formData);
            if (!validation.isValid) {
                this.showFormMessage(messagesDiv, validation.errors.join('<br>'), 'error');
                return;
            }
            
            // Create account with enhanced data
            const result = await eDocDataCollectionEnhanced.createAccountDuringCheckout(
                formData.email,
                formData.password,
                {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    street: formData.street,
                    city: formData.city,
                    postalCode: formData.postalCode,
                    country: formData.country,
                    source: 'enhanced_success_page'
                }
            );
            
            if (result.success) {
                // Show success message
                this.showFormMessage(messagesDiv, 
                    '✅ Account created successfully! Redirecting to your dashboard...', 
                    'success'
                );
                
                // Create order record if payment data exists
                const paymentData = await eDocDataCollectionEnhanced.getEnhancedPaymentDataFromURL();
                if (paymentData.sessionId || paymentData.amount) {
                    try {
                        await this.createOrderAfterPayment(paymentData, formData.email);
                    } catch (orderError) {
                        console.warn('Failed to create order record:', orderError);
                        // Don't fail the account creation for this
                    }
                }
                
                // Wait for authentication state to be properly established
                // then redirect to dashboard
                setTimeout(async () => {
                    // Double-check that user is authenticated before redirecting
                    let attempts = 0;
                    const maxAttempts = 10;
                    
                    const checkAuthAndRedirect = async () => {
                        attempts++;
                        const user = await window.eDocAuth.getCurrentUser();
                        
                        if (user) {
                            console.log('✅ User authenticated, redirecting to dashboard');
                            window.location.href = 'dashboard.html';
                        } else if (attempts < maxAttempts) {
                            console.log(`⏳ Waiting for authentication... (attempt ${attempts}/${maxAttempts})`);
                            setTimeout(checkAuthAndRedirect, 500);
                        } else {
                            console.warn('❌ Authentication not established after registration, redirecting to login');
                            window.location.href = 'login.html?message=Please log in with your new account';
                        }
                    };
                    
                    checkAuthAndRedirect();
                }, 1000);
                
            } else {
                this.showFormMessage(messagesDiv, 
                    `❌ Account creation failed: ${result.error}`, 
                    'error'
                );
            }
            
        } catch (error) {
            console.error('Enhanced account creation error:', error);
            this.showFormMessage(messagesDiv, 
                `❌ An unexpected error occurred: ${error.message}`, 
                'error'
            );
        } finally {
            // Reset button state
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.innerHTML = '🚀 Create Account & Access Dashboard';
            }
        }
    },

    // Validate enhanced account form
    validateEnhancedAccountForm(formData) {
        const errors = [];
        
        // Email validation
        if (!formData.email) {
            errors.push('Email address is required');
        } else if (!window.eDocUtils?.validateEmail(formData.email)) {
            errors.push('Please enter a valid email address');
        }
        
        // Name validation
        if (!formData.firstName || formData.firstName.length < 2) {
            errors.push('First name must be at least 2 characters');
        }
        
        if (!formData.lastName || formData.lastName.length < 2) {
            errors.push('Last name must be at least 2 characters');
        }
        
        // Address validation
        if (!formData.street || formData.street.length < 5) {
            errors.push('Street address must be at least 5 characters');
        }
        
        if (!formData.city || formData.city.length < 2) {
            errors.push('City must be at least 2 characters');
        }
        
        if (!formData.postalCode || formData.postalCode.length < 4) {
            errors.push('Postal code must be at least 4 characters');
        }
        
        if (!formData.country) {
            errors.push('Please select a country');
        }
        
        // Password validation
        if (!formData.password) {
            errors.push('Password is required');
        } else {
            const passwordValidation = window.eDocUtils?.validatePassword(formData.password);
            if (passwordValidation && !passwordValidation.isValid) {
                errors.push(...(passwordValidation.errors || ['Password does not meet requirements']));
            }
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    },

    // Show form message (success or error)
    showFormMessage(messagesDiv, message, type) {
        if (!messagesDiv) return;
        
        const bgColor = type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800';
        
        messagesDiv.innerHTML = `
            <div class="${bgColor} border rounded-md p-3">
                ${message}
            </div>
        `;
        messagesDiv.classList.remove('hidden');
        
        // Scroll to message
        messagesDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
    },

    // Initialize success page with account creation option
    async initializeSuccessPage() {
        try {
            // Get payment data from URL
            const paymentData = await this.getEnhancedPaymentDataFromURL();
            console.log('Payment data from URL:', paymentData);
            
            // Check if user is already authenticated
            const user = await window.eDocAuth.getCurrentUser();
            
            if (user) {
                // User is logged in, create order and show order details
                await this.createOrderAfterPayment(paymentData, user.email);
                await this.showAuthenticatedSuccessPage(user);
            } else {
                // User is not logged in, create guest order if we have payment data
                if (paymentData.amount && paymentData.product) {
                    await this.createOrderAfterPayment(paymentData, paymentData.email);
                }
                // Show account creation option
                await this.showGuestSuccessPage();
            }
            
            // Send data to Zapier and database
            await this.sendToZapierAndDatabase();
            
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
        const dataSummary = this.getDataSummary();
        await this.showAccountCreationPrompt(dataSummary);
    },

    // Display order details
    displayOrderDetails(order, user) {
        const orderDetailsHtml = `
            <div class="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                <h3 class="text-lg font-semibold text-green-800 mb-4">Order Confirmation</h3>
                <div class="space-y-2 text-sm">
                    <p><strong>Order ID:</strong> ${order.id}</p>
                    <p><strong>Treatment:</strong> ${order.treatment_name}</p>
                    <p><strong>Amount:</strong> ${window.eDocUtils.formatPrice(order.price)}</p>
                    <p><strong>Status:</strong> ${window.eDocUtils.formatOrderStatus(order).prescription.label}</p>
                    <p><strong>Email:</strong> ${user.email}</p>
                </div>
            </div>
        `;
        
        const container = document.getElementById('order-details-container');
        if (container) {
            container.innerHTML = orderDetailsHtml;
        }
    }
};

// Export enhanced functions globally (new naming)
window.eDocDataCollectionEnhanced = eDocDataCollectionEnhanced;
window.eDocSuccessPageEnhanced = eDocDataCollectionEnhanced;

// Backward compatibility - keep old naming working
window.TRTDataCollectionEnhanced = eDocDataCollectionEnhanced;
window.TRTSuccessPageEnhanced = eDocDataCollectionEnhanced;

// Force override critical functions to ensure they work (direct override)
window.eDocDataCollectionEnhanced.getEnhancedPaymentDataFromURL = async function() {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentData = {
        email: urlParams.get('email'),
        amount: urlParams.get('amount'),
        product: urlParams.get('product'),
        treatment: urlParams.get('treatment'),
        sessionId: urlParams.get('session_id'),
        status: 'completed' // Assume completed if we're on success page
    };

    // If we don't have email but have session_id, we can't retrieve it without backend
    // So we'll prompt user to enter their email in the form
    if (!paymentData.email && paymentData.sessionId) {
        console.log('Email not provided in URL parameters and session ID cannot be used without backend');
        console.log('User will need to provide email in the account creation form');
    }

    return paymentData;
}; 