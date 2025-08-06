# Flint Directors Portal

A comprehensive onboarding portal for Flint mortgage brokers built with HTML, Bootstrap, jQuery, and JavaScript.

## Features

- **Authentication System** - Secure login with form validation
- **Progressive Onboarding** - 7-step guided journey
- **Responsive Design** - Mobile-first approach
- **Interactive Elements** - Video tracking, progress monitoring
- **Brand Compliance** - Flint brand colors and typography

## Pages Structure

1. **Login Page** (`index.html`) - Authentication entry point
2. **Dashboard** (`dashboard.html`) - Main onboarding overview
3. **Step Pages** (`step1.html` to `step7.html`) - Individual onboarding steps

## Getting Started

1. Open `index.html` in your browser
2. Use demo credentials or sign up
3. Navigate through the onboarding journey

## Tech Stack

- HTML5 & CSS3
- Bootstrap 5.3
- jQuery 3.6
- Font Awesome 6.0
- Google Fonts (Inter)

A comprehensive, responsive web application for onboarding new Flint Directors through a 7-step process. Built with HTML, Bootstrap, jQuery, and JavaScript following the Flint brand guidelines.

## 🎨 Design System

### Brand Colors
- **Primary Burgundy**: #4D0032
- **Coral Tint**: #FFAF9C  
- **Cornflower Tint**: #CED7FF
- **Mustard Tint**: #F0E2A6
- **Mint Tint**: #D8FADD
- **Background**: White

### Typography
- **Font Family**: Inter (fallback to system fonts)
- **Headings**: Bold, tracking -2%, leading 100%
- **Body**: Regular weight

### Design Principles
- Clean, minimalistic UI
- Rounded cards with soft shadows
- Floral iconography style
- Warm, friendly microcopy
- Fully responsive design

## 📁 Project Structure

```
flintt/
├── index.html              # Landing page / Dashboard
├── step1.html              # Welcome & Introduction
├── step2.html              # Legal & Compliance (sample)
├── step3.html              # Accounting & Financial (to be built)
├── step4.html              # Operational Training (to be built)
├── step5.html              # Branding & Marketing (to be built)
├── step6.html              # Partnership & Growth (to be built)
├── step7.html              # Continuous Support (to be built)
├── assets/
│   ├── css/
│   │   └── style.css       # Main stylesheet
│   ├── js/
│   │   ├── main.js         # Core JavaScript functionality
│   │   └── step1.js        # Step 1 specific JavaScript
│   ├── images/             # Image assets (to be added)
│   └── downloads/          # PDF downloads (to be added)
└── README.md
```

## 🚀 Features

### Landing Page (index.html)
- **Hero Section**: Welcome message with call-to-action
- **Progress Tracking**: Visual progress indicator across all steps
- **Step Overview**: Cards for each of the 7 onboarding steps
- **Resource Library**: Quick access to downloads and tools
- **Testimonials**: Carousel of success stories
- **Support Options**: Live chat, phone, and Slack integration
- **Responsive Navigation**: Mobile-friendly with dark mode toggle

### Step Pages
- **Progress Tracker**: Fixed progress bar showing completion status
- **Step Navigation**: Previous/next step navigation
- **Interactive Content**: Videos, animations, and engaging elements
- **Completion Tracking**: Checkbox requirements for step completion
- **Resource Downloads**: PDF documents and tools
- **Context-Sensitive Help**: Step-specific FAQs and support

### Core Functionality
- **Progress Management**: Local storage of user progress
- **Dark Mode**: Theme switching with persistence
- **Animations**: Smooth transitions and scroll-triggered animations
- **Form Validation**: Built-in validation for user inputs
- **Analytics Integration**: Event tracking for user interactions
- **Offline Support**: Service worker for basic offline functionality

## 🛠 Technical Implementation

### Dependencies
- **Bootstrap 5.3.2**: UI framework and responsive grid
- **jQuery 3.7.1**: DOM manipulation and event handling
- **Font Awesome 6.4.0**: Icons and visual elements
- **Google Fonts**: Inter font family

### JavaScript Architecture
- **Main.js**: Core functionality, utilities, and shared components
- **Step-specific JS**: Individual files for each step's unique functionality
- **Progress Tracking**: localStorage-based progress persistence
- **Event System**: Custom events for step completion and navigation

### CSS Architecture
- **Custom Properties**: CSS variables for consistent theming
- **Component-based**: Modular styles for reusable components
- **Responsive Design**: Mobile-first approach with breakpoints
- **Animation System**: CSS transitions and keyframe animations

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 991px  
- **Desktop**: > 992px

### Mobile Optimizations
- Collapsible navigation menu
- Stacked layouts for content sections
- Touch-friendly button sizes
- Optimized typography scaling
- Floating action buttons

## 🎯 User Experience Features

### Progress Tracking
- Visual progress bar with percentage completion
- Step-by-step completion requirements
- Locked/unlocked step navigation
- Completion celebrations and notifications

### Interactive Elements
- Video modals with tracking
- Animated content reveals
- Hover effects and micro-interactions
- Progressive disclosure of information

### Accessibility
- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support

## 🔧 Setup & Deployment

### Local Development
1. Clone the repository
2. Open `index.html` in a web browser
3. For local server: `python -m http.server 8000` or similar

### Production Deployment
1. Upload files to web server
2. Configure HTTPS (recommended)
3. Set up analytics tracking
4. Configure contact form endpoints
5. Add real PDF downloads to `/assets/downloads/`

### Asset Requirements
The following assets need to be added:
- Logo files: `flint-logo.png`, `flintengine-logo.png`, `flintmedia-logo.png`
- Hero illustrations: `hero-illustration.svg`, `welcome-illustration.svg`, etc.
- Testimonial images: `testimonial1.jpg`, `testimonial2.jpg`, `testimonial3.jpg`
- PDF documents in `/assets/downloads/`

## 📋 Content Management

### Step 1: Welcome & Introduction
- Welcome video integration
- Mission & vision content
- Flint values explanation
- Platform comparison (FlintEngine vs FlintMedia)
- Directors model overview
- Resource downloads

### Step 2: Legal & Compliance
- Legal setup timeline
- ABN registration guidance
- Licensing requirements
- Asset ownership explanation
- Document library
- Legal consultation booking

### Remaining Steps (To Be Implemented)
- **Step 3**: Accounting & Financial setup
- **Step 4**: Operational training and tools
- **Step 5**: Branding and marketing launch
- **Step 6**: Partnership and growth strategies
- **Step 7**: Ongoing support and feedback loops

## 🔌 Integration Points

### External Services
- **Video Hosting**: YouTube/Vimeo embeds
- **Chat Support**: Intercom/Zendesk widget integration
- **Calendar Booking**: Calendly or similar service
- **Analytics**: Google Analytics integration
- **Email**: Contact form backend service

### CRM Integration
- Progress tracking sync
- Lead capture forms
- Completion notifications
- Support ticket creation

## 🧪 Testing Checklist

### Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile browsers

### Functionality Testing
- [ ] Navigation between steps
- [ ] Progress tracking accuracy
- [ ] Form validation
- [ ] Video playback
- [ ] Download functionality
- [ ] Dark mode toggle
- [ ] Responsive layouts

### Performance Testing
- [ ] Page load speeds
- [ ] Image optimization
- [ ] JavaScript performance
- [ ] Mobile performance

## 📝 Future Enhancements

### Phase 2 Features
- User authentication and accounts
- Real-time progress sync
- Advanced analytics dashboard
- Mobile app companion
- Offline-first functionality

### Content Additions
- Interactive tutorials
- Video assessments
- Gamification elements
- Community integration
- Advanced reporting

## 🤝 Contributing

1. Follow the established coding standards
2. Maintain responsive design principles
3. Test across multiple browsers and devices
4. Update documentation for new features
5. Follow the Flint brand guidelines

## 📞 Support

For technical support or questions about the onboarding portal:
- **Email**: directors@flint.com.au
- **Phone**: 1300 123 456
- **Documentation**: This README file

---

**Built with ❤️ for Flint Directors**