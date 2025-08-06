// ================================
// DASHBOARD PAGE JAVASCRIPT
// ================================

$(document).ready(function() {
    // Check authentication
    checkAuthentication();
    
    // Initialize dashboard
    initializeDashboard();
    
    // Load user data
    loadUserData();
    
    // Initialize animations
    initializeAnimations();
    
    // Initialize progress tracking
    initializeProgressTracking();
});

function checkAuthentication() {
    const userData = localStorage.getItem('flintUser') || sessionStorage.getItem('flintUser');
    
    if (!userData) {
        window.location.href = 'login.html';
        return;
    }
    
    const user = JSON.parse(userData);
    const loginTime = new Date(user.loginTime);
    const now = new Date();
    const hoursDiff = (now - loginTime) / (1000 * 60 * 60);
    
    // Check if session is expired
    if (user.remember && hoursDiff > 24) {
        localStorage.removeItem('flintUser');
        window.location.href = 'login.html';
        return;
    } else if (!user.remember && hoursDiff > 8) {
        sessionStorage.removeItem('flintUser');
        window.location.href = 'login.html';
        return;
    }
    
    return user;
}

function initializeDashboard() {
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Initialize popovers
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });
    
    // Handle responsive navigation
    handleResponsiveNav();
}

function loadUserData() {
    const userData = localStorage.getItem('flintUser') || sessionStorage.getItem('flintUser');
    if (userData) {
        const user = JSON.parse(userData);
        
        // Update welcome message
        $('.welcome-text').text(`Welcome back, ${user.name}`);
        
        // Update user avatar
        const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();
        $('.user-avatar').text(initials);
        
        // Load progress data
        loadProgressData(user);
    }
}

function loadProgressData(user) {
    // Get or initialize progress data
    let progressData = JSON.parse(localStorage.getItem('flintProgress') || '{}');
    
    if (!progressData[user.email]) {
        progressData[user.email] = {
            currentStep: 3,
            completedSteps: [1, 2],
            stepData: {
                1: { completed: true, completedAt: new Date().toISOString() },
                2: { completed: true, completedAt: new Date().toISOString() },
                3: { inProgress: true, startedAt: new Date().toISOString() }
            }
        };
        localStorage.setItem('flintProgress', JSON.stringify(progressData));
    }
    
    const userProgress = progressData[user.email];
    
    // Update progress bar
    const progressPercentage = Math.round((userProgress.completedSteps.length / 7) * 100);
    $('.progress-percentage').text(`${progressPercentage}% Complete`);
    $('.progress-bar').css('width', `${progressPercentage}%`);
    $('.progress-text').text(`${userProgress.completedSteps.length} of 7 steps completed`);
    
    // Update step cards
    updateStepCards(userProgress);
    
    // Update recent activity
    updateRecentActivity(userProgress);
}

function updateStepCards(userProgress) {
    $('.step-card').each(function(index) {
        const stepNumber = index + 1;
        const $card = $(this);
        
        $card.removeClass('completed in-progress locked');
        
        if (userProgress.completedSteps.includes(stepNumber)) {
            $card.addClass('completed');
            $card.find('.step-status').text('Completed');
            $card.find('.step-number').html('<i class="fas fa-check"></i>');
        } else if (stepNumber === userProgress.currentStep) {
            $card.addClass('in-progress');
            $card.find('.step-status').text('In Progress');
            $card.find('.step-number').text(stepNumber);
        } else if (stepNumber < userProgress.currentStep) {
            $card.addClass('completed');
            $card.find('.step-status').text('Completed');
            $card.find('.step-number').html('<i class="fas fa-check"></i>');
        } else {
            $card.addClass('locked');
            $card.find('.step-status').text('Locked');
            $card.find('.step-number').text(stepNumber);
        }
    });
}

function updateRecentActivity(userProgress) {
    const activities = [];
    
    // Add completion activities
    userProgress.completedSteps.forEach(stepNum => {
        const stepData = userProgress.stepData[stepNum];
        if (stepData && stepData.completedAt) {
            activities.push({
                type: 'completed',
                title: `Completed Step ${stepNum}`,
                description: getStepTitle(stepNum),
                time: stepData.completedAt,
                icon: 'fas fa-check'
            });
        }
    });
    
    // Add sample activities
    activities.push({
        type: 'download',
        title: 'Downloaded documents',
        description: 'Partnership Agreement, Tax Forms',
        time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        icon: 'fas fa-download'
    });
    
    activities.push({
        type: 'video',
        title: 'Watched welcome video',
        description: 'Introduction from Christian',
        time: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        icon: 'fas fa-play'
    });
    
    // Sort by time (most recent first)
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    
    // Update activity list
    const $activityList = $('.activity-list');
    $activityList.empty();
    
    activities.slice(0, 3).forEach(activity => {
        const timeAgo = getTimeAgo(activity.time);
        const activityHtml = `
            <div class="activity-item">
                <div class="activity-icon ${activity.type}">
                    <i class="${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <h5>${activity.title}</h5>
                    <p>${activity.description}</p>
                    <small class="text-muted">${timeAgo}</small>
                </div>
            </div>
        `;
        $activityList.append(activityHtml);
    });
}

function getStepTitle(stepNumber) {
    const titles = {
        1: 'Welcome & Introduction',
        2: 'Legal & Ownership Structure',
        3: 'Financial Setup & Revenue',
        4: 'Technology & Tools Training',
        5: 'Branding & Marketing Assets',
        6: 'Operations & Compliance',
        7: 'Launch Preparation'
    };
    return titles[stepNumber] || 'Unknown Step';
}

function getTimeAgo(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
        return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
        return 'Just now';
    }
}

function initializeAnimations() {
    // Animate step cards on scroll
    $(window).on('scroll', function() {
        $('.step-card').each(function() {
            if (isElementInViewport($(this))) {
                $(this).addClass('animate-on-scroll');
            }
        });
    });
    
    // Initial animation for visible elements
    $('.step-card').each(function(index) {
        setTimeout(() => {
            $(this).addClass('animate-on-scroll');
        }, index * 100);
    });
    
    // Animate progress bar
    setTimeout(() => {
        const targetWidth = $('.progress-bar').css('width');
        $('.progress-bar').css('width', '0').animate({
            width: targetWidth
        }, 1500, 'easeOutCubic');
    }, 500);
}

function isElementInViewport(el) {
    const rect = el[0].getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= $(window).height() &&
        rect.right <= $(window).width()
    );
}

function initializeProgressTracking() {
    // Track page views
    trackEvent('page_view', {
        page: 'dashboard',
        timestamp: new Date().toISOString()
    });
    
    // Track step card clicks
    $('.step-card').on('click', function() {
        const stepNumber = $(this).index() + 1;
        trackEvent('step_card_click', {
            step: stepNumber,
            timestamp: new Date().toISOString()
        });
    });
    
    // Track video plays
    $('.play-btn').on('click', function() {
        trackEvent('video_play', {
            video: 'welcome_video',
            timestamp: new Date().toISOString()
        });
    });
}

function trackEvent(eventName, eventData) {
    // Store analytics data locally (in a real app, this would send to analytics service)
    let analytics = JSON.parse(localStorage.getItem('flintAnalytics') || '[]');
    analytics.push({
        event: eventName,
        data: eventData,
        sessionId: getSessionId()
    });
    
    // Keep only last 100 events
    if (analytics.length > 100) {
        analytics = analytics.slice(-100);
    }
    
    localStorage.setItem('flintAnalytics', JSON.stringify(analytics));
}

function getSessionId() {
    let sessionId = sessionStorage.getItem('flintSessionId');
    if (!sessionId) {
        sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem('flintSessionId', sessionId);
    }
    return sessionId;
}

function handleResponsiveNav() {
    // Mobile navigation toggle
    if (window.innerWidth <= 768) {
        $('.navbar-nav').addClass('mobile-nav');
    }
    
    $(window).on('resize', function() {
        if (window.innerWidth <= 768) {
            $('.navbar-nav').addClass('mobile-nav');
        } else {
            $('.navbar-nav').removeClass('mobile-nav');
        }
    });
}

// ================================
// GLOBAL FUNCTIONS (called from HTML)
// ================================

function continueJourney() {
    const userData = localStorage.getItem('flintUser') || sessionStorage.getItem('flintUser');
    if (userData) {
        const user = JSON.parse(userData);
        const progressData = JSON.parse(localStorage.getItem('flintProgress') || '{}');
        const userProgress = progressData[user.email];
        
        if (userProgress) {
            openStep(userProgress.currentStep);
        } else {
            openStep(1);
        }
    }
}

function viewProgress() {
    // Scroll to progress section
    $('html, body').animate({
        scrollTop: $('.progress-section').offset().top - 100
    }, 800);
}

function openStep(stepNumber) {
    const userData = localStorage.getItem('flintUser') || sessionStorage.getItem('flintUser');
    if (!userData) {
        window.location.href = 'login.html';
        return;
    }
    
    const user = JSON.parse(userData);
    const progressData = JSON.parse(localStorage.getItem('flintProgress') || '{}');
    const userProgress = progressData[user.email];
    
    // Check if step is accessible
    if (stepNumber > userProgress.currentStep && !userProgress.completedSteps.includes(stepNumber)) {
        showStepLockedModal(stepNumber);
        return;
    }
    
    // Track step access
    trackEvent('step_access', {
        step: stepNumber,
        timestamp: new Date().toISOString()
    });
    
    // Navigate to step page
    window.location.href = `step${stepNumber}.html`;
}

function showStepLockedModal(stepNumber) {
    const modal = $(`
        <div class="modal fade" id="stepLockedModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Step Locked</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="text-center">
                            <i class="fas fa-lock text-muted mb-3" style="font-size: 48px;"></i>
                            <h4>Step ${stepNumber} is Currently Locked</h4>
                            <p class="text-muted">Please complete the previous steps to unlock this step.</p>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary" onclick="continueJourney()">Continue Current Step</button>
                    </div>
                </div>
            </div>
        </div>
    `);
    
    $('body').append(modal);
    $('#stepLockedModal').modal('show');
    
    $('#stepLockedModal').on('hidden.bs.modal', function() {
        $(this).remove();
    });
}

function playWelcomeVideo() {
    // Set video URL (replace with actual video URL)
    const videoUrl = 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1';
    $('#welcomeVideo').attr('src', videoUrl);
    
    // Show modal
    $('#videoModal').modal('show');
    
    // Track video play
    trackEvent('welcome_video_play', {
        timestamp: new Date().toISOString(),
        source: 'hero_section'
    });
    
    // Clear video when modal is closed
    $('#videoModal').on('hidden.bs.modal', function() {
        $('#welcomeVideo').attr('src', '');
    });
}

// ================================
// QUICK ACTIONS
// ================================

// Handle quick links
$(document).on('click', '.quick-link', function(e) {
    e.preventDefault();
    const linkText = $(this).find('span').text();
    
    switch(linkText) {
        case 'Slack Group':
            window.open('https://flintgroup.slack.com', '_blank');
            break;
        case 'FAQ':
            showFAQModal();
            break;
        case 'Support Contact':
            showSupportModal();
            break;
        case 'My Documents':
            showDocumentsModal();
            break;
    }
    
    trackEvent('quick_link_click', {
        link: linkText,
        timestamp: new Date().toISOString()
    });
});

function showFAQModal() {
    const modal = $(`
        <div class="modal fade" id="faqModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Frequently Asked Questions</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="accordion" id="faqAccordion">
                            <div class="accordion-item">
                                <h2 class="accordion-header">
                                    <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#faq1">
                                        How long does the onboarding process take?
                                    </button>
                                </h2>
                                <div id="faq1" class="accordion-collapse collapse show" data-bs-parent="#faqAccordion">
                                    <div class="accordion-body">
                                        The complete onboarding process typically takes 2-4 weeks, depending on how quickly you complete each step and gather required documents.
                                    </div>
                                </div>
                            </div>
                            <div class="accordion-item">
                                <h2 class="accordion-header">
                                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq2">
                                        What support is available during onboarding?
                                    </button>
                                </h2>
                                <div id="faq2" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                                    <div class="accordion-body">
                                        You'll have access to dedicated support via Slack, email, and phone. Plus, scheduled check-ins with your onboarding specialist.
                                    </div>
                                </div>
                            </div>
                            <div class="accordion-item">
                                <h2 class="accordion-header">
                                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq3">
                                        Can I complete steps out of order?
                                    </button>
                                </h2>
                                <div id="faq3" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                                    <div class="accordion-body">
                                        Steps are designed to be completed in order as each builds on the previous. However, you can review completed steps anytime.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `);
    
    $('body').append(modal);
    $('#faqModal').modal('show');
    
    $('#faqModal').on('hidden.bs.modal', function() {
        $(this).remove();
    });
}

function showSupportModal() {
    const modal = $(`
        <div class="modal fade" id="supportModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Contact Support</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-12 mb-3">
                                <div class="support-option">
                                    <i class="fab fa-slack text-primary fs-4 me-3"></i>
                                    <div>
                                        <h6>Slack Channel</h6>
                                        <p class="text-muted mb-0">Join our #directors-support channel for quick help</p>
                                        <button class="btn btn-outline-primary btn-sm mt-2" onclick="window.open('https://flintgroup.slack.com', '_blank')">Open Slack</button>
                                    </div>
                                </div>
                            </div>
                            <div class="col-12 mb-3">
                                <div class="support-option">
                                    <i class="fas fa-phone text-success fs-4 me-3"></i>
                                    <div>
                                        <h6>Phone Support</h6>
                                        <p class="text-muted mb-0">Call us directly for urgent matters</p>
                                        <a href="tel:+1234567890" class="btn btn-outline-success btn-sm mt-2">Call Now</a>
                                    </div>
                                </div>
                            </div>
                            <div class="col-12">
                                <div class="support-option">
                                    <i class="fas fa-envelope text-warning fs-4 me-3"></i>
                                    <div>
                                        <h6>Email Support</h6>
                                        <p class="text-muted mb-0">Send us detailed questions or feedback</p>
                                        <a href="mailto:support@flintgroup.com" class="btn btn-outline-warning btn-sm mt-2">Send Email</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `);
    
    $('body').append(modal);
    $('#supportModal').modal('show');
    
    $('#supportModal').on('hidden.bs.modal', function() {
        $(this).remove();
    });
}

function showDocumentsModal() {
    const modal = $(`
        <div class="modal fade" id="documentsModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">My Documents</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <div class="document-item">
                                    <i class="fas fa-file-pdf text-danger fs-4 me-3"></i>
                                    <div>
                                        <h6>Partnership Agreement</h6>
                                        <small class="text-muted">Downloaded 2 days ago</small>
                                        <br>
                                        <a href="#" class="btn btn-outline-primary btn-sm">Download</a>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6 mb-3">
                                <div class="document-item">
                                    <i class="fas fa-file-alt text-primary fs-4 me-3"></i>
                                    <div>
                                        <h6>Tax Forms</h6>
                                        <small class="text-muted">Downloaded 2 days ago</small>
                                        <br>
                                        <a href="#" class="btn btn-outline-primary btn-sm">Download</a>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6 mb-3">
                                <div class="document-item">
                                    <i class="fas fa-file-excel text-success fs-4 me-3"></i>
                                    <div>
                                        <h6>Financial Template</h6>
                                        <small class="text-muted">Available</small>
                                        <br>
                                        <a href="#" class="btn btn-outline-success btn-sm">Download</a>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6 mb-3">
                                <div class="document-item">
                                    <i class="fas fa-file-word text-info fs-4 me-3"></i>
                                    <div>
                                        <h6>Branding Guidelines</h6>
                                        <small class="text-muted">Coming soon</small>
                                        <br>
                                        <button class="btn btn-outline-secondary btn-sm" disabled>Locked</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `);
    
    $('body').append(modal);
    $('#documentsModal').modal('show');
    
    $('#documentsModal').on('hidden.bs.modal', function() {
        $(this).remove();
    });
}
