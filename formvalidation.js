    // DOM Elements
    const emailField = document.getElementById('email-field');
    const passwordField = document.getElementById('password-field');
    const confirmPasswordField = document.getElementById('confirm-password-field');
    const emailMsg = document.getElementById('email-msg');
    const passwordMsg = document.getElementById('password-msg');
    const confirmPasswordMsg = document.getElementById('confirm-password-msg');

    // ======================
    // VALIDATION FUNCTIONS
    // ======================

    // 1. Email Format Validation
    function validateEmailFormat(email) {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const maxLength = 254;

    if (!regex.test(email)) {
        return { valid: false, message: "Invalid email format." };
    }
    if (email.length > maxLength) {
        return { valid: false, message: "Email is too long." };
    }
    if (email.includes("..") || email.startsWith(".") || email.endsWith(".")) {
        return { valid: false, message: "Invalid email (contains double dots or starts/ends with dot)." };
    }
    return { valid: true, message: "Valid email." };
    }

    // 2. Real Email Check (Using AbstractAPI)
    async function validateRealEmail(email) {
    const apiKey = "15c3de8140894c659f7668bc22acdca8"; // ← Replace with your actual key!
    const apiUrl = `https://emailvalidation.abstractapi.com/v1/?api_key=${apiKey}&email=${email}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (data.deliverability === "DELIVERABLE") {
        return { valid: true, message: "Email is valid and exists." };
        } else {
        return { valid: false, message: "This email does not exist or cannot receive mail." };
        }
    } catch (error) {
        console.error("API Error:", error);
        return { valid: false, message: "Validation service unavailable. Please try later." };
    }
    }

    // 3. Password Validation
    function validatePassword(password) {
    const minLength = 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
        return { valid: false, message: "Password must be at least 8 characters." };
    }
    if (!hasUpper) {
        return { valid: false, message: "Password needs at least one uppercase letter." };
    }
    if (!hasLower) {
        return { valid: false, message: "Password needs at least one lowercase letter." };
    }
    if (!hasNumber) {
        return { valid: false, message: "Password needs at least one number." };
    }
    if (!hasSpecial) {
        return { valid: false, message: "Password needs at least one special character." };
    }
    return { valid: true, message: "Strong password!" };
    }

    // ======================
    // REAL-TIME VALIDATION
    // ======================

    // Email Field
    emailField?.addEventListener('input', async function() {
    const email = this.value;
    const formatResult = validateEmailFormat(email);
    
    if (!formatResult.valid) {
        emailMsg.textContent = formatResult.message;
        emailMsg.style.color = "red";
        return;
    }
    
    emailMsg.textContent = "Checking email...";
    emailMsg.style.color = "blue";
    
    const realEmailResult = await validateRealEmail(email);
    emailMsg.textContent = realEmailResult.message;
    emailMsg.style.color = realEmailResult.valid ? "green" : "red";
    });

    // Password Field
    passwordField?.addEventListener('input', function() {
    const result = validatePassword(this.value);
    passwordMsg.textContent = result.message;
    passwordMsg.style.color = result.valid ? "green" : "red";
    });

    // Confirm Password Field
    confirmPasswordField?.addEventListener('input', function() {
    const password = passwordField.value;
    const confirmPassword = this.value;
    
    if (password === confirmPassword) {
        confirmPasswordMsg.textContent = "Passwords match!";
        confirmPasswordMsg.style.color = "green";
    } else {
        confirmPasswordMsg.textContent = "Passwords do not match!";
        confirmPasswordMsg.style.color = "red";
    }
    });

    // ======================
    // FORM SUBMISSION
    // ======================

    // Registration Form Handler
    document.getElementById('signupForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const userData = {
        firstName: document.getElementById('firstName-field').value,
        lastName: document.getElementById('lastName-field').value,
        email: document.getElementById('email-field').value,
        password: document.getElementById('password-field').value,
        confirmPassword: document.getElementById('confirm-password-field').value
        };
    
        // Simple validation
        if (userData.password !== userData.confirmPassword) {
        alert("Passwords don't match!");
        return;
        }
    
        try {
        const response = await fetch('http://localhost:3001/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
    
        const result = await response.json();
        
        if (response.ok) {
            // Store user data and redirect
            localStorage.setItem('currentUser', JSON.stringify(result.user));
            window.location.href = 'dashboard.html';
        } else {
            throw new Error(result.error || 'Registration failed');
        }
        } catch (error) {
        alert(error.message);
        }
    });
    
    // Login Form Handler (for Signin.html)
    document.getElementById('emailForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Get values using the original IDs
        const credentials = {
            email: document.getElementById('email-field').value,
            password: document.getElementById('password-field').value
        };
    
        // Reuse existing validation
        const emailResult = validateEmailFormat(credentials.email);
        if (!emailResult.valid) {
            alert(emailResult.message);
            return;
        }
    
        try {
            const response = await fetch('http://localhost:3001/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });
    
            const result = await response.json();
            
            if (response.ok) {
                const result = await response.json();
                
                // Store minimal required user data
                localStorage.setItem('currentUser', JSON.stringify({
                    id: result.user.id,
                    email: result.user.email,
                    firstName: result.user.firstName,
                    lastActive: Date.now() // Track session freshness
                }));
                
                window.location.href = 'dashboard.html';
            } else {
                throw new Error(result.error || 'Invalid credentials');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert(error.message);
        }
    });