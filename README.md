# TRT Clinic Website

A professional, bilingual (English/German) website for Testosterone Replacement Therapy (TRT) services built with Flowbite components and vanilla JavaScript.

## 🌟 Features

### Multi-Language Support
- **English** and **German** language switching
- Automatic browser language detection
- Persistent language preference storage
- Real-time content translation

### Landing Page
- Professional hero section with gradient background
- Symptom awareness cards with hover effects
- 4-step process timeline using Flowbite components
- Call-to-action sections
- Responsive design for all devices

### Assessment Form
- **4-step multi-step form** with progress indicators
- Real-time form validation
- Auto-save functionality (localStorage)
- Symptom rating system (1-5 scale)
- Medical history collection
- Lifestyle and goals assessment

### Consultation Booking
- **3 pricing tiers**: Video, Phone, Premium consultations
- Dynamic package selection
- Comprehensive booking form with:
  - Personal information
  - Billing address
  - Payment processing (simulated)
- Credit card validation with Luhn algorithm
- Terms and conditions acceptance

### Technical Features
- **Flowbite UI Framework** for consistent design
- Responsive mobile-first design
- Form persistence and recovery
- **Zapier integration** ready (webhook endpoints)
- Accessibility features (WCAG compliant)
- Print-friendly styles
- Loading states and error handling

## 🚀 Quick Start

1. **Clone or download** the project files
2. **Open `index.html`** in a web browser
3. **Navigate through** the assessment and booking flow

### File Structure
```
trt-clinic/
├── index.html              # Landing page
├── assessment.html         # Multi-step assessment form
├── consultation.html       # Consultation booking
├── assets/
│   ├── css/
│   │   └── custom.css      # Custom styling
│   └── js/
│       ├── language.js     # Language switching
│       ├── assessment.js   # Assessment form logic
│       └── consultation.js # Booking functionality
└── README.md
```

## 🎨 Design System

### Color Palette
- **Primary Blue**: `#1e40af` - Main brand color
- **Secondary Green**: `#059669` - Success states
- **Accent Orange**: `#ea580c` - Call-to-action elements
- **Text Dark**: `#1f2937` - Primary text
- **Text Light**: `#6b7280` - Secondary text

### Typography
- **Headings**: Flowbite default font stack
- **Body**: Clean sans-serif for readability
- **Medical terms**: Smaller text with tooltips

## 🔧 Technical Implementation

### Language System
```javascript
// Switch language
switchLanguage('de'); // or 'en'

// Get current language
const lang = window.TRTLanguage.getCurrentLanguage();

// Format currency
const price = window.TRTLanguage.formatCurrency(199);
```

### Form Validation
- Real-time validation with visual feedback
- Custom error messages in both languages
- Email, phone, and credit card validation
- Age, height, and weight range validation

### Data Flow
1. **Assessment Form** → localStorage → Zapier webhook
2. **Consultation Booking** → localStorage → Zapier webhook
3. **Success Page** → Clear stored data

### Zapier Integration
Replace the simulated webhook calls with real Zapier endpoints:

```javascript
// In assessment.js and consultation.js
function sendToZapier(data) {
    return fetch('YOUR_ZAPIER_WEBHOOK_URL', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    });
}
```

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Mobile Optimizations
- Touch-friendly form elements
- Optimized symptom rating layout
- Collapsible navigation
- Swipe-friendly multi-step forms

## ♿ Accessibility Features

- **WCAG 2.1 AA compliant**
- Keyboard navigation support
- Screen reader friendly
- High contrast mode support
- Reduced motion preferences
- Focus indicators
- Semantic HTML structure

## 🔒 Security & Privacy

### Data Protection
- Client-side data encryption before storage
- Sensitive payment data excluded from localStorage
- HTTPS enforcement recommended
- Input sanitization and validation

### Form Security
- CSRF protection considerations
- Rate limiting recommendations
- Captcha integration ready
- Luhn algorithm for credit card validation

## 🌐 Browser Support

- **Chrome** 90+
- **Firefox** 88+
- **Safari** 14+
- **Edge** 90+
- **Mobile browsers** (iOS Safari, Chrome Mobile)

## 📊 Data Structure

### Assessment Data
```json
{
  "personal_info": {
    "age": 35,
    "height": 180,
    "weight": 75,
    "email": "user@example.com",
    "phone": "+1234567890",
    "location": "germany"
  },
  "symptoms": {
    "energy": 4,
    "libido": 3,
    "muscle": 5,
    "mood": 2
  },
  "medical_history": {
    "medications": "None",
    "hormone_therapy": "no",
    "conditions": ["diabetes"]
  },
  "lifestyle": {
    "exercise": "3-4",
    "goals": "Increase energy and muscle mass",
    "consultation": "video"
  },
  "assessmentScore": 3.5,
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### Booking Data
```json
{
  "selectedPackage": {
    "type": "video",
    "price": 199
  },
  "personalInfo": {
    "firstName": "John",
    "lastName": "Doe",
    "address": "123 Main St",
    "city": "Berlin",
    "postalCode": "10115",
    "country": "DE"
  },
  "bookingId": "TRT-1640995200000-ABC123DEF",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## 🚀 Deployment

### Static Hosting
Deploy to any static hosting service:
- **Netlify**: Drag and drop deployment
- **Vercel**: Git integration
- **GitHub Pages**: Free hosting
- **AWS S3**: Scalable hosting

### CDN Configuration
The site uses CDN resources:
- Flowbite CSS/JS from cdnjs.cloudflare.com
- Ensure CDN availability for production

## 🔮 Future Enhancements

### Planned Features
- [ ] Doctor profiles and selection
- [ ] Appointment scheduling calendar
- [ ] Patient dashboard
- [ ] Email confirmation system
- [ ] SMS notifications
- [ ] Payment gateway integration (Stripe/PayPal)
- [ ] Multi-step progress saving
- [ ] Advanced analytics tracking

### Technical Improvements
- [ ] Progressive Web App (PWA) features
- [ ] Offline functionality
- [ ] Advanced form validation
- [ ] A/B testing framework
- [ ] Performance monitoring
- [ ] SEO optimization

## 📄 License

This project is created for demonstration purposes. Please ensure compliance with medical advertising regulations and data protection laws (GDPR, HIPAA) when using for actual medical services.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For questions or support regarding this TRT clinic website template, please refer to the documentation or create an issue in the repository.

---

**Note**: This is a template for educational purposes. Always consult with legal and medical professionals when creating actual medical service websites. 