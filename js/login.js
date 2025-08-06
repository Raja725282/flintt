// ================================
// LOGIN PAGE JAVASCRIPT
// ================================

$(document).ready(function() {
    // Initialize login page
    initializeLogin();
    
    // Add animation to brand section
    animateBrandSection();
    
    // Add typing effect to subtitle
    addTypingEffect();
});

function initializeLogin() {
    // Handle form submission
    $('#loginForm').on('submit', function(e) {
        e.preventDefault();
        handleLogin();
    });
    
    // Handle forgot password
    $('.forgot-password').on('click', function(e) {
        e.preventDefault();
        showForgotPasswordModal();
    });
    
    // Handle sign up link
    $('.signup-link').on('click', function(e) {
        e.preventDefault();
        showSignupModal();
    });
    
    // Add input animations
    $('.form-input').on('focus', function() {
        $(this).parent().addClass('focused');
    });
    
    $('.form-input').on('blur', function() {
        if ($(this).val() === '') {
            $(this).parent().removeClass('focused');
        }
    });
}

function handleLogin() {
    const email = $('#email').val();
    const password = $('#password').val();
    const remember = $('#remember').is(':checked');
    
    // Validate inputs
    if (!validateEmail(email)) {
        showError('Please enter a valid email address');
        return;
    }
    
    if (password.length < 6) {
        showError('Password must be at least 6 characters');
        return;
    }
    
    // Show loading state
    showLoadingState();
    
    // Simulate login process
    setTimeout(() => {
        // For demo purposes, accept any valid email/password
        if (email && password) {
            // Store user data
            const userData = {
                email: email,
                name: extractNameFromEmail(email),
                loginTime: new Date().toISOString(),
                remember: remember
            };
            
            if (remember) {
                localStorage.setItem('flintUser', JSON.stringify(userData));
            } else {
                sessionStorage.setItem('flintUser', JSON.stringify(userData));
            }
            
            // Show success animation
            showSuccessState();
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        } else {
            hideLoadingState();
            showError('Invalid email or password');
        }
    }, 2000);
}

function showLoadingState() {
    const btn = $('.btn-login');
    btn.prop('disabled', true);
    btn.find('.login-text').addClass('d-none');
    btn.find('.login-spinner').removeClass('d-none');
    $('#loadingOverlay').removeClass('d-none');
}

function hideLoadingState() {
    const btn = $('.btn-login');
    btn.prop('disabled', false);
    btn.find('.login-text').removeClass('d-none');
    btn.find('.login-spinner').addClass('d-none');
    $('#loadingOverlay').addClass('d-none');
}

function showSuccessState() {
    hideLoadingState();
    const btn = $('.btn-login');
    btn.html('<i class="fas fa-check me-2"></i>Success!');
    btn.removeClass('btn-primary').addClass('btn-success');
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function extractNameFromEmail(email) {
    const name = email.split('@')[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
}

function showError(message) {
    // Create error alert
    const alert = $(`
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
            <i class="fas fa-exclamation-triangle me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `);
    
    // Remove existing alerts
    $('.login-form .alert').remove();
    
    // Add new alert
    $('.login-form').prepend(alert);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        alert.alert('close');
    }, 5000);
}

function togglePassword() {
    const passwordInput = $('#password');
    const passwordIcon = $('#passwordIcon');
    
    if (passwordInput.attr('type') === 'password') {
        passwordInput.attr('type', 'text');
        passwordIcon.removeClass('fa-eye').addClass('fa-eye-slash');
    } else {
        passwordInput.attr('type', 'password');
        passwordIcon.removeClass('fa-eye-slash').addClass('fa-eye');
    }
}

function showForgotPasswordModal() {
    // Create modal for forgot password
    const modal = $(`
        <div class="modal fade" id="forgotPasswordModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Reset Password</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <p>Enter your email address and we'll send you a link to reset your password.</p>
                        <div class="form-group">
                            <label for="resetEmail" class="form-label">Email Address</label>
                            <input type="email" class="form-control" id="resetEmail" placeholder="Enter your email">
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="sendResetEmail()">Send Reset Link</button>
                    </div>
                </div>
            </div>
        </div>
    `);
    
    $('body').append(modal);
    $('#forgotPasswordModal').modal('show');
    
    // Remove modal after hiding
    $('#forgotPasswordModal').on('hidden.bs.modal', function() {
        $(this).remove();
    });
}

function sendResetEmail() {
    const email = $('#resetEmail').val();
    
    if (!validateEmail(email)) {
        alert('Please enter a valid email address');
        return;
    }
    
    // Simulate sending email
    $('#forgotPasswordModal').modal('hide');
    
    // Show success message
    const alert = $(`
        <div class="alert alert-success alert-dismissible fade show" role="alert">
            <i class="fas fa-check-circle me-2"></i>
            Password reset link sent to ${email}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `);
    
    $('.login-form').prepend(alert);
    
    setTimeout(() => {
        alert.alert('close');
    }, 5000);
}

function showSignupModal() {
    alert('Sign up functionality would be implemented here. For demo purposes, please use the login form.');
}

function animateBrandSection() {
    // Animate stats on load
    $('.stat-number').each(function(index) {
        const $this = $(this);
        const targetValue = $this.text();
        $this.text('0');
        
        setTimeout(() => {
            $({ value: 0 }).animate({ value: parseFloat(targetValue) }, {
                duration: 2000,
                easing: 'swing',
                step: function() {
                    if (targetValue.includes('.')) {
                        $this.text(this.value.toFixed(1));
                    } else {
                        $this.text(Math.ceil(this.value) + 'K');
                    }
                }
            });
        }, index * 500);
    });
    
    // Animate feature items
    $('.feature-item').each(function(index) {
        $(this).css('opacity', '0').delay(index * 200).animate({
            opacity: 1
        }, 500);
    });
    
    // Animate benefit items
    $('.benefit-item').each(function(index) {
        $(this).css('transform', 'translateY(20px)').css('opacity', '0');
        setTimeout(() => {
            $(this).animate({
                opacity: 1
            }, 500).css('transform', 'translateY(0)');
        }, index * 150);
    });
}

function addTypingEffect() {
    const subtitle = $('.subtitle');
    const text = subtitle.text();
    subtitle.text('');
    
    let index = 0;
    function typeText() {
        if (index < text.length) {
            subtitle.text(subtitle.text() + text.charAt(index));
            index++;
            setTimeout(typeText, 50);
        }
    }
    
    setTimeout(typeText, 1000);
}

// Handle browser back button
window.addEventListener('popstate', function(event) {
    // Clear any stored user data when navigating back
    sessionStorage.removeItem('flintUser');
});

// Check if user is already logged in
$(document).ready(function() {
    const userData = localStorage.getItem('flintUser') || sessionStorage.getItem('flintUser');
    if (userData) {
        const user = JSON.parse(userData);
        // Check if login is still valid (within 24 hours for remember me)
        const loginTime = new Date(user.loginTime);
        const now = new Date();
        const hoursDiff = (now - loginTime) / (1000 * 60 * 60);
        
        if (user.remember && hoursDiff < 24) {
            window.location.href = 'dashboard.html';
        } else if (!user.remember && hoursDiff < 8) {
            window.location.href = 'dashboard.html';
        } else {
            // Clear expired data
            localStorage.removeItem('flintUser');
            sessionStorage.removeItem('flintUser');
        }
    }
});
