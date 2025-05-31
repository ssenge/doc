#!/usr/bin/env python3
"""
Script to create Stripe Payment Links for TRT treatments via API
"""

import stripe
import json

# Replace with your actual Stripe secret key
STRIPE_SECRET_KEY = 'sk_test_YOUR_SECRET_KEY_HERE'  # Replace this with your SECRET key (starts with sk_test_)

# Initialize Stripe
stripe.api_key = STRIPE_SECRET_KEY

# Treatment data matching the frontend
TREATMENTS = {
    'testo-gel': {
        'name': 'Testosterone Gel',
        'price': 8900,  # €89.00 in cents
        'description': 'Daily topical application with steady hormone levels throughout the day. Perfect for those who prefer non-invasive treatment.',
        'images': ['https://via.placeholder.com/400x300/3B82F6/FFFFFF?text=Testosterone+Gel']
    },
    'injections': {
        'name': 'Testosterone Injections',
        'price': 12900,  # €129.00 in cents
        'description': 'Weekly intramuscular injections. Most effective method with peak hormone optimization. Includes all supplies and detailed instructions.',
        'images': ['https://via.placeholder.com/400x300/10B981/FFFFFF?text=Testosterone+Injections']
    },
    'patches': {
        'name': 'Testosterone Patches',
        'price': 10900,  # €109.00 in cents
        'description': 'Daily transdermal patches. Convenient and discreet with consistent hormone delivery. Simply apply and forget.',
        'images': ['https://via.placeholder.com/400x300/8B5CF6/FFFFFF?text=Testosterone+Patches']
    },
    'pellets': {
        'name': 'Testosterone Pellets',
        'price': 29900,  # €299.00 in cents
        'description': 'Long-lasting subcutaneous pellets. Inserted once every 3-4 months for ultimate convenience. No daily routine required.',
        'images': ['https://via.placeholder.com/400x300/F59E0B/FFFFFF?text=Testosterone+Pellets']
    },
    'nasal-gel': {
        'name': 'Testosterone Nasal Gel',
        'price': 14900,  # €149.00 in cents
        'description': 'Innovative nasal application. Fast absorption with no skin transfer risk. Perfect for those with sensitive skin or active lifestyles.',
        'images': ['https://via.placeholder.com/400x300/06B6D4/FFFFFF?text=Testosterone+Nasal+Gel']
    },
    'custom': {
        'name': 'Custom Compound',
        'price': 18900,  # €189.00 in cents
        'description': 'Personalized testosterone formulation. Tailored to your specific needs and preferences based on your assessment and lab results.',
        'images': ['https://via.placeholder.com/400x300/6366F1/FFFFFF?text=Custom+Compound']
    }
}

# Your website URLs
SUCCESS_URL = 'https://ssenge.github.io/doc/success.html'
CANCEL_URL = 'https://ssenge.github.io/doc/treatments.html'

def create_payment_links():
    """Create Payment Links for all TRT treatments"""
    print('🚀 Creating Payment Links for TRT treatments...\n')
    
    payment_links = {}
    
    for treatment_id, treatment in TREATMENTS.items():
        try:
            print(f"Creating Payment Link for: {treatment['name']}")
            
            # First, create a product
            product = stripe.Product.create(
                name=treatment['name'],
                description=treatment['description'],
                images=treatment['images'],
                metadata={
                    'treatment_id': treatment_id,
                    'source': 'trt_treatments'
                }
            )
            
            print(f"✅ Product created: {product.id}")
            
            # Then, create a price for the product
            price = stripe.Price.create(
                currency='eur',
                unit_amount=treatment['price'],
                product=product.id,
                metadata={
                    'treatment_id': treatment_id
                }
            )
            
            print(f"✅ Price created: {price.id}")
            
            # Finally, create the Payment Link
            success_url_with_params = f"{SUCCESS_URL}?treatment={treatment_id}&amount={treatment['price'] / 100:.2f}&product={treatment['name'].replace(' ', '+')}"
            
            payment_link = stripe.PaymentLink.create(
                line_items=[
                    {
                        'price': price.id,
                        'quantity': 1,
                    },
                ],
                after_completion={
                    'type': 'redirect',
                    'redirect': {
                        'url': success_url_with_params
                    }
                },
                automatic_tax={
                    'enabled': True
                },
                billing_address_collection='required',
                shipping_address_collection={
                    'allowed_countries': ['DE', 'AT', 'CH', 'NL', 'BE', 'LU', 'FR', 'IT', 'ES', 'PT']
                },
                metadata={
                    'treatment_id': treatment_id,
                    'source': 'trt_treatments'
                }
            )
            
            print(f"✅ Payment Link created: {payment_link.url}")
            
            payment_links[treatment_id] = payment_link.url
            
            print('---\n')
            
        except Exception as error:
            print(f"❌ Error creating Payment Link for {treatment['name']}: {str(error)}")
    
    # Output the results
    print('🎉 All Payment Links created successfully!\n')
    print('📋 Copy these URLs to your treatments.js file:\n')
    
    print('const TREATMENTS = {')
    for treatment_id, treatment in TREATMENTS.items():
        url = payment_links.get(treatment_id, 'ERROR_CREATING_LINK')
        interval = '3-month' if treatment_id == 'pellets' else 'month'
        
        print(f"    '{treatment_id}': {{")
        print(f"        name: '{treatment['name']}',")
        print(f"        price: {treatment['price']},")
        print(f"        currency: 'eur',")
        print(f"        description: '{treatment['description']}',")
        print(f"        interval: '{interval}',")
        print(f"        paymentLink: '{url}'")
        print(f"    }},")
    print('};')
    
    print('\n📝 Summary:')
    for treatment_id, url in payment_links.items():
        treatment = TREATMENTS[treatment_id]
        price_eur = treatment['price'] / 100
        print(f"{treatment['name']}: €{price_eur:.2f} - {url}")
    
    # Save to file for easy copying
    with open('payment_links_output.txt', 'w') as f:
        f.write('// Generated Payment Links for TRT Treatments\n')
        f.write('const TREATMENTS = {\n')
        for treatment_id, treatment in TREATMENTS.items():
            url = payment_links.get(treatment_id, 'ERROR_CREATING_LINK')
            interval = '3-month' if treatment_id == 'pellets' else 'month'
            
            f.write(f"    '{treatment_id}': {{\n")
            f.write(f"        name: '{treatment['name']}',\n")
            f.write(f"        price: {treatment['price']},\n")
            f.write(f"        currency: 'eur',\n")
            f.write(f"        description: '{treatment['description']}',\n")
            f.write(f"        interval: '{interval}',\n")
            f.write(f"        paymentLink: '{url}'\n")
            f.write(f"    }},\n")
        f.write('};\n')
    
    print(f'\n💾 Code also saved to: payment_links_output.txt')

if __name__ == '__main__':
    # Check if secret key is set
    if STRIPE_SECRET_KEY == 'sk_test_YOUR_SECRET_KEY_HERE':
        print('❌ Error: Please update STRIPE_SECRET_KEY in the script with your actual Stripe secret key!')
        print('   Get it from: https://dashboard.stripe.com/test/apikeys')
        exit(1)
    
    try:
        create_payment_links()
    except Exception as e:
        print(f'❌ Error: {str(e)}')
        print('\nMake sure you have:')
        print('1. Valid Stripe secret key')
        print('2. Stripe Python library installed: pip install stripe')
        exit(1) 