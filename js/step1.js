// ================================
// STEP 1: WELCOME & INTRODUCTION
// ================================

$(document).ready(function() {
    // Check authentication
    checkAuthentication();
    
    // Initialize step 1
    initializeStep1();
    
    // Load progress data
    loadStepProgress();
    
    // Initialize animations
    initializeStepAnimations();
    
    // Track step entry
    trackStepEntry(1);
});

function checkAuthentication() {
    const userData = localStorage.getItem('flintUser') || sessionStorage.getItem('flintUser');
    
    if (!userData) {
        window.location.href = 'login.html';
        return;
    }
    
    const user = JSON.parse(userData);
    
    // Update user info in navigation
    const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();
    $('.user-avatar').text(initials);
    
    return user;
}

function initializeStep1() {
    // Initialize tooltips and popovers
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Initialize value card interactions
    initializeValueCards();
    
    // Initialize download tracking
    initializeDownloadTracking();
    
    // Auto-save progress periodically
    setInterval(saveProgress, 30000); // Save every 30 seconds
}

function loadStepProgress() {
    const user = checkAuthentication();
    if (!user) return;
    
    // Get step-specific progress
    let stepProgress = JSON.parse(localStorage.getItem('step1Progress') || '{}');
    
    if (!stepProgress[user.email]) {
        stepProgress[user.email] = {
            videosWatched: [],
            documentsDownloaded: [],
            valuesViewed: [],
            platformsExplored: [],
            lastActivity: new Date().toISOString(),
            completionPercentage: 0
        };
    }
    
    const userStepProgress = stepProgress[user.email];
    
    // Update UI based on progress
    updateProgressUI(userStepProgress);
    
    // Store current progress
    localStorage.setItem('step1Progress', JSON.stringify(stepProgress));
}

function updateProgressUI(progress) {
    // Mark completed videos
    progress.videosWatched.forEach(videoId => {
        $(`.video-container[data-video="${videoId}"]`).addClass('watched');
        $(`.video-container[data-video="${videoId}"] .play-btn`).html('<i class="fas fa-check"></i>');
    });
    
    // Mark downloaded documents
    progress.documentsDownloaded.forEach(docId => {
        $(`.download-card[data-doc="${docId}"]`).addClass('downloaded');
        $(`.download-card[data-doc="${docId}"] .download-icon`).addClass('completed');
    });
    
    // Mark viewed values
    progress.valuesViewed.forEach(valueId => {
        $(`.value-card[data-value="${valueId}"]`).addClass('viewed');
    });
    
    // Mark explored platforms
    progress.platformsExplored.forEach(platformId => {
        $(`.platform-card[data-platform="${platformId}"]`).addClass('explored');
    });
    
    // Update completion percentage
    updateCompletionPercentage(progress);
}

function updateCompletionPercentage(progress) {
    const totalItems = 4; // videos, values, platforms, downloads
    let completed = 0;
    
    if (progress.videosWatched.length > 0) completed++;
    if (progress.valuesViewed.length >= 4) completed++;
    if (progress.platformsExplored.length >= 2) completed++;
    if (progress.documentsDownloaded.length >= 2) completed++;
    
    const percentage = Math.round((completed / totalItems) * 100);
    progress.completionPercentage = percentage;
    
    // Update UI
    $('.step-completion-percentage').text(`${percentage}%`);
    
    if (percentage === 100) {
        $('.step-completion-badge i').removeClass('fa-play-circle').addClass('fa-check-circle text-success');
        $('.completion-text .fw-bold').text('Completed').removeClass('text-primary').addClass('text-success');
    }
}

function initializeValueCards() {
    $('.value-card').on('click', function() {
        const valueId = $(this).data('value');
        const user = checkAuthentication();
        
        if (!user) return;
        
        // Mark as viewed
        $(this).addClass('viewed');
        
        // Update progress
        let stepProgress = JSON.parse(localStorage.getItem('step1Progress') || '{}');
        if (!stepProgress[user.email].valuesViewed.includes(valueId)) {
            stepProgress[user.email].valuesViewed.push(valueId);
            localStorage.setItem('step1Progress', JSON.stringify(stepProgress));
        }
        
        // Show detailed value modal
        showValueDetail(valueId);
        
        // Track interaction
        trackEvent('value_card_clicked', {
            value: valueId,
            step: 1,
            timestamp: new Date().toISOString()
        });
    });
}

function showValueDetail(valueId) {
    const valueDetails = {
        integrity: {
            title: 'Integrity',
            icon: 'fas fa-shield-alt',
            description: 'Integrity is the cornerstone of everything we do at Flint. We believe that trust is earned through consistent, transparent, and ethical behavior.',
            examples: [
                'Clear communication about fees and processes',
                'Honest assessment of loan options',
                'Transparent business practices',
                'Ethical decision-making in all situations'
            ],
            quote: '"Integrity is doing the right thing, even when no one is watching." - C.S. Lewis'
        },
        innovation: {
            title: 'Innovation',
            icon: 'fas fa-lightbulb',
            description: 'We constantly evolve our technology and processes to stay ahead of industry changes and provide the best possible experience.',
            examples: [
                'Cutting-edge technology platforms',
                'Automated workflow processes',
                'AI-powered customer insights',
                'Continuous platform improvements'
            ],
            quote: '"Innovation distinguishes between a leader and a follower." - Steve Jobs'
        },
        partnership: {
            title: 'Partnership',
            icon: 'fas fa-handshake',
            description: 'Your success is our success. We\'re here to support your growth, not compete with you.',
            examples: [
                'Collaborative business approach',
                'Shared success metrics',
                'Ongoing support and training',
                'Mutual growth opportunities'
            ],
            quote: '"Alone we can do so little; together we can do so much." - Helen Keller'
        },
        excellence: {
            title: 'Excellence',
            icon: 'fas fa-star',
            description: 'We strive for the highest standards in everything we deliver to our partners and clients.',
            examples: [
                'Best-in-class technology solutions',
                'Superior customer service',
                'High-quality training programs',
                'Continuous improvement mindset'
            ],
            quote: '"Excellence is never an accident. It is always the result of high intention." - Aristotle'
        }
    };
    
    const detail = valueDetails[valueId];
    
    const modal = $(`
        <div class="modal fade" id="valueDetailModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <div class="d-flex align-items-center">
                            <i class="${detail.icon} fs-3 me-3"></i>
                            <h4 class="modal-title">${detail.title}</h4>
                        </div>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <p class="lead">${detail.description}</p>
                        
                        <h5 class="mt-4 mb-3">How we demonstrate ${detail.title}:</h5>
                        <ul class="list-group list-group-flush">
                            ${detail.examples.map(example => `
                                <li class="list-group-item border-0 px-0">
                                    <i class="fas fa-check text-success me-2"></i>${example}
                                </li>
                            `).join('')}
                        </ul>
                        
                        <div class="quote-section mt-4 p-3 bg-light rounded">
                            <blockquote class="blockquote text-center mb-0">
                                <p class="mb-0 fst-italic">${detail.quote}</p>
                            </blockquote>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary" onclick="downloadValueGuide('${valueId}')">
                            Download ${detail.title} Guide
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `);
    
    $('body').append(modal);
    $('#valueDetailModal').modal('show');
    
    $('#valueDetailModal').on('hidden.bs.modal', function() {
        $(this).remove();
    });
}

function initializeDownloadTracking() {
    $('.download-card').on('click', function() {
        const docId = $(this).attr('onclick').match(/'([^']+)'/)[1];
        trackDownload(docId);
    });
}

function initializeStepAnimations() {
    // Animate elements on scroll
    $(window).on('scroll', function() {
        $('.value-card, .platform-card, .download-card').each(function() {
            if (isElementInViewport($(this))) {
                $(this).addClass('animate-on-scroll');
            }
        });
    });
    
    // Initial animations
    setTimeout(() => {
        $('.value-card').each(function(index) {
            setTimeout(() => {
                $(this).addClass('animate-on-scroll');
            }, index * 200);
        });
    }, 500);
    
    // Animate platform cards
    setTimeout(() => {
        $('.platform-card').each(function(index) {
            setTimeout(() => {
                $(this).addClass('animate-on-scroll');
            }, index * 300);
        });
    }, 1000);
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

function trackStepEntry(stepNumber) {
    trackEvent('step_entered', {
        step: stepNumber,
        timestamp: new Date().toISOString(),
        referrer: document.referrer
    });
}

function trackEvent(eventName, eventData) {
    let analytics = JSON.parse(localStorage.getItem('flintAnalytics') || '[]');
    analytics.push({
        event: eventName,
        data: eventData,
        sessionId: getSessionId(),
        userId: getUserId()
    });
    
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

function getUserId() {
    const userData = localStorage.getItem('flintUser') || sessionStorage.getItem('flintUser');
    if (userData) {
        return JSON.parse(userData).email;
    }
    return 'anonymous';
}

function saveProgress() {
    const user = checkAuthentication();
    if (!user) return;
    
    let stepProgress = JSON.parse(localStorage.getItem('step1Progress') || '{}');
    if (stepProgress[user.email]) {
        stepProgress[user.email].lastActivity = new Date().toISOString();
        localStorage.setItem('step1Progress', JSON.stringify(stepProgress));
    }
}

// ================================
// GLOBAL FUNCTIONS (called from HTML)
// ================================

function playWelcomeVideo() {
    // Set video URL (replace with actual video)
    const videoUrl = 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&controls=1&modestbranding=1';
    $('#welcomeVideoFrame').attr('src', videoUrl);
    
    // Show modal
    $('#videoModal').modal('show');
    
    // Track video play
    trackVideoWatch('welcome_video');
    
    // Update progress
    const user = checkAuthentication();
    if (user) {
        let stepProgress = JSON.parse(localStorage.getItem('step1Progress') || '{}');
        if (!stepProgress[user.email].videosWatched.includes('welcome_video')) {
            stepProgress[user.email].videosWatched.push('welcome_video');
            localStorage.setItem('step1Progress', JSON.stringify(stepProgress));
            updateProgressUI(stepProgress[user.email]);
        }
    }
    
    // Clear video when modal is closed
    $('#videoModal').on('hidden.bs.modal', function() {
        $('#welcomeVideoFrame').attr('src', '');
    });
}

function trackVideoWatch(videoId) {
    trackEvent('video_watched', {
        video: videoId,
        step: 1,
        timestamp: new Date().toISOString()
    });
}

function learnMorePlatform(platformType) {
    const user = checkAuthentication();
    if (user) {
        let stepProgress = JSON.parse(localStorage.getItem('step1Progress') || '{}');
        if (!stepProgress[user.email].platformsExplored.includes(platformType)) {
            stepProgress[user.email].platformsExplored.push(platformType);
            localStorage.setItem('step1Progress', JSON.stringify(stepProgress));
            updateProgressUI(stepProgress[user.email]);
        }
    }
    
    const platformDetails = {
        engine: {
            title: 'FlintEngine Platform',
            description: 'Our comprehensive technology platform that powers the entire mortgage process from lead to settlement.',
            features: [
                {
                    title: 'Advanced CRM System',
                    description: 'Manage all your leads and customers in one centralized platform',
                    icon: 'fas fa-users'
                },
                {
                    title: 'Automated Workflows',
                    description: 'Streamline repetitive tasks with intelligent automation',
                    icon: 'fas fa-robot'
                },
                {
                    title: 'Document Management',
                    description: 'Secure, organized storage and sharing of all loan documents',
                    icon: 'fas fa-file-alt'
                },
                {
                    title: 'Compliance Tracking',
                    description: 'Stay compliant with automatic regulatory updates and monitoring',
                    icon: 'fas fa-shield-alt'
                },
                {
                    title: 'Analytics & Reporting',
                    description: 'Gain insights with comprehensive analytics and custom reports',
                    icon: 'fas fa-chart-line'
                }
            ],
            benefits: [
                'Increase efficiency by up to 40%',
                'Reduce processing time by 50%',
                'Improve customer satisfaction scores',
                'Ensure 100% compliance adherence'
            ]
        },
        media: {
            title: 'FlintMedia Platform',
            description: 'Our marketing and lead generation platform that helps you build your brand and attract quality leads.',
            features: [
                {
                    title: 'Digital Marketing Tools',
                    description: 'Complete suite of digital marketing tools and templates',
                    icon: 'fas fa-bullhorn'
                },
                {
                    title: 'Lead Generation',
                    description: 'Advanced lead generation and nurturing capabilities',
                    icon: 'fas fa-magnet'
                },
                {
                    title: 'Brand Management',
                    description: 'Consistent brand management across all channels',
                    icon: 'fas fa-palette'
                },
                {
                    title: 'Content Creation',
                    description: 'AI-powered content creation and scheduling tools',
                    icon: 'fas fa-edit'
                },
                {
                    title: 'Social Media Integration',
                    description: 'Seamless integration with all major social media platforms',
                    icon: 'fas fa-share-alt'
                }
            ],
            benefits: [
                'Generate 3x more qualified leads',
                'Reduce marketing costs by 35%',
                'Increase brand awareness by 60%',
                'Improve conversion rates by 25%'
            ]
        }
    };
    
    const platform = platformDetails[platformType];
    
    const modalContent = `
        <div class="modal fade" id="platformModal" tabindex="-1">
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h4 class="modal-title">${platform.title}</h4>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-lg-8">
                                <p class="lead">${platform.description}</p>
                                
                                <h5 class="mt-4 mb-3">Key Features:</h5>
                                <div class="row">
                                    ${platform.features.map(feature => `
                                        <div class="col-md-6 mb-3">
                                            <div class="feature-detail">
                                                <div class="feature-icon mb-2">
                                                    <i class="${feature.icon} text-primary fs-4"></i>
                                                </div>
                                                <h6>${feature.title}</h6>
                                                <p class="text-muted small">${feature.description}</p>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                            <div class="col-lg-4">
                                <div class="benefits-card bg-light p-3 rounded">
                                    <h5>Key Benefits:</h5>
                                    <ul class="list-unstyled">
                                        ${platform.benefits.map(benefit => `
                                            <li class="mb-2">
                                                <i class="fas fa-check text-success me-2"></i>${benefit}
                                            </li>
                                        `).join('')}
                                    </ul>
                                </div>
                                
                                <div class="demo-section mt-3">
                                    <h6>Want to see it in action?</h6>
                                    <button class="btn btn-outline-primary w-100 mb-2" onclick="schedulePlatformDemo('${platformType}')">
                                        Schedule Demo
                                    </button>
                                    <button class="btn btn-outline-secondary w-100" onclick="downloadPlatformGuide('${platformType}')">
                                        Download Guide
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    $('body').append(modalContent);
    $('#platformModal').modal('show');
    
    $('#platformModal').on('hidden.bs.modal', function() {
        $(this).remove();
    });
    
    trackEvent('platform_explored', {
        platform: platformType,
        step: 1,
        timestamp: new Date().toISOString()
    });
}

function downloadDocument(docId) {
    const user = checkAuthentication();
    if (!user) return;
    
    // Track download
    trackEvent('document_downloaded', {
        document: docId,
        step: 1,
        timestamp: new Date().toISOString()
    });
    
    // Update progress
    let stepProgress = JSON.parse(localStorage.getItem('step1Progress') || '{}');
    if (!stepProgress[user.email].documentsDownloaded.includes(docId)) {
        stepProgress[user.email].documentsDownloaded.push(docId);
        localStorage.setItem('step1Progress', JSON.stringify(stepProgress));
        updateProgressUI(stepProgress[user.email]);
    }
    
    // Simulate download
    const docNames = {
        'welcome-kit': 'Flint_Welcome_Kit.pdf',
        'company-overview': 'Flint_Company_Overview.pdf',
        'directors-handbook': 'Flint_Directors_Handbook.pdf',
        'contact-list': 'Flint_Contact_Directory.pdf'
    };
    
    const filename = docNames[docId] || 'Flint_Document.pdf';
    
    // Show download notification
    showDownloadNotification(filename);
    
    // In a real app, this would trigger actual download
    console.log(`Downloading: ${filename}`);
}

function showDownloadNotification(filename) {
    const notification = $(`
        <div class="alert alert-success alert-dismissible fade show download-notification" role="alert">
            <i class="fas fa-download me-2"></i>
            <strong>Download Started:</strong> ${filename}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `);
    
    $('body').append(notification);
    
    // Position notification
    notification.css({
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        maxWidth: '300px'
    });
    
    // Auto-dismiss after 3 seconds
    setTimeout(() => {
        notification.alert('close');
    }, 3000);
}

function nextStep() {
    // Mark step as completed
    const user = checkAuthentication();
    if (user) {
        // Update overall progress
        let progressData = JSON.parse(localStorage.getItem('flintProgress') || '{}');
        if (!progressData[user.email]) {
            progressData[user.email] = {
                currentStep: 2,
                completedSteps: [1],
                stepData: {}
            };
        }
        
        if (!progressData[user.email].completedSteps.includes(1)) {
            progressData[user.email].completedSteps.push(1);
        }
        
        progressData[user.email].currentStep = 2;
        progressData[user.email].stepData[1] = {
            completed: true,
            completedAt: new Date().toISOString()
        };
        
        localStorage.setItem('flintProgress', JSON.stringify(progressData));
        
        // Track step completion
        trackEvent('step_completed', {
            step: 1,
            timestamp: new Date().toISOString()
        });
        
        // Navigate to next step
        window.location.href = 'step2.html';
    }
}

function schedulePlatformDemo(platformType) {
    trackEvent('demo_requested', {
        platform: platformType,
        step: 1,
        timestamp: new Date().toISOString()
    });
    
    alert(`Demo request for ${platformType} platform has been submitted. Our team will contact you within 24 hours to schedule.`);
}

function downloadPlatformGuide(platformType) {
    const guideNames = {
        engine: 'FlintEngine_Platform_Guide.pdf',
        media: 'FlintMedia_Platform_Guide.pdf'
    };
    
    const filename = guideNames[platformType];
    showDownloadNotification(filename);
    
    trackEvent('platform_guide_downloaded', {
        platform: platformType,
        step: 1,
        timestamp: new Date().toISOString()
    });
}

function downloadValueGuide(valueId) {
    const filename = `Flint_${valueId.charAt(0).toUpperCase() + valueId.slice(1)}_Guide.pdf`;
    showDownloadNotification(filename);
    
    trackEvent('value_guide_downloaded', {
        value: valueId,
        step: 1,
        timestamp: new Date().toISOString()
    });
    
    $('#valueDetailModal').modal('hide');
}
