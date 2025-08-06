// ================================
// STEP 2: TOOLS & TECH STACK
// ================================

$(document).ready(function() {
    // Check authentication
    checkAuthentication();
    
    // Initialize step 2
    initializeStep2();
    
    // Load progress data
    loadStepProgress();
    
    // Initialize animations
    initializeStepAnimations();
    
    // Track step entry
    trackStepEntry(2);
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

function initializeStep2() {
    // Initialize tooltips and popovers
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Initialize tech card interactions
    initializeTechCards();
    
    // Initialize checklist functionality
    initializeChecklist();
    
    // Initialize integration diagram
    initializeIntegrationDiagram();
    
    // Auto-save progress periodically
    setInterval(saveProgress, 30000);
}

function loadStepProgress() {
    const user = checkAuthentication();
    if (!user) return;
    
    // Get step-specific progress
    let stepProgress = JSON.parse(localStorage.getItem('step2Progress') || '{}');
    
    if (!stepProgress[user.email]) {
        stepProgress[user.email] = {
            videosWatched: [],
            platformsAccessed: [],
            trainingsCompleted: [],
            checklistCompleted: [],
            lastActivity: new Date().toISOString(),
            completionPercentage: 0
        };
    }
    
    const userStepProgress = stepProgress[user.email];
    
    // Update UI based on progress
    updateProgressUI(userStepProgress);
    
    // Store current progress
    localStorage.setItem('step2Progress', JSON.stringify(stepProgress));
}

function updateProgressUI(progress) {
    // Mark completed videos
    progress.videosWatched.forEach(videoId => {
        $(`.tech-card[data-tool="${videoId}"]`).addClass('video-watched');
        $(`.tech-card[data-tool="${videoId}"] .watch-video-btn`).html('<i class="fas fa-check me-2"></i>Video Watched');
    });
    
    // Mark accessed platforms
    progress.platformsAccessed.forEach(platformId => {
        $(`.tech-card[data-tool="${platformId}"]`).addClass('platform-accessed');
    });
    
    // Mark completed trainings
    progress.trainingsCompleted.forEach(trainingId => {
        $(`.training-card[data-training="${trainingId}"]`).addClass('training-completed');
    });
    
    // Update checklist
    progress.checklistCompleted.forEach(taskId => {
        $(`#${taskId}`).prop('checked', true);
        $(`.checklist-item[data-task="${taskId.replace('task', '')}"]`).addClass('completed');
    });
    
    // Update completion percentage
    updateCompletionPercentage(progress);
}

function updateCompletionPercentage(progress) {
    const totalItems = 8; // 4 videos + 4 checklist items
    let completed = 0;
    
    completed += progress.videosWatched.length;
    completed += progress.checklistCompleted.length;
    
    const percentage = Math.round((completed / totalItems) * 100);
    progress.completionPercentage = percentage;
    
    // Update UI
    $('.step-completion-percentage').text(`${percentage}%`);
    
    if (percentage === 100) {
        $('.step-completion-badge i').removeClass('fa-cogs').addClass('fa-check-circle text-success');
        $('.completion-text .fw-bold').text('Completed').removeClass('text-primary').addClass('text-success');
    }
}

function initializeTechCards() {
    $('.tech-card').on('click', function() {
        const toolId = $(this).data('tool');
        
        // Add hover effect
        $(this).addClass('tech-card-active');
        
        // Track tool interaction
        trackEvent('tech_tool_viewed', {
            tool: toolId,
            step: 2,
            timestamp: new Date().toISOString()
        });
    });
    
    // Remove active state when clicking elsewhere
    $(document).on('click', function(e) {
        if (!$(e.target).closest('.tech-card').length) {
            $('.tech-card').removeClass('tech-card-active');
        }
    });
}

function initializeChecklist() {
    $('.checklist-item input[type="checkbox"]').on('change', function() {
        const taskId = $(this).attr('id');
        const user = checkAuthentication();
        
        if (!user) return;
        
        let stepProgress = JSON.parse(localStorage.getItem('step2Progress') || '{}');
        
        if ($(this).is(':checked')) {
            // Mark as completed
            $(this).closest('.checklist-item').addClass('completed');
            
            if (!stepProgress[user.email].checklistCompleted.includes(taskId)) {
                stepProgress[user.email].checklistCompleted.push(taskId);
            }
            
            // Show completion animation
            showTaskCompletedAnimation($(this).closest('.checklist-item'));
            
        } else {
            // Mark as incomplete
            $(this).closest('.checklist-item').removeClass('completed');
            
            const index = stepProgress[user.email].checklistCompleted.indexOf(taskId);
            if (index > -1) {
                stepProgress[user.email].checklistCompleted.splice(index, 1);
            }
        }
        
        localStorage.setItem('step2Progress', JSON.stringify(stepProgress));
        updateCompletionPercentage(stepProgress[user.email]);
        
        // Track task completion
        trackEvent('checklist_task_toggled', {
            task: taskId,
            completed: $(this).is(':checked'),
            step: 2,
            timestamp: new Date().toISOString()
        });
    });
}

function showTaskCompletedAnimation(taskElement) {
    // Add completion effect
    taskElement.addClass('task-completing');
    
    setTimeout(() => {
        taskElement.removeClass('task-completing').addClass('task-completed');
    }, 500);
    
    setTimeout(() => {
        taskElement.removeClass('task-completed');
    }, 2000);
}

function initializeIntegrationDiagram() {
    // Animate integration connections on scroll
    $(window).on('scroll', function() {
        if (isElementInViewport($('.integration-diagram'))) {
            animateIntegrationDiagram();
        }
    });
    
    // Click interactions for tool connections
    $('.tool-connection').on('click', function() {
        const toolId = $(this).data('tool');
        showToolIntegrationDetails(toolId);
    });
}

function animateIntegrationDiagram() {
    if ($('.integration-diagram').hasClass('animated')) return;
    
    $('.integration-diagram').addClass('animated');
    
    // Animate central hub first
    $('.central-hub').addClass('hub-animate');
    
    // Then animate tool connections with delay
    $('.tool-connection').each(function(index) {
        setTimeout(() => {
            $(this).addClass('connection-animate');
        }, (index + 1) * 300);
    });
}

function showToolIntegrationDetails(toolId) {
    const integrationDetails = {
        hubspot: {
            title: 'HubSpot Integration',
            description: 'HubSpot serves as your central CRM, connecting all customer interactions and data.',
            integrations: [
                'Lead data sync with BrokerEngine',
                'Email automation triggers from Middle',
                'Performance analytics in Flint Connect',
                'Automated follow-up sequences'
            ]
        },
        brokerengine: {
            title: 'BrokerEngine Integration',
            description: 'BrokerEngine handles all loan processing while maintaining data sync across platforms.',
            integrations: [
                'Customer data from HubSpot CRM',
                'Loan status updates to Middle',
                'Document sharing via Flint Connect',
                'Compliance reporting automation'
            ]
        },
        middle: {
            title: 'Middle Integration',
            description: 'Middle connects you to lender networks while maintaining seamless data flow.',
            integrations: [
                'Rate updates to HubSpot deals',
                'Application status to BrokerEngine',
                'Lender communications via Flint Connect',
                'Automated rate comparison reports'
            ]
        },
        flintconnect: {
            title: 'Flint Connect Integration',
            description: 'Flint Connect acts as your communication hub, centralizing all platform interactions.',
            integrations: [
                'Unified notifications from all platforms',
                'Team collaboration on deals',
                'Training content delivery',
                'Performance dashboard aggregation'
            ]
        }
    };
    
    const detail = integrationDetails[toolId];
    
    const modal = $(`
        <div class="modal fade" id="integrationModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h4 class="modal-title">${detail.title}</h4>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <p class="lead">${detail.description}</p>
                        
                        <h5 class="mt-4 mb-3">Key Integrations:</h5>
                        <ul class="list-group list-group-flush">
                            ${detail.integrations.map(integration => `
                                <li class="list-group-item border-0 px-0">
                                    <i class="fas fa-plug text-success me-2"></i>${integration}
                                </li>
                            `).join('')}
                        </ul>
                        
                        <div class="integration-flow mt-4 p-3 bg-light rounded">
                            <h6>Data Flow Example:</h6>
                            <p class="mb-0 small text-muted">
                                When a new lead enters HubSpot → Automatically creates client record in BrokerEngine → 
                                Triggers rate search in Middle → Updates team via Flint Connect notifications
                            </p>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary" onclick="downloadIntegrationGuide('${toolId}')">
                            Download Integration Guide
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `);
    
    $('body').append(modal);
    $('#integrationModal').modal('show');
    
    $('#integrationModal').on('hidden.bs.modal', function() {
        $(this).remove();
    });
}

function initializeStepAnimations() {
    // Animate tech cards on scroll
    $(window).on('scroll', function() {
        $('.tech-card, .training-card, .checklist-item').each(function() {
            if (isElementInViewport($(this))) {
                $(this).addClass('animate-on-scroll');
            }
        });
    });
    
    // Initial animations
    setTimeout(() => {
        $('.tech-card').each(function(index) {
            setTimeout(() => {
                $(this).addClass('animate-on-scroll');
            }, index * 200);
        });
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
    
    let stepProgress = JSON.parse(localStorage.getItem('step2Progress') || '{}');
    if (stepProgress[user.email]) {
        stepProgress[user.email].lastActivity = new Date().toISOString();
        localStorage.setItem('step2Progress', JSON.stringify(stepProgress));
    }
}

// ================================
// GLOBAL FUNCTIONS (called from HTML)
// ================================

function watchIntroVideo(toolId) {
    const videoUrls = {
        hubspot: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1',
        brokerengine: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1',
        middle: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1',
        flintconnect: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1'
    };
    
    const toolNames = {
        hubspot: 'HubSpot CRM',
        brokerengine: 'BrokerEngine',
        middle: 'Middle Platform',
        flintconnect: 'Flint Connect'
    };
    
    // Set video URL and title
    $('#videoFrame').attr('src', videoUrls[toolId]);
    $('#videoModalTitle').text(`${toolNames[toolId]} - Introduction Video`);
    
    // Show modal
    $('#videoModal').modal('show');
    
    // Track video watch
    trackVideoWatch(toolId);
    
    // Update progress
    const user = checkAuthentication();
    if (user) {
        let stepProgress = JSON.parse(localStorage.getItem('step2Progress') || '{}');
        if (!stepProgress[user.email].videosWatched.includes(toolId)) {
            stepProgress[user.email].videosWatched.push(toolId);
            localStorage.setItem('step2Progress', JSON.stringify(stepProgress));
            updateProgressUI(stepProgress[user.email]);
        }
    }
    
    // Clear video when modal is closed
    $('#videoModal').on('hidden.bs.modal', function() {
        $('#videoFrame').attr('src', '');
    });
}

function trackVideoWatch(toolId) {
    trackEvent('tool_video_watched', {
        tool: toolId,
        step: 2,
        timestamp: new Date().toISOString()
    });
}

function openExternalLink(url) {
    // Track platform access
    const toolId = url.includes('hubspot') ? 'hubspot' : 
                  url.includes('brokerengine') ? 'brokerengine' :
                  url.includes('middle') ? 'middle' : 'flintconnect';
    
    const user = checkAuthentication();
    if (user) {
        let stepProgress = JSON.parse(localStorage.getItem('step2Progress') || '{}');
        if (!stepProgress[user.email].platformsAccessed.includes(toolId)) {
            stepProgress[user.email].platformsAccessed.push(toolId);
            localStorage.setItem('step2Progress', JSON.stringify(stepProgress));
            updateProgressUI(stepProgress[user.email]);
        }
    }
    
    trackEvent('platform_accessed', {
        platform: toolId,
        url: url,
        step: 2,
        timestamp: new Date().toISOString()
    });
    
    // Show access instructions modal instead of direct link
    showPlatformAccessModal(toolId);
}

function showPlatformAccessModal(toolId) {
    const accessInfo = {
        hubspot: {
            title: 'Access HubSpot CRM',
            instructions: 'Your HubSpot account will be set up by our team. You\'ll receive login credentials via email within 24 hours.',
            tempUrl: 'https://app.hubspot.com',
            setupRequired: true
        },
        brokerengine: {
            title: 'Access BrokerEngine',
            instructions: 'BrokerEngine access requires license verification. Please complete Step 3 (Financial Setup) first.',
            tempUrl: 'https://brokerengine.com',
            setupRequired: true
        },
        middle: {
            title: 'Access Middle Platform',
            instructions: 'Your Middle account is being configured. You\'ll receive access once your broker profile is complete.',
            tempUrl: 'https://middle.com',
            setupRequired: true
        },
        flintconnect: {
            title: 'Access Flint Connect',
            instructions: 'Flint Connect is available immediately. Use your portal credentials to log in.',
            tempUrl: 'https://connect.flintgroup.com',
            setupRequired: false
        }
    };
    
    const info = accessInfo[toolId];
    
    const modal = $(`
        <div class="modal fade" id="accessModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${info.title}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="access-instructions">
                            <p>${info.instructions}</p>
                            ${info.setupRequired ? `
                                <div class="alert alert-info">
                                    <i class="fas fa-info-circle me-2"></i>
                                    <strong>Setup Required:</strong> This platform requires additional configuration before access.
                                </div>
                            ` : `
                                <div class="alert alert-success">
                                    <i class="fas fa-check-circle me-2"></i>
                                    <strong>Ready to Access:</strong> You can access this platform immediately.
                                </div>
                            `}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        ${!info.setupRequired ? `
                            <a href="${info.tempUrl}" target="_blank" class="btn btn-primary">
                                Access Platform <i class="fas fa-external-link-alt ms-1"></i>
                            </a>
                        ` : `
                            <button type="button" class="btn btn-outline-primary" onclick="requestEarlyAccess('${toolId}')">
                                Request Early Access
                            </button>
                        `}
                    </div>
                </div>
            </div>
        </div>
    `);
    
    $('body').append(modal);
    $('#accessModal').modal('show');
    
    $('#accessModal').on('hidden.bs.modal', function() {
        $(this).remove();
    });
}

function requestEarlyAccess(toolId) {
    trackEvent('early_access_requested', {
        tool: toolId,
        step: 2,
        timestamp: new Date().toISOString()
    });
    
    $('#accessModal').modal('hide');
    
    // Show success message
    const notification = $(`
        <div class="alert alert-success alert-dismissible fade show" style="position: fixed; top: 20px; right: 20px; z-index: 9999; max-width: 350px;">
            <i class="fas fa-check-circle me-2"></i>
            <strong>Request Submitted!</strong> Our team will expedite your ${toolId} access.
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `);
    
    $('body').append(notification);
    
    setTimeout(() => {
        notification.alert('close');
    }, 5000);
}

function accessTraining(trainingId) {
    const trainings = {
        'hubspot-basics': {
            title: 'HubSpot CRM Basics',
            duration: '45 minutes',
            level: 'Beginner',
            description: 'Learn the fundamentals of customer relationship management with HubSpot.',
            modules: [
                'Setting up your CRM dashboard',
                'Managing contacts and companies',
                'Creating and tracking deals',
                'Email automation basics',
                'Reporting and analytics'
            ],
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1'
        },
        'brokerengine-advanced': {
            title: 'BrokerEngine Advanced Features',
            duration: '1.5 hours',
            level: 'Advanced',
            description: 'Master advanced loan processing and compliance features.',
            modules: [
                'Advanced loan origination workflows',
                'Compliance automation setup',
                'Document management best practices',
                'Client portal configuration',
                'Integration with other platforms'
            ],
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1'
        },
        'middle-integration': {
            title: 'Middle Platform Integration',
            duration: '1 hour',
            level: 'Intermediate',
            description: 'Connect with lenders and automate your workflow.',
            modules: [
                'Lender network setup',
                'Automated rate comparison',
                'Application status tracking',
                'Integration with CRM systems',
                'Performance optimization'
            ],
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1'
        },
        'flint-connect-mastery': {
            title: 'Flint Connect Mastery',
            duration: '30 minutes',
            level: 'All Levels',
            description: 'Maximize productivity with our collaboration platform.',
            modules: [
                'Team communication features',
                'Resource library navigation',
                'Performance dashboard usage',
                'Training content access',
                'Support and help features'
            ],
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1'
        }
    };
    
    const training = trainings[trainingId];
    
    const modalContent = `
        <div class="training-overview">
            <div class="row">
                <div class="col-md-8">
                    <h5>${training.title}</h5>
                    <p>${training.description}</p>
                    
                    <h6>What you'll learn:</h6>
                    <ul class="training-modules">
                        ${training.modules.map(module => `<li>${module}</li>`).join('')}
                    </ul>
                </div>
                <div class="col-md-4">
                    <div class="training-meta bg-light p-3 rounded">
                        <div class="meta-item">
                            <i class="fas fa-clock text-primary"></i>
                            <span>Duration: ${training.duration}</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-signal text-primary"></i>
                            <span>Level: ${training.level}</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-certificate text-primary"></i>
                            <span>Certificate: Yes</span>
                        </div>
                    </div>
                    
                    <button class="btn btn-primary w-100 mt-3" onclick="startTraining('${trainingId}')">
                        Start Training
                    </button>
                </div>
            </div>
        </div>
    `;
    
    $('#trainingModalTitle').text(training.title);
    $('#trainingModalBody').html(modalContent);
    $('#trainingModal').modal('show');
    
    trackEvent('training_viewed', {
        training: trainingId,
        step: 2,
        timestamp: new Date().toISOString()
    });
}

function startTraining(trainingId) {
    $('#trainingModal').modal('hide');
    
    // In a real app, this would launch the actual training module
    // For demo, we'll show a video
    const trainings = {
        'hubspot-basics': 'HubSpot CRM Basics Training',
        'brokerengine-advanced': 'BrokerEngine Advanced Training',
        'middle-integration': 'Middle Integration Training',
        'flint-connect-mastery': 'Flint Connect Mastery Training'
    };
    
    $('#videoModalTitle').text(trainings[trainingId]);
    $('#videoFrame').attr('src', 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1');
    $('#videoModal').modal('show');
    
    // Track training start
    trackEvent('training_started', {
        training: trainingId,
        step: 2,
        timestamp: new Date().toISOString()
    });
    
    // Mark as completed (simplified for demo)
    const user = checkAuthentication();
    if (user) {
        let stepProgress = JSON.parse(localStorage.getItem('step2Progress') || '{}');
        if (!stepProgress[user.email].trainingsCompleted.includes(trainingId)) {
            stepProgress[user.email].trainingsCompleted.push(trainingId);
            localStorage.setItem('step2Progress', JSON.stringify(stepProgress));
        }
    }
    
    $('#videoModal').on('hidden.bs.modal', function() {
        $('#videoFrame').attr('src', '');
    });
}

function helpWithTask(taskId) {
    const helpContent = {
        'hubspot-profile': {
            title: 'HubSpot Profile Setup Help',
            steps: [
                'Log into your HubSpot account (credentials provided via email)',
                'Click on your profile picture in the top right corner',
                'Select "Profile & Preferences"',
                'Complete all required fields in the "About" section',
                'Upload a professional profile photo',
                'Save your changes'
            ],
            tips: 'A complete profile helps with team collaboration and client trust.'
        },
        'brokerengine-license': {
            title: 'Upload License Information',
            steps: [
                'Access BrokerEngine platform',
                'Navigate to "Settings" > "License Information"',
                'Upload a clear photo/scan of your broker license',
                'Enter license number and expiration date',
                'Add any required certifications',
                'Submit for verification'
            ],
            tips: 'Ensure your license is current and clearly readable in the upload.'
        },
        'middle-lenders': {
            title: 'Connect Preferred Lenders',
            steps: [
                'Log into Middle platform',
                'Go to "Lender Network" section',
                'Search for your preferred lenders',
                'Click "Connect" for each lender',
                'Complete any required integration forms',
                'Test connections with a sample rate request'
            ],
            tips: 'Start with 3-5 key lenders to avoid overwhelming your workflow.'
        },
        'flint-connect-team': {
            title: 'Join Your Regional Team',
            steps: [
                'Open Flint Connect platform',
                'Navigate to "Teams" section',
                'Find your regional team (based on location)',
                'Click "Join Team"',
                'Introduce yourself in the team chat',
                'Review shared resources and announcements'
            ],
            tips: 'Active participation in your regional team accelerates learning and success.'
        }
    };
    
    const help = helpContent[taskId];
    
    const modal = $(`
        <div class="modal fade" id="helpModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${help.title}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <h6>Step-by-step instructions:</h6>
                        <ol class="help-steps">
                            ${help.steps.map(step => `<li>${step}</li>`).join('')}
                        </ol>
                        
                        <div class="alert alert-info mt-3">
                            <i class="fas fa-lightbulb me-2"></i>
                            <strong>Pro Tip:</strong> ${help.tips}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-success" onclick="markTaskComplete('${taskId}')">
                            Mark as Complete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `);
    
    $('body').append(modal);
    $('#helpModal').modal('show');
    
    $('#helpModal').on('hidden.bs.modal', function() {
        $(this).remove();
    });
    
    trackEvent('help_accessed', {
        task: taskId,
        step: 2,
        timestamp: new Date().toISOString()
    });
}

function markTaskComplete(taskId) {
    // Find corresponding checkbox and check it
    const taskNumber = taskId.replace('hubspot-profile', '1')
                            .replace('brokerengine-license', '2')
                            .replace('middle-lenders', '3')
                            .replace('flint-connect-team', '4');
    
    $(`#task${taskNumber}`).prop('checked', true).trigger('change');
    
    $('#helpModal').modal('hide');
    
    // Show completion celebration
    const celebration = $(`
        <div class="alert alert-success alert-dismissible fade show" style="position: fixed; top: 20px; right: 20px; z-index: 9999; max-width: 350px;">
            <i class="fas fa-party-horn me-2"></i>
            <strong>Great job!</strong> Task completed successfully.
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `);
    
    $('body').append(celebration);
    
    setTimeout(() => {
        celebration.alert('close');
    }, 3000);
}

function downloadIntegrationGuide(toolId) {
    const filename = `${toolId}_Integration_Guide.pdf`;
    
    // Show download notification
    const notification = $(`
        <div class="alert alert-success alert-dismissible fade show" style="position: fixed; top: 20px; right: 20px; z-index: 9999; max-width: 300px;">
            <i class="fas fa-download me-2"></i>
            <strong>Download Started:</strong> ${filename}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `);
    
    $('body').append(notification);
    
    setTimeout(() => {
        notification.alert('close');
    }, 3000);
    
    trackEvent('integration_guide_downloaded', {
        tool: toolId,
        step: 2,
        timestamp: new Date().toISOString()
    });
    
    $('#integrationModal').modal('hide');
}

function nextStep() {
    // Check if minimum requirements are met
    const user = checkAuthentication();
    if (!user) return;
    
    const stepProgress = JSON.parse(localStorage.getItem('step2Progress') || '{}');
    const userProgress = stepProgress[user.email];
    
    if (!userProgress || userProgress.videosWatched.length < 2) {
        showRequirementsModal();
        return;
    }
    
    // Mark step as completed and move to next
    let progressData = JSON.parse(localStorage.getItem('flintProgress') || '{}');
    if (!progressData[user.email]) {
        progressData[user.email] = {
            currentStep: 3,
            completedSteps: [1, 2],
            stepData: {}
        };
    }
    
    if (!progressData[user.email].completedSteps.includes(2)) {
        progressData[user.email].completedSteps.push(2);
    }
    
    progressData[user.email].currentStep = 3;
    progressData[user.email].stepData[2] = {
        completed: true,
        completedAt: new Date().toISOString()
    };
    
    localStorage.setItem('flintProgress', JSON.stringify(progressData));
    
    // Track step completion
    trackEvent('step_completed', {
        step: 2,
        timestamp: new Date().toISOString()
    });
    
    // Navigate to next step
    window.location.href = 'step3.html';
}

function showRequirementsModal() {
    const modal = $(`
        <div class="modal fade" id="requirementsModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Complete Required Activities</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <p>To proceed to the next step, please complete these minimum requirements:</p>
                        <ul class="requirements-list">
                            <li><i class="fas fa-video text-primary me-2"></i>Watch at least 2 platform introduction videos</li>
                            <li><i class="fas fa-tasks text-primary me-2"></i>Complete at least 1 setup checklist item</li>
                        </ul>
                        <p class="text-muted">These activities ensure you have the foundation needed for the next step.</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Continue Learning</button>
                    </div>
                </div>
            </div>
        </div>
    `);
    
    $('body').append(modal);
    $('#requirementsModal').modal('show');
    
    $('#requirementsModal').on('hidden.bs.modal', function() {
        $(this).remove();
    });
}
