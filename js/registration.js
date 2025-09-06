// Save this as 'Registration & Login.js' in your js folder

// Authentication System
class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.users = this.loadUsers();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuthStatus();
        this.setupDemoData();
    }


    setupDemoData() {
        if (this.users.length === 0) {
            this.users.push({
                id: 1,
                name: "Demo User",
                email: "demo@tailor.com",
                password: "demo123"
            });
            this.saveUsers();
        }
    }

    setupEventListeners() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Password toggle
        document.querySelectorAll('.password-toggle').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.togglePassword(e.target);
            });
        });

        // Form submissions - CRITICAL: Make sure these are properly bound
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegister();
            });
        }

        // Real-time validation
        this.setupRealTimeValidation();
    }

    setupRealTimeValidation() {
        // Email validation
        const registerEmail = document.getElementById('registerEmail');
        if (registerEmail) {
            registerEmail.addEventListener('blur', () => {
                this.validateEmail('registerEmail');
            });
        }

        // Password strength
        const registerPassword = document.getElementById('registerPassword');
        if (registerPassword) {
            registerPassword.addEventListener('input', () => {
                this.validatePassword('registerPassword');
            });
        }

        // Confirm password
        const confirmPassword = document.getElementById('confirmPassword');
        if (confirmPassword) {
            confirmPassword.addEventListener('input', () => {
                this.validateConfirmPassword();
            });
        }
    }

    switchTab(tab) {

        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const activeBtn = document.querySelector(`[data-tab="${tab}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        // Update forms
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });
        const activeForm = document.getElementById(`${tab}Form`);
        if (activeForm) {
            activeForm.classList.add('active');
        }

        // Hide success message
        const successMessage = document.getElementById('successMessage');
        if (successMessage) {
            successMessage.classList.remove('show');
        }

        // Clear form errors
        this.clearErrors();
    }

    togglePassword(target) {
        const button = target.closest('.password-toggle');
        const inputId = button.dataset.target;
        const input = document.getElementById(inputId);
        const icon = button.querySelector('i');

        if (input && icon) {
            if (input.type === 'password') {
                input.type = 'text';
                icon.className = 'fa-solid fa-eye-slash';
            } else {
                input.type = 'password';
                icon.className = 'fa-solid fa-eye';
            }
        }
    }

    async handleLogin() {

        const btn = document.querySelector('#loginForm .submit-btn');
        const emailEl = document.getElementById('loginEmail');
        const passwordEl = document.getElementById('loginPassword');

        if (!emailEl || !passwordEl) return;

        const email = emailEl.value.trim();
        const password = passwordEl.value;

        // Clear previous errors
        this.clearErrors();

        // Validation
        if (!this.validateLoginForm(email, password)) return;

        // Show loading
        this.setLoading(btn, true);

        try {
            // Simulate API delay
            await this.delay(800);

            // Check credentials
            const user = this.users.find(u => u.email === email && u.password === password);

            if (user) {
                this.currentUser = user;
                this.saveAuthStatus();
                this.showUserInfo();
                this.notifyParent('login', user);
            } else {
                this.showError('loginPassword', 'Invalid email or password');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showError('loginPassword', 'Login failed. Please try again.');
        } finally {
            this.setLoading(btn, false);
        }
    }

    async handleRegister() {
        const btn = document.querySelector('#registerForm .submit-btn');
        const nameEl = document.getElementById('registerName');
        const emailEl = document.getElementById('registerEmail');
        const passwordEl = document.getElementById('registerPassword');
        const confirmPasswordEl = document.getElementById('confirmPassword');

        if (!nameEl || !emailEl || !passwordEl || !confirmPasswordEl) {
            console.error('Register form elements not found');
            return;
        }

        const name = nameEl.value.trim();
        const email = emailEl.value.trim();
        const password = passwordEl.value;
        const confirmPassword = confirmPasswordEl.value;

        // Clear previous errors
        this.clearErrors();

        // Validation
        if (!this.validateRegisterForm(name, email, password, confirmPassword)) {
            return;
        }

        // Show loading
        this.setLoading(btn, true);

        try {
            // Simulate API delay
            await this.delay(1000);

            // Check if email exists
            if (this.users.some(u => u.email === email)) {
                this.showError('registerEmail', 'Email already exists');
                return;
            }

            // Create new user
            const newUser = {
                id: Date.now(),
                name,
                email,
                password,
                createdAt: new Date().toISOString()
            };

            this.users.push(newUser);
            this.saveUsers();
            // Show success and switch to login
            const successMessage = document.getElementById('successMessage');
            if (successMessage) {
                successMessage.classList.add('show');
            }

            setTimeout(() => {
                this.switchTab('login');
                const loginEmailEl = document.getElementById('loginEmail');
                if (loginEmailEl) {
                    loginEmailEl.value = email;
                }
            }, 1500);

        } catch (error) {
            console.error('Registration error:', error);
            this.showError('registerEmail', 'Registration failed. Please try again.');
        } finally {
            this.setLoading(btn, false);
        }
    }

    validateLoginForm(email, password) {
        let isValid = true;

        if (!email) {
            this.showError('loginEmail', 'Email is required');
            isValid = false;
        }

        if (!password) {
            this.showError('loginPassword', 'Password is required');
            isValid = false;
        }

        return isValid;
    }

    validateRegisterForm(name, email, password, confirmPassword) {
        let isValid = true;

        if (!name || name.length < 2) {
            this.showError('registerName', 'Name must be at least 2 characters');
            isValid = false;
        }

        if (!this.validateEmail('registerEmail')) {
            isValid = false;
        }

        if (!this.validatePassword('registerPassword')) {
            isValid = false;
        }

        if (!this.validateConfirmPassword()) {
            isValid = false;
        }

        return isValid;
    }

    validateEmail(inputId) {
        const input = document.getElementById(inputId);
        if (!input) return false;

        const email = input.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email) {
            this.showError(inputId, 'Email is required');
            return false;
        }

        if (!emailRegex.test(email)) {
            this.showError(inputId, 'Please enter a valid email');
            return false;
        }

        this.clearError(inputId);
        return true;
    }

    validatePassword(inputId) {
        const input = document.getElementById(inputId);
        if (!input) return false;

        const password = input.value;

        if (!password) {
            this.showError(inputId, 'Password is required');
            return false;
        }

        if (password.length < 6) {
            this.showError(inputId, 'Password must be at least 6 characters');
            return false;
        }

        this.clearError(inputId);
        return true;
    }

    validateConfirmPassword() {
        const passwordEl = document.getElementById('registerPassword');
        const confirmPasswordEl = document.getElementById('confirmPassword');

        if (!passwordEl || !confirmPasswordEl) return false;

        const password = passwordEl.value;
        const confirmPassword = confirmPasswordEl.value;

        if (!confirmPassword) {
            this.showError('confirmPassword', 'Please confirm your password');
            return false;
        }

        if (password !== confirmPassword) {
            this.showError('confirmPassword', 'Passwords do not match');
            return false;
        }

        this.clearError('confirmPassword');
        return true;
    }

    showError(inputId, message) {
        const input = document.getElementById(inputId);
        const errorEl = document.getElementById(inputId + 'Error');

        if (input) {
            input.classList.add('error');
        }
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.classList.add('show');
        }
    }

    clearError(inputId) {
        const input = document.getElementById(inputId);
        const errorEl = document.getElementById(inputId + 'Error');

        if (input) {
            input.classList.remove('error');
        }
        if (errorEl) {
            errorEl.classList.remove('show');
        }
    }

    clearErrors() {
        document.querySelectorAll('.form-input').forEach(input => {
            input.classList.remove('error');
        });
        document.querySelectorAll('.error-message').forEach(error => {
            error.classList.remove('show');
        });
    }

    setLoading(btn, loading) {
        if (!btn) return;

        if (loading) {
            btn.classList.add('loading');
            btn.disabled = true;
        } else {
            btn.classList.remove('loading');
            btn.disabled = false;
        }
    }

    showUserInfo() {
        const userNameEl = document.getElementById('userName');
        const userEmailEl = document.getElementById('userEmail');
        const userInfoEl = document.getElementById('userInfo');

        if (userNameEl) {
            userNameEl.textContent = `Welcome, ${this.currentUser.name}!`;
        }
        if (userEmailEl) {
            userEmailEl.textContent = this.currentUser.email;
        }

        // Hide forms, show user info
        document.querySelectorAll('.auth-form').forEach(form => {
            form.style.display = 'none';
        });
        const authTabs = document.querySelector('.auth-tabs');
        if (authTabs) {
            authTabs.style.display = 'none';
        }
        if (userInfoEl) {
            userInfoEl.classList.add('show');
        }
    }

    checkAuthStatus() {
        try {
            const authData = JSON.parse(sessionStorage.getItem('tailorAuth') || '{}');
            if (authData.user) {
                this.currentUser = authData.user;
                this.showUserInfo();
            }
        } catch (error) {
            console.error('Error checking auth status:', error);
        }
    }

    saveAuthStatus() {
        try {
            sessionStorage.setItem('tailorAuth', JSON.stringify({
                user: this.currentUser,
                loginTime: new Date().toISOString()
            }));
        } catch (error) {
            console.error('Error saving auth status:', error);
        }
    }

    loadUsers() {
        try {
            const users = JSON.parse(localStorage.getItem('tailorUsers') || '[]');
            return users;
        } catch (error) {
            console.error('Error loading users:', error);
            return [];
        }
    }

    saveUsers() {
        try {
            localStorage.setItem('tailorUsers', JSON.stringify(this.users));
        } catch (error) {
            console.error('Error saving users:', error);
        }
    }

    notifyParent(action, user) {
        // Send message to parent window if in iframe or opener
        if (window.opener) {
            window.opener.postMessage({
                type: 'auth',
                action,
                user: { id: user.id, name: user.name, email: user.email }
            }, '*');
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Global logout function
function logout() {
    try {
        sessionStorage.removeItem('tailorAuth');
        location.reload();
    } catch (error) {
        console.error('Error during logout:', error);
    }
}

// Initialize auth system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const authSystem = new AuthSystem();

    // Make it globally available for debugging
    window.authSystem = authSystem;
});

// Handle messages from parent window
window.addEventListener('message', (event) => {
    if (event.data.type === 'checkAuth') {
        try {
            const authData = JSON.parse(sessionStorage.getItem('tailorAuth') || '{}');
            event.source.postMessage({
                type: 'authStatus',
                authenticated: !!authData.user,
                user: authData.user
            }, event.origin);
        } catch (error) {
            console.error('Error handling message:', error);
        }
    }
});