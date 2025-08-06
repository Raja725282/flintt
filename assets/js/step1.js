// Step 1 Specific JavaScript

$(document).ready(function() {
    initStep1();
});

function initStep1() {
    initStepRequirements();
    initVideoTracking();
    initDownloads();
    initStepCompletion();
    
    console.log('Step 1 initialized');
}

// Track completion requirements
let step1Requirements = {
    video: false,
    values: false,
    platforms: false,
    downloads: false
};

function initStepRequirements() {
    // Load saved progress
    const saved = localStorage.getItem('step1-requirements');
    if (saved) {
        step1Requirements = { ...step1Requirements, ...JSON.parse(saved) };
        updateCheckboxes();
    }

    // Handle checkbox changes
    $('.completion-checklist input[type="checkbox"]').on('change', function() {
        const requirement = $(this).closest('.check-item').data('requirement');
        step1Requirements[requirement] = this.checked;
        
        saveStep1Progress();
        updateCompleteButton();
        
        FlintPortal.trackEvent('Step1', 'Requirement Toggle', requirement + ':' + this.checked);
    });

    updateCompleteButton();
}

function updateCheckboxes() {
    Object.keys(step1Requirements).forEach(requirement => {
        $(`.check-item[data-requirement="${requirement}"] input`).prop('checked', step1Requirements[requirement]);
    });
}

function saveStep1Progress() {
    localStorage.setItem('step1-requirements', JSON.stringify(step1Requirements));
}

function updateCompleteButton() {
    const allComplete = Object.values(step1Requirements).every(req => req === true);
    const $btn = $('#completeStepBtn');
    
    if (allComplete) {
        $btn.prop('disabled', false).removeClass('btn-secondary').addClass('btn-success');
    } else {
        $btn.prop('disabled', true).removeClass('btn-success').addClass('btn-secondary');
    }
}

// Video tracking
function initVideoTracking() {
    let videoWatched = false;
    let videoStartTime = null;
    
    $('#welcomeVideoModal').on('shown.bs.modal', function() {
        videoStartTime = Date.now();
        FlintPortal.trackEvent('Step1', 'Video Started', 'Welcome Video');
    });

    $('#welcomeVideoModal').on('hidden.bs.modal', function() {
        if (videoStartTime) {
            const watchTime = Date.now() - videoStartTime;
            
            // Consider video watched if they watched for more than 2 minutes
            if (watchTime > 120000) {
                videoWatched = true;
                step1Requirements.video = true;
                $('.check-item[data-requirement="video"] input').prop('checked', true);
                saveStep1Progress();
                updateCompleteButton();
                
                FlintPortal.showNotification('Great! You\'ve watched the welcome video.', 'success');
                FlintPortal.trackEvent('Step1', 'Video Completed', 'Welcome Video');
            }
        }
        
        // Pause video
        const iframe = $(this).find('iframe');
        const src = iframe.attr('src');
        iframe.attr('src', '').attr('src', src);
    });
}

// Download tracking
function initDownloads() {
    window.downloadFile = function(filename) {
        FlintPortal.trackEvent('Step1', 'File Downloaded', filename);
        
        // Mark downloads requirement as complete after first download
        step1Requirements.downloads = true;
        $('.check-item[data-requirement="downloads"] input').prop('checked', true);
        saveStep1Progress();
        updateCompleteButton();
        
        // Simulate download (replace with actual download logic)
        const link = document.createElement('a');
        link.href = `assets/downloads/${filename}`;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        FlintPortal.showNotification(`Downloaded ${filename}`, 'success');
    };
}

// Step completion
function initStepCompletion() {
    $('#completeStepBtn').on('click', function() {
        if (Object.values(step1Requirements).every(req => req === true)) {
            completeStep1();
        }
    });
}

function completeStep1() {
    const $btn = $('#completeStepBtn');
    FlintPortal.showLoading($btn, 'Completing Step 1...');
    
    // Simulate API call
    setTimeout(() => {
        FlintPortal.hideLoading($btn);
        FlintPortal.completeStep(1);
        
        // Show success message
        FlintPortal.showNotification('Congratulations! Step 1 completed successfully.', 'success');
        
        // Update button
        $btn.html('<i class="fas fa-check me-2"></i>Completed').removeClass('btn-success').addClass('btn-outline-success').prop('disabled', true);
        
        // Enable next step button
        $('#nextStepBtn').removeClass('disabled');
        
        // Track completion
        FlintPortal.trackEvent('Step1', 'Step Completed', 'Welcome & Introduction');
        
        // Auto-advance after a delay
        setTimeout(() => {
            if (confirm('Step 1 is complete! Would you like to proceed to Step 2: Legal & Compliance?')) {
                window.location.href = 'step2.html';
            }
        }, 2000);
        
    }, 1500);
}

// Scroll animations for step-specific elements
$(window).on('scroll', function() {
    $('.mission-card, .vision-card, .value-card, .platform-card').each(function() {
        const elementTop = $(this).offset().top;
        const elementBottom = elementTop + $(this).outerHeight();
        const viewportTop = $(window).scrollTop();
        const viewportBottom = viewportTop + $(window).height();
        
        if (elementBottom > viewportTop && elementTop < viewportBottom) {
            $(this).addClass('in-view');
        }
    });
});

// Platform comparison interaction
$('.platform-card').on('click', function() {
    $(this).addClass('selected');
    $(this).siblings('.platform-card').removeClass('selected');
    
    const platform = $(this).find('h3').text();
    FlintPortal.trackEvent('Step1', 'Platform Explored', platform);
});

// Values interaction
$('.value-card').on('click', function() {
    $(this).toggleClass('expanded');
    
    const value = $(this).find('h4').text();
    FlintPortal.trackEvent('Step1', 'Value Explored', value);
});

// Auto-mark requirements based on interactions
$(document).on('scroll', function() {
    // Mark values as read when scrolled past values section
    const valuesSection = $('.flint-values');
    if (valuesSection.length && $(window).scrollTop() > valuesSection.offset().top + valuesSection.height() / 2) {
        if (!step1Requirements.values) {
            step1Requirements.values = true;
            $('.check-item[data-requirement="values"] input').prop('checked', true);
            saveStep1Progress();
            updateCompleteButton();
        }
    }
    
    // Mark platforms as understood when scrolled past platforms section
    const platformsSection = $('.flint-platforms');
    if (platformsSection.length && $(window).scrollTop() > platformsSection.offset().top + platformsSection.height() / 2) {
        if (!step1Requirements.platforms) {
            step1Requirements.platforms = true;
            $('.check-item[data-requirement="platforms"] input').prop('checked', true);
            saveStep1Progress();
            updateCompleteButton();
        }
    }
});

// Directors model interaction
$('.model-step').on('click', function() {
    $(this).addClass('highlighted');
    setTimeout(() => {
        $(this).removeClass('highlighted');
    }, 2000);
    
    const stepNumber = $(this).find('.step-number').text();
    FlintPortal.trackEvent('Step1', 'Model Step Explored', 'Step ' + stepNumber);
});

// Integration flow animation
let integrationAnimationPlayed = false;
$(window).on('scroll', function() {
    const integrationFlow = $('.integration-flow');
    if (integrationFlow.length && !integrationAnimationPlayed) {
        const elementTop = integrationFlow.offset().top;
        const viewportBottom = $(window).scrollTop() + $(window).height();
        
        if (viewportBottom > elementTop) {
            integrationAnimationPlayed = true;
            animateIntegrationFlow();
        }
    }
});

function animateIntegrationFlow() {
    const steps = $('.integration-flow .flow-step');
    const arrows = $('.integration-flow .fa-arrow-right');
    
    steps.each(function(index) {
        setTimeout(() => {
            $(this).addClass('animate-in');
            
            if (index < arrows.length) {
                setTimeout(() => {
                    $(arrows[index]).addClass('animate-in');
                }, 200);
            }
        }, index * 400);
    });
}

// Benefit items hover effect
$('.benefit-item').on('mouseenter', function() {
    $(this).addClass('hover-effect');
}).on('mouseleave', function() {
    $(this).removeClass('hover-effect');
});

// Download card hover analytics
$('.download-card').on('mouseenter', function() {
    const title = $(this).find('h4').text();
    FlintPortal.trackEvent('Step1', 'Resource Hovered', title);
});

// Play button animation
$('.play-button').on('click', function() {
    $(this).addClass('clicked');
    setTimeout(() => {
        $(this).removeClass('clicked');
    }, 300);
});

// Initialize tooltips for any data-bs-toggle="tooltip" elements
if (typeof bootstrap !== 'undefined') {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// Page exit tracking
window.addEventListener('beforeunload', function() {
    FlintPortal.trackEvent('Step1', 'Page Exit', 'Time on page: ' + Math.round((Date.now() - performance.timing.navigationStart) / 1000) + 's');
});

// Add custom CSS for step-specific animations
const step1CSS = `
<style>
.mission-card, .vision-card {
    transition: all 0.6s ease;
    transform: translateY(30px);
    opacity: 0;
}

.mission-card.in-view, .vision-card.in-view {
    transform: translateY(0);
    opacity: 1;
}

.value-card {
    transition: all 0.3s ease;
    cursor: pointer;
}

.value-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 30px rgba(77, 0, 50, 0.15);
}

.value-card.expanded {
    background: var(--mint-tint);
    transform: scale(1.02);
}

.platform-card {
    transition: all 0.3s ease;
    cursor: pointer;
}

.platform-card.selected {
    border: 2px solid var(--primary-burgundy);
    transform: scale(1.02);
}

.model-step {
    transition: all 0.3s ease;
    cursor: pointer;
}

.model-step.highlighted {
    background: var(--cornflower-tint);
    transform: translateX(10px);
}

.integration-flow .flow-step {
    transition: all 0.6s ease;
    transform: translateY(20px);
    opacity: 0;
}

.integration-flow .flow-step.animate-in {
    transform: translateY(0);
    opacity: 1;
}

.integration-flow .fa-arrow-right {
    transition: all 0.6s ease;
    transform: scale(0);
    opacity: 0;
}

.integration-flow .fa-arrow-right.animate-in {
    transform: scale(1);
    opacity: 1;
}

.play-button {
    transition: all 0.3s ease;
}

.play-button.clicked {
    transform: scale(0.95);
}

.benefit-item {
    transition: all 0.3s ease;
}

.benefit-item.hover-effect {
    background: var(--mint-tint);
    transform: translateX(5px);
}

.download-card {
    transition: all 0.3s ease;
}

.download-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(77, 0, 50, 0.15);
}

.celebration-popup {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0);
    background: white;
    padding: 2rem;
    border-radius: 1rem;
    box-shadow: 0 20px 50px rgba(0,0,0,0.3);
    z-index: 9999;
    text-align: center;
    transition: all 0.3s ease;
    opacity: 0;
}

.celebration-popup.show {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
}

.celebration-popup i {
    font-size: 3rem;
    color: var(--primary-burgundy);
    margin-bottom: 1rem;
}

.step-indicator {
    display: flex;
    align-items: center;
    gap: 1rem;
    justify-content: center;
}

.step-indicator .step-number {
    width: 40px;
    height: 40px;
    background: var(--primary-burgundy);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
}

.step-hero {
    padding-top: 150px;
    background: linear-gradient(135deg, var(--white) 0%, var(--cornflower-tint) 100%);
}

.welcome-video-container {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-top: 2rem;
    padding: 1.5rem;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 1rem;
    box-shadow: 0 4px 20px rgba(77, 0, 50, 0.1);
}

.play-button {
    width: 60px;
    height: 60px;
    background: var(--primary-burgundy);
    color: white;
    border: none;
    border-radius: 50%;
    font-size: 1.5rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
}

.video-info h4 {
    margin-bottom: 0.5rem;
    font-size: 1.1rem;
}

.video-info p {
    margin: 0;
    color: var(--dark-gray);
    font-size: 0.9rem;
}

@media (max-width: 768px) {
    .welcome-video-container {
        flex-direction: column;
        text-align: center;
    }
    
    .step-indicator {
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .step-indicator .step-title {
        font-size: 0.9rem;
    }
}
</style>
`;

$('head').append(step1CSS);
