// ================================
// STEP 3: FINANCIAL SETUP & DOCUMENTATION
// ================================

$(document).ready(function() {
    // Check authentication
    checkAuthentication();
    
    // Initialize step 3
    initializeStep3();
    
    // Load progress data
    loadStepProgress();
    
    // Initialize all components
    initializeCommissionCalculator();
    initializeBankingForm();
    initializeDocumentUpload();
    initializeChecklist();
    
    // Initialize animations
    initializeStepAnimations();
    
    // Track step entry
    trackStepEntry(3);
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

function initializeStep3() {
    // Initialize tooltips and popovers
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Auto-save progress periodically
    setInterval(saveProgress, 30000);
    
    // Load any saved data
    loadSavedData();
}

function loadStepProgress() {
    const user = checkAuthentication();
    if (!user) return;
    
    // Get step-specific progress
    let stepProgress = JSON.parse(localStorage.getItem('step3Progress') || '{}');
    
    if (!stepProgress[user.email]) {
        stepProgress[user.email] = {
            commissionCalculatorUsed: false,
            bankingInfoCompleted: false,
            documentsUploaded: [],
            checklistCompleted: [],
            lastActivity: new Date().toISOString(),
            completionPercentage: 0,
            savedBankingData: {},
            uploadedFiles: {}
        };
    }
    
    const userStepProgress = stepProgress[user.email];
    
    // Update UI based on progress
    updateProgressUI(userStepProgress);
    
    // Store current progress
    localStorage.setItem('step3Progress', JSON.stringify(stepProgress));
}

function updateProgressUI(progress) {
    // Update checklist
    progress.checklistCompleted.forEach(taskId => {
        $(`#${taskId}`).prop('checked', true);
        $(`.checklist-item[data-task="${taskId.replace('task', '')}"]`).addClass('completed');
    });
    
    // Update completion percentage
    updateCompletionPercentage(progress);
    
    // Show uploaded documents
    Object.keys(progress.uploadedFiles).forEach(docType => {
        updateDocumentStatus(docType, 'uploaded', progress.uploadedFiles[docType].name);
    });
    
    // Restore banking form if saved
    if (progress.savedBankingData && Object.keys(progress.savedBankingData).length > 0) {
        restoreBankingData(progress.savedBankingData);
    }
}

function updateCompletionPercentage(progress) {
    const totalItems = 4; // 4 checklist items
    let completed = progress.checklistCompleted.length;
    
    const percentage = Math.round((completed / totalItems) * 100);
    progress.completionPercentage = percentage;
    
    // Update UI
    $('.step-completion-percentage').text(`${percentage}%`);
    
    if (percentage === 100) {
        $('.step-completion-badge i').removeClass('fa-dollar-sign').addClass('fa-check-circle text-success');
        $('.completion-text .fw-bold').text('Completed').removeClass('text-primary').addClass('text-success');
    }
}

function initializeCommissionCalculator() {
    // Real-time calculation
    $('#loanAmount, #interestRate, #commissionTier').on('input change', function() {
        if ($('#loanAmount').val() && $('#interestRate').val()) {
            calculateCommission();
        }
    });
    
    // Add formatting to loan amount
    $('#loanAmount').on('input', function() {
        let value = $(this).val().replace(/,/g, '');
        if (value) {
            $(this).val(parseInt(value).toLocaleString());
        }
    });
}

function calculateCommission() {
    const loanAmount = parseFloat($('#loanAmount').val().replace(/,/g, '')) || 0;
    const interestRate = parseFloat($('#interestRate').val()) || 0;
    const commissionTier = parseFloat($('#commissionTier').val()) || 0;
    
    if (loanAmount <= 0 || interestRate <= 0) {
        $('#calculationResult').hide();
        return;
    }
    
    // Base commission calculation (simplified example)
    // In reality, this would be more complex based on actual commission structure
    const baseCommission = loanAmount * 0.01; // 1% base
    const tierMultiplier = commissionTier / 100;
    const rateAdjustment = interestRate > 6 ? 1.1 : 1.0; // Bonus for higher rates
    
    const finalCommission = baseCommission * tierMultiplier * rateAdjustment;
    
    // Display result
    $('.result-amount').text('$' + Math.round(finalCommission).toLocaleString());
    $('#calculationResult').show();
    
    // Track calculator usage
    trackCalculatorUsage(loanAmount, interestRate, commissionTier, finalCommission);
    
    // Mark calculator as used
    const user = checkAuthentication();
    if (user) {
        let stepProgress = JSON.parse(localStorage.getItem('step3Progress') || '{}');
        if (!stepProgress[user.email].commissionCalculatorUsed) {
            stepProgress[user.email].commissionCalculatorUsed = true;
            localStorage.setItem('step3Progress', JSON.stringify(stepProgress));
            
            // Auto-check task 4 if not already checked
            if (!$('#task4').is(':checked')) {
                $('#task4').prop('checked', true).trigger('change');
            }
        }
    }
}

function trackCalculatorUsage(loanAmount, interestRate, tier, commission) {
    trackEvent('commission_calculator_used', {
        loanAmount: loanAmount,
        interestRate: interestRate,
        tier: tier,
        calculatedCommission: commission,
        step: 3,
        timestamp: new Date().toISOString()
    });
}

function initializeBankingForm() {
    $('#bankingForm').on('submit', function(e) {
        e.preventDefault();
        saveBankingInformation();
    });
    
    // Real-time validation
    $('#routingNumber').on('input', function() {
        let value = $(this).val().replace(/\D/g, '');
        $(this).val(value);
        
        if (value.length === 9) {
            validateRoutingNumber(value);
        }
    });
    
    // Auto-save form data
    $('#bankingForm input, #bankingForm select').on('change', function() {
        autoSaveBankingData();
    });
}

function validateRoutingNumber(routingNumber) {
    // Simple routing number validation (checksum algorithm)
    const digits = routingNumber.split('').map(Number);
    const checksum = (3 * (digits[0] + digits[3] + digits[6]) +
                     7 * (digits[1] + digits[4] + digits[7]) +
                     (digits[2] + digits[5] + digits[8])) % 10;
    
    const isValid = checksum === 0;
    
    if (isValid) {
        $('#routingNumber').removeClass('is-invalid').addClass('is-valid');
    } else {
        $('#routingNumber').removeClass('is-valid').addClass('is-invalid');
    }
    
    return isValid;
}

function saveBankingInformation() {
    const formData = {
        bankName: $('#bankName').val(),
        accountType: $('#accountType').val(),
        routingNumber: $('#routingNumber').val(),
        accountNumber: $('#accountNumber').val(),
        accountHolderName: $('#accountHolderName').val(),
        backupPayment: $('#backupPayment').val(),
        consent: $('#bankingConsent').is(':checked'),
        submittedAt: new Date().toISOString()
    };
    
    // Validate required fields
    if (!formData.bankName || !formData.accountType || !formData.routingNumber || 
        !formData.accountNumber || !formData.accountHolderName || !formData.consent) {
        showAlert('Please complete all required fields and provide consent.', 'danger');
        return;
    }
    
    // Validate routing number
    if (!validateRoutingNumber(formData.routingNumber)) {
        showAlert('Please enter a valid routing number.', 'danger');
        return;
    }
    
    const user = checkAuthentication();
    if (!user) return;
    
    // Save to progress
    let stepProgress = JSON.parse(localStorage.getItem('step3Progress') || '{}');
    stepProgress[user.email].bankingInfoCompleted = true;
    stepProgress[user.email].savedBankingData = formData;
    localStorage.setItem('step3Progress', JSON.stringify(stepProgress));
    
    // Show success message
    showAlert('Banking information saved successfully! Your payment setup is complete.', 'success');
    
    // Mark task as completed
    if (!$('#task2').is(':checked')) {
        $('#task2').prop('checked', true).trigger('change');
    }
    
    // Track banking completion
    trackEvent('banking_info_completed', {
        bankName: formData.bankName,
        accountType: formData.accountType,
        hasBackupPayment: !!formData.backupPayment,
        step: 3,
        timestamp: new Date().toISOString()
    });
}

function autoSaveBankingData() {
    const user = checkAuthentication();
    if (!user) return;
    
    const formData = {
        bankName: $('#bankName').val(),
        accountType: $('#accountType').val(),
        routingNumber: $('#routingNumber').val(),
        accountNumber: $('#accountNumber').val(),
        accountHolderName: $('#accountHolderName').val(),
        backupPayment: $('#backupPayment').val(),
        lastSaved: new Date().toISOString()
    };
    
    let stepProgress = JSON.parse(localStorage.getItem('step3Progress') || '{}');
    stepProgress[user.email].savedBankingData = formData;
    localStorage.setItem('step3Progress', JSON.stringify(stepProgress));
}

function restoreBankingData(savedData) {
    $('#bankName').val(savedData.bankName || '');
    $('#accountType').val(savedData.accountType || '');
    $('#routingNumber').val(savedData.routingNumber || '');
    $('#accountNumber').val(savedData.accountNumber || '');
    $('#accountHolderName').val(savedData.accountHolderName || '');
    $('#backupPayment').val(savedData.backupPayment || '');
}

function initializeDocumentUpload() {
    // Initialize drag and drop for all upload areas
    $('.upload-area').each(function() {
        const uploadArea = this;
        
        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, preventDefaults, false);
        });
        
        // Highlight drop area when dragging over it
        ['dragenter', 'dragover'].forEach(eventName => {
            uploadArea.addEventListener(eventName, highlight, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, unhighlight, false);
        });
        
        // Handle dropped files
        uploadArea.addEventListener('drop', handleDrop, false);
    });
    
    // Handle file input changes
    $('input[type="file"]').on('change', function(e) {
        const files = e.target.files;
        const docType = $(this).attr('id').replace('File', '');
        handleFiles(files, docType);
    });
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function highlight(e) {
    $(e.target).closest('.upload-area').addClass('drag-highlight');
}

function unhighlight(e) {
    $(e.target).closest('.upload-area').removeClass('drag-highlight');
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    const uploadArea = $(e.target).closest('.upload-area');
    const docType = uploadArea.attr('id').replace('Upload', '');
    
    handleFiles(files, docType);
}

function handleFiles(files, docType) {
    if (files.length === 0) return;
    
    const file = files[0];
    
    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
        showAlert('Please upload only PDF, JPG, or PNG files.', 'danger');
        return;
    }
    
    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
        showAlert('File size must be less than 10MB.', 'danger');
        return;
    }
    
    // Simulate file upload
    uploadDocument(file, docType);
}

function uploadDocument(file, docType) {
    // Update upload area to show uploading state
    updateDocumentStatus(docType, 'uploading');
    
    // Simulate upload progress
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 100) {
            progress = 100;
            clearInterval(progressInterval);
            
            // Complete upload
            setTimeout(() => {
                completeDocumentUpload(file, docType);
            }, 500);
        }
        updateUploadProgress(docType, progress);
    }, 200);
}

function updateDocumentStatus(docType, status, fileName = '') {
    const uploadArea = $(`#${docType}Upload`);
    const statusItem = $(`#${docType}Status`);
    
    switch (status) {
        case 'uploading':
            uploadArea.addClass('uploading').html(`
                <i class="fas fa-spinner fa-spin"></i>
                <p>Uploading...</p>
                <div class="upload-progress">
                    <div class="progress-bar" style="width: 0%"></div>
                </div>
            `);
            
            statusItem.find('.status-icon').removeClass('bg-secondary bg-success bg-danger')
                     .addClass('bg-warning');
            statusItem.find('.status-text').text('Uploading...');
            statusItem.find('.status-indicator i').removeClass().addClass('fas fa-spinner fa-spin text-warning');
            break;
            
        case 'uploaded':
            uploadArea.removeClass('uploading').addClass('uploaded').html(`
                <i class="fas fa-check-circle text-success"></i>
                <p><strong>Upload Complete</strong></p>
                <small class="text-muted">${fileName}</small>
                <button class="btn btn-sm btn-outline-danger mt-2" onclick="removeDocument('${docType}')">
                    Remove
                </button>
            `);
            
            statusItem.find('.status-icon').removeClass('bg-secondary bg-warning bg-danger')
                     .addClass('bg-success');
            statusItem.find('.status-text').text('Uploaded successfully');
            statusItem.find('.status-indicator i').removeClass().addClass('fas fa-check-circle text-success');
            break;
            
        case 'error':
            uploadArea.removeClass('uploading').addClass('error').html(`
                <i class="fas fa-exclamation-triangle text-danger"></i>
                <p><strong>Upload Failed</strong></p>
                <small class="text-muted">Please try again</small>
                <button class="btn btn-sm btn-primary mt-2" onclick="retryUpload('${docType}')">
                    Retry
                </button>
            `);
            
            statusItem.find('.status-icon').removeClass('bg-secondary bg-warning bg-success')
                     .addClass('bg-danger');
            statusItem.find('.status-text').text('Upload failed');
            statusItem.find('.status-indicator i').removeClass().addClass('fas fa-exclamation-triangle text-danger');
            break;
    }
}

function updateUploadProgress(docType, progress) {
    $(`#${docType}Upload .progress-bar`).css('width', `${progress}%`);
}

function completeDocumentUpload(file, docType) {
    const user = checkAuthentication();
    if (!user) return;
    
    // Save file info to progress
    let stepProgress = JSON.parse(localStorage.getItem('step3Progress') || '{}');
    
    if (!stepProgress[user.email].documentsUploaded.includes(docType)) {
        stepProgress[user.email].documentsUploaded.push(docType);
    }
    
    stepProgress[user.email].uploadedFiles[docType] = {
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString()
    };
    
    localStorage.setItem('step3Progress', JSON.stringify(stepProgress));
    
    // Update UI
    updateDocumentStatus(docType, 'uploaded', file.name);
    
    // Check if required documents are uploaded
    const requiredDocs = ['license', 'insurance'];
    const uploadedRequired = requiredDocs.filter(doc => 
        stepProgress[user.email].documentsUploaded.includes(doc)
    );
    
    if (uploadedRequired.length === requiredDocs.length) {
        // Mark task as completed
        if (!$('#task3').is(':checked')) {
            $('#task3').prop('checked', true).trigger('change');
        }
        
        showAlert('All required documents uploaded successfully!', 'success');
    }
    
    // Track document upload
    trackEvent('document_uploaded', {
        docType: docType,
        fileName: file.name,
        fileSize: file.size,
        step: 3,
        timestamp: new Date().toISOString()
    });
}

function removeDocument(docType) {
    const user = checkAuthentication();
    if (!user) return;
    
    // Remove from progress
    let stepProgress = JSON.parse(localStorage.getItem('step3Progress') || '{}');
    
    const index = stepProgress[user.email].documentsUploaded.indexOf(docType);
    if (index > -1) {
        stepProgress[user.email].documentsUploaded.splice(index, 1);
    }
    
    delete stepProgress[user.email].uploadedFiles[docType];
    localStorage.setItem('step3Progress', JSON.stringify(stepProgress));
    
    // Reset upload area
    const uploadArea = $(`#${docType}Upload`);
    uploadArea.removeClass('uploaded error').html(`
        <i class="fas fa-cloud-upload-alt"></i>
        <p>Click to upload or drag and drop</p>
        <small class="text-muted">PDF, JPG, PNG up to 10MB</small>
    `);
    
    // Reset status
    const statusItem = $(`#${docType}Status`);
    statusItem.find('.status-icon').removeClass('bg-success bg-warning bg-danger')
             .addClass('bg-secondary');
    statusItem.find('.status-text').text('Waiting for upload');
    statusItem.find('.status-indicator i').removeClass().addClass('fas fa-clock text-muted');
    
    // Check task 3 status
    const requiredDocs = ['license', 'insurance'];
    const uploadedRequired = requiredDocs.filter(doc => 
        stepProgress[user.email].documentsUploaded.includes(doc)
    );
    
    if (uploadedRequired.length < requiredDocs.length && $('#task3').is(':checked')) {
        $('#task3').prop('checked', false).trigger('change');
    }
    
    trackEvent('document_removed', {
        docType: docType,
        step: 3,
        timestamp: new Date().toISOString()
    });
}

function triggerFileUpload(docType) {
    $(`#${docType}File`).click();
}

function initializeChecklist() {
    $('.checklist-item input[type="checkbox"]').on('change', function() {
        const taskId = $(this).attr('id');
        const user = checkAuthentication();
        
        if (!user) return;
        
        let stepProgress = JSON.parse(localStorage.getItem('step3Progress') || '{}');
        
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
        
        localStorage.setItem('step3Progress', JSON.stringify(stepProgress));
        updateCompletionPercentage(stepProgress[user.email]);
        
        // Track task completion
        trackEvent('checklist_task_toggled', {
            task: taskId,
            completed: $(this).is(':checked'),
            step: 3,
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

function initializeStepAnimations() {
    // Animate elements on scroll
    $(window).on('scroll', function() {
        $('.commission-tier-card, .document-item, .checklist-item').each(function() {
            if (isElementInViewport($(this))) {
                $(this).addClass('animate-on-scroll');
            }
        });
    });
    
    // Initial animations
    setTimeout(() => {
        $('.commission-tier-card').each(function(index) {
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
    
    let stepProgress = JSON.parse(localStorage.getItem('step3Progress') || '{}');
    if (stepProgress[user.email]) {
        stepProgress[user.email].lastActivity = new Date().toISOString();
        localStorage.setItem('step3Progress', JSON.stringify(stepProgress));
    }
}

function loadSavedData() {
    const user = checkAuthentication();
    if (!user) return;
    
    const stepProgress = JSON.parse(localStorage.getItem('step3Progress') || '{}');
    if (stepProgress[user.email] && stepProgress[user.email].savedBankingData) {
        restoreBankingData(stepProgress[user.email].savedBankingData);
    }
}

function showAlert(message, type = 'info') {
    const alertClass = `alert-${type}`;
    const iconClass = type === 'success' ? 'fa-check-circle' : 
                     type === 'danger' ? 'fa-exclamation-triangle' : 
                     type === 'warning' ? 'fa-exclamation-circle' : 'fa-info-circle';
    
    const alert = $(`
        <div class="alert ${alertClass} alert-dismissible fade show" style="position: fixed; top: 20px; right: 20px; z-index: 9999; max-width: 400px;">
            <i class="fas ${iconClass} me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `);
    
    $('body').append(alert);
    
    setTimeout(() => {
        alert.alert('close');
    }, 5000);
}

// ================================
// GLOBAL FUNCTIONS (called from HTML)
// ================================

function reviewCommissionStructure() {
    const modalContent = `
        <div class="commission-details">
            <h5>Understanding Your Commission Tiers</h5>
            
            <div class="tier-details mb-4">
                <h6 class="text-primary">How Tiers Work</h6>
                <p>Your commission tier is determined by your monthly gross commission volume. As you grow your business, you automatically advance to higher tiers with better rates and benefits.</p>
                
                <div class="tier-progression">
                    <div class="progression-item">
                        <div class="progression-icon bg-warning text-white">B</div>
                        <div class="progression-content">
                            <strong>Bronze Tier (65%)</strong>
                            <p>Perfect for getting started. Includes all essential tools and training.</p>
                        </div>
                    </div>
                    <div class="progression-arrow">→</div>
                    <div class="progression-item">
                        <div class="progression-icon bg-secondary text-white">S</div>
                        <div class="progression-content">
                            <strong>Silver Tier (75%)</strong>
                            <p>Enhanced support and marketing materials to accelerate growth.</p>
                        </div>
                    </div>
                    <div class="progression-arrow">→</div>
                    <div class="progression-item">
                        <div class="progression-icon bg-warning text-white">G</div>
                        <div class="progression-content">
                            <strong>Gold Tier (85%)</strong>
                            <p>Maximum commission with dedicated support and lead generation.</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="additional-benefits">
                <h6 class="text-primary">Additional Benefits</h6>
                <ul class="benefits-list">
                    <li><i class="fas fa-check text-success me-2"></i>No desk fees or franchise fees</li>
                    <li><i class="fas fa-check text-success me-2"></i>Full technology stack included</li>
                    <li><i class="fas fa-check text-success me-2"></i>Comprehensive training program</li>
                    <li><i class="fas fa-check text-success me-2"></i>Marketing and lead generation support</li>
                    <li><i class="fas fa-check text-success me-2"></i>Compliance and back-office support</li>
                </ul>
            </div>
            
            <div class="example-earnings mt-4 p-3 bg-light rounded">
                <h6>Example Monthly Earnings</h6>
                <p class="mb-1"><strong>10 loans @ $400K average:</strong></p>
                <ul class="example-list">
                    <li>Bronze: $26,000 commission</li>
                    <li>Silver: $30,000 commission</li>
                    <li>Gold: $34,000 commission</li>
                </ul>
            </div>
        </div>
    `;
    
    $('#commissionModalTitle').text('Commission Structure Details');
    $('#commissionModalBody').html(modalContent);
    $('#commissionModal').modal('show');
    
    // Mark task as completed
    if (!$('#task1').is(':checked')) {
        $('#task1').prop('checked', true).trigger('change');
    }
    
    trackEvent('commission_details_reviewed', {
        step: 3,
        timestamp: new Date().toISOString()
    });
}

function scrollToBanking() {
    $('html, body').animate({
        scrollTop: $('.banking-form-card').offset().top - 100
    }, 1000);
    
    // Highlight the banking section
    $('.banking-form-card').addClass('highlight-section');
    setTimeout(() => {
        $('.banking-form-card').removeClass('highlight-section');
    }, 3000);
}

function scrollToDocuments() {
    $('html, body').animate({
        scrollTop: $('.document-upload-section').offset().top - 100
    }, 1000);
    
    // Highlight the documents section
    $('.document-upload-section').addClass('highlight-section');
    setTimeout(() => {
        $('.document-upload-section').removeClass('highlight-section');
    }, 3000);
}

function scrollToCalculator() {
    $('html, body').animate({
        scrollTop: $('.commission-calculator').offset().top - 100
    }, 1000);
    
    // Highlight the calculator
    $('.commission-calculator').addClass('highlight-section');
    setTimeout(() => {
        $('.commission-calculator').removeClass('highlight-section');
    }, 3000);
    
    // Focus on loan amount field
    setTimeout(() => {
        $('#loanAmount').focus();
    }, 1000);
}

function downloadCommissionGuide() {
    const filename = 'Flint_Commission_Structure_Guide.pdf';
    
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
    
    trackEvent('commission_guide_downloaded', {
        step: 3,
        timestamp: new Date().toISOString()
    });
    
    $('#commissionModal').modal('hide');
}

function nextStep() {
    // Check if minimum requirements are met
    const user = checkAuthentication();
    if (!user) return;
    
    const stepProgress = JSON.parse(localStorage.getItem('step3Progress') || '{}');
    const userProgress = stepProgress[user.email];
    
    if (!userProgress || 
        !userProgress.bankingInfoCompleted || 
        userProgress.documentsUploaded.length < 2) {
        showRequirementsModal();
        return;
    }
    
    // Mark step as completed and move to next
    let progressData = JSON.parse(localStorage.getItem('flintProgress') || '{}');
    if (!progressData[user.email]) {
        progressData[user.email] = {
            currentStep: 4,
            completedSteps: [1, 2, 3],
            stepData: {}
        };
    }
    
    if (!progressData[user.email].completedSteps.includes(3)) {
        progressData[user.email].completedSteps.push(3);
    }
    
    progressData[user.email].currentStep = 4;
    progressData[user.email].stepData[3] = {
        completed: true,
        completedAt: new Date().toISOString()
    };
    
    localStorage.setItem('flintProgress', JSON.stringify(progressData));
    
    // Track step completion
    trackEvent('step_completed', {
        step: 3,
        timestamp: new Date().toISOString()
    });
    
    // Navigate to next step
    window.location.href = 'step4.html';
}

function showRequirementsModal() {
    const user = checkAuthentication();
    const stepProgress = JSON.parse(localStorage.getItem('step3Progress') || '{}');
    const userProgress = stepProgress[user.email] || {};
    
    let missingRequirements = [];
    
    if (!userProgress.bankingInfoCompleted) {
        missingRequirements.push('Complete banking information setup');
    }
    
    if (userProgress.documentsUploaded.length < 2) {
        missingRequirements.push('Upload required documents (Broker License and E&O Insurance)');
    }
    
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
                            ${missingRequirements.map(req => `
                                <li><i class="fas fa-exclamation-triangle text-warning me-2"></i>${req}</li>
                            `).join('')}
                        </ul>
                        <p class="text-muted">These activities ensure your financial setup is complete and compliant.</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Continue Setup</button>
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
