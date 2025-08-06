// Flint Directors Portal - Main JavaScript

$(document).ready(function() {
    // Initialize the application
    init();
});

function init() {
    initProgressTracker();
    initDarkMode();
    initAnimations();
    initStepTracking();
    initFloatingElements();
    initModals();
    initCarousels();
    loadUserProgress();
    
    console.log('Flint Directors Portal initialized successfully');
}

// Progress Tracking System
let userProgress = {
    currentStep: 1,
    completedSteps: [],
    totalSteps: 7,
    overallProgress: 0
};

function initProgressTracker() {
    updateProgressDisplay();
    
    // Handle step completion
    $('.step-card').on('click', '.btn:not(.disabled)', function(e) {
        const stepCard = $(this).closest('.step-card');
        const stepNumber = parseInt(stepCard.data('step'));
        
        if (stepNumber <= userProgress.currentStep) {
            // Allow access to current and previous steps
            window.location.href = $(this).attr('href');
        }
    });
}

function updateProgressDisplay() {
    const progressPercentage = Math.round((userProgress.completedSteps.length / userProgress.totalSteps) * 100);
    
    // Update progress bar
    $('.progress-bar').css('width', progressPercentage + '%').attr('aria-valuenow', progressPercentage);
    $('.progress-text').text(progressPercentage + '% Complete');
    
    // Update step cards
    updateStepCards();
}

function updateStepCards() {
    $('.step-card').each(function() {
        const stepNumber = parseInt($(this).data('step'));
        const $btn = $(this).find('.btn');
        const $progress = $(this).find('.step-progress .progress-bar');
        
        if (userProgress.completedSteps.includes(stepNumber)) {
            // Completed step
            $(this).addClass('completed');
            $progress.css('width', '100%').addClass('bg-success');
            $btn.removeClass('disabled').removeClass('btn-outline-primary').addClass('btn-success').html('<i class="fas fa-check me-2"></i>Completed');
        } else if (stepNumber === userProgress.currentStep) {
            // Current step
            $(this).addClass('current');
            $btn.removeClass('disabled').removeClass('btn-outline-primary').addClass('btn-primary').html('Continue Step ' + stepNumber + ' <i class="fas fa-arrow-right ms-2"></i>');
        } else if (stepNumber < userProgress.currentStep) {
            // Previous steps (accessible)
            $btn.removeClass('disabled').html('Review Step ' + stepNumber + ' <i class="fas fa-eye ms-2"></i>');
        } else {
            // Future steps (locked)
            $(this).addClass('locked');
            $btn.addClass('disabled').html('<i class="fas fa-lock me-2"></i>Complete Previous Steps');
        }
    });
}

function completeStep(stepNumber) {
    if (!userProgress.completedSteps.includes(stepNumber)) {
        userProgress.completedSteps.push(stepNumber);
        userProgress.currentStep = Math.max(userProgress.currentStep, stepNumber + 1);
        saveUserProgress();
        updateProgressDisplay();
        
        // Show completion animation
        showStepCompletionAnimation(stepNumber);
    }
}

function showStepCompletionAnimation(stepNumber) {
    // Create celebration effect
    const $celebration = $('<div class="celebration-popup"><i class="fas fa-check-circle"></i><h4>Step ' + stepNumber + ' Completed!</h4><p>Great job! Moving to the next step.</p></div>');
    
    $('body').append($celebration);
    
    setTimeout(() => {
        $celebration.addClass('show');
    }, 100);
    
    setTimeout(() => {
        $celebration.removeClass('show');
        setTimeout(() => $celebration.remove(), 300);
    }, 3000);
}

// Dark Mode Functionality
function initDarkMode() {
    const darkModeToggle = $('#darkModeToggle');
    const savedTheme = localStorage.getItem('flint-theme') || 'light';
    
    // Set initial theme
    setTheme(savedTheme);
    darkModeToggle.prop('checked', savedTheme === 'dark');
    
    // Handle toggle
    darkModeToggle.on('change', function() {
        const newTheme = this.checked ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('flint-theme', newTheme);
    });
}

function setTheme(theme) {
    $('html').attr('data-theme', theme);
    
    // Update icon
    const icon = theme === 'dark' ? 'fa-sun' : 'fa-moon';
    $('#darkModeToggle').next('label').find('i').removeClass('fa-moon fa-sun').addClass(icon);
}

// Animation System
function initAnimations() {
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                $(entry.target).addClass('visible');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    $('.step-card, .resource-card, .support-card, .testimonial-card').each(function(index) {
        $(this).addClass('fade-in');
        
        // Add staggered delay
        setTimeout(() => {
            observer.observe(this);
        }, index * 100);
    });
    
    // Hero content animation
    $('.hero-content > *').each(function(index) {
        $(this).addClass('slide-in-left');
        setTimeout(() => {
            $(this).addClass('visible');
        }, index * 200 + 500);
    });
    
    $('.hero-image').addClass('slide-in-right');
    setTimeout(() => {
        $('.hero-image').addClass('visible');
    }, 800);
}

// Step Tracking for Navigation
function initStepTracking() {
    // Update active navigation based on current page
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    $('.navbar-nav .nav-link').removeClass('active');
    $(`.navbar-nav .nav-link[href="${currentPage}"]`).addClass('active');
    
    // Handle smooth scrolling for anchor links
    $('a[href^="#"]').on('click', function(e) {
        e.preventDefault();
        
        const target = $(this.getAttribute('href'));
        if (target.length) {
            const offsetTop = target.offset().top - 120;
            
            $('html, body').animate({
                scrollTop: offsetTop
            }, 800, 'easeInOutCubic');
        }
    });
}

// Floating Elements
function initFloatingElements() {
    // Floating FAQ button
    $('.floating-faq .btn').on('click', function() {
        // Add click analytics or other tracking here
        console.log('FAQ button clicked');
    });
    
    // Sticky progress tracker on scroll
    let lastScrollTop = 0;
    $(window).on('scroll', function() {
        const scrollTop = $(this).scrollTop();
        const progressTracker = $('.progress-tracker');
        
        if (scrollTop > 200) {
            progressTracker.addClass('sticky-visible');
        } else {
            progressTracker.removeClass('sticky-visible');
        }
        
        // Hide/show on scroll direction
        if (scrollTop > lastScrollTop && scrollTop > 300) {
            // Scrolling down
            progressTracker.addClass('hidden');
        } else {
            // Scrolling up
            progressTracker.removeClass('hidden');
        }
        
        lastScrollTop = scrollTop;
    });
}

// Modal Management
function initModals() {
    // Video modal - pause video when closed
    $('#videoModal').on('hidden.bs.modal', function() {
        const iframe = $(this).find('iframe');
        const src = iframe.attr('src');
        iframe.attr('src', '').attr('src', src);
    });
    
    // FAQ modal - track opened questions
    $('#faqAccordion .accordion-button').on('click', function() {
        const question = $(this).text().trim();
        console.log('FAQ opened:', question);
        
        // Analytics tracking would go here
        trackEvent('FAQ', 'Question Opened', question);
    });
}

// Carousel Management
function initCarousels() {
    // Auto-play testimonials carousel
    $('#testimonialsCarousel').carousel({
        interval: 5000,
        pause: 'hover'
    });
    
    // Handle carousel events
    $('#testimonialsCarousel').on('slide.bs.carousel', function(e) {
        console.log('Testimonial slide changed to:', e.to);
    });
}

// Local Storage Management
function saveUserProgress() {
    localStorage.setItem('flint-user-progress', JSON.stringify(userProgress));
}

function loadUserProgress() {
    const saved = localStorage.getItem('flint-user-progress');
    if (saved) {
        userProgress = { ...userProgress, ...JSON.parse(saved) };
        updateProgressDisplay();
    }
}

function resetProgress() {
    userProgress = {
        currentStep: 1,
        completedSteps: [],
        totalSteps: 7,
        overallProgress: 0
    };
    saveUserProgress();
    updateProgressDisplay();
}

// Utility Functions
function openChat() {
    // Integrate with your chat system
    console.log('Opening chat support...');
    
    // Example: Open external chat widget
    if (window.Intercom) {
        window.Intercom('show');
    } else if (window.Zendesk) {
        window.Zendesk('webWidget', 'open');
    } else {
        // Fallback to email
        window.location.href = 'mailto:directors@flint.com.au?subject=Support Request';
    }
}

function trackEvent(category, action, label) {
    // Analytics tracking
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            event_category: category,
            event_label: label
        });
    }
    
    console.log('Event tracked:', category, action, label);
}

// Form Validation and Submission
function validateForm(formSelector) {
    const $form = $(formSelector);
    let isValid = true;
    
    $form.find('[required]').each(function() {
        const $field = $(this);
        const value = $field.val().trim();
        
        if (!value) {
            showFieldError($field, 'This field is required');
            isValid = false;
        } else {
            clearFieldError($field);
        }
        
        // Email validation
        if ($field.attr('type') === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                showFieldError($field, 'Please enter a valid email address');
                isValid = false;
            }
        }
        
        // Phone validation
        if ($field.attr('type') === 'tel' && value) {
            const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
            if (!phoneRegex.test(value)) {
                showFieldError($field, 'Please enter a valid phone number');
                isValid = false;
            }
        }
    });
    
    return isValid;
}

function showFieldError($field, message) {
    $field.addClass('is-invalid');
    
    let $feedback = $field.siblings('.invalid-feedback');
    if ($feedback.length === 0) {
        $feedback = $('<div class="invalid-feedback"></div>');
        $field.after($feedback);
    }
    
    $feedback.text(message);
}

function clearFieldError($field) {
    $field.removeClass('is-invalid');
    $field.siblings('.invalid-feedback').remove();
}

// Loading States
function showLoading($element, text = 'Loading...') {
    const originalContent = $element.html();
    $element.data('original-content', originalContent);
    
    $element.html(`
        <span class="spinner-border spinner-border-sm me-2" role="status"></span>
        ${text}
    `).prop('disabled', true).addClass('loading');
}

function hideLoading($element) {
    const originalContent = $element.data('original-content');
    if (originalContent) {
        $element.html(originalContent);
    }
    $element.prop('disabled', false).removeClass('loading');
}

// Notification System
function showNotification(message, type = 'info', duration = 5000) {
    const notificationId = 'notification-' + Date.now();
    const typeClass = type === 'success' ? 'alert-success' : 
                     type === 'error' ? 'alert-danger' : 
                     type === 'warning' ? 'alert-warning' : 'alert-info';
    
    const $notification = $(`
        <div id="${notificationId}" class="alert ${typeClass} alert-dismissible fade show position-fixed" 
             style="top: 100px; right: 20px; z-index: 9999; min-width: 300px;">
            <div class="d-flex align-items-center">
                <i class="fas ${getNotificationIcon(type)} me-2"></i>
                <span>${message}</span>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `);
    
    $('body').append($notification);
    
    // Auto dismiss
    if (duration > 0) {
        setTimeout(() => {
            $notification.alert('close');
        }, duration);
    }
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        case 'warning': return 'fa-exclamation-triangle';
        default: return 'fa-info-circle';
    }
}

// API Integration Helper
async function apiRequest(url, options = {}) {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        },
    };
    
    const config = { ...defaultOptions, ...options };
    
    try {
        const response = await fetch(url, config);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API request failed:', error);
        showNotification('An error occurred. Please try again.', 'error');
        throw error;
    }
}

// Export functions for use in other scripts
window.FlintPortal = {
    completeStep,
    resetProgress,
    showNotification,
    trackEvent,
    validateForm,
    showLoading,
    hideLoading,
    openChat,
    apiRequest
};

// Custom easing function for smooth animations
$.easing.easeInOutCubic = function(x, t, b, c, d) {
    if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;
    return c / 2 * ((t -= 2) * t * t + 2) + b;
};

// Handle page visibility change (for analytics)
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        console.log('Page hidden');
    } else {
        console.log('Page visible');
    }
});

// Service Worker registration (for offline functionality)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('ServiceWorker registration successful');
            })
            .catch(function(err) {
                console.log('ServiceWorker registration failed');
            });
    });
}

// Performance monitoring
window.addEventListener('load', function() {
    // Wait a bit for everything to settle
    setTimeout(() => {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        console.log('Page load time:', loadTime + 'ms');
        
        // Track performance metrics
        trackEvent('Performance', 'Page Load Time', Math.round(loadTime / 1000) + 's');
    }, 1000);
});
