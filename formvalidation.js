// Function to validate email format
function validateEmail(email) {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const maxLength = 254;
  
    if (!regex.test(email)) {
      return { valid: false, message: "Invalid email format." };
    }
  
    if (email.length > maxLength) {
      return { valid: false, message: "Email exceeds maximum length of 254 characters." };
    }
  
    if (email.includes("..") || email.startsWith(".") || email.endsWith(".")) {
      return { valid: false, message: "Email contains common mistakes such as double dots or starts/ends with a dot." };
    }
  
    return { valid: true, message: "Valid email." };
  }
  
  // Function to validate password
  function validatePassword(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
    if (password.length < minLength) {
      return { valid: false, message: `Password must be at least ${minLength} characters long.` };
    }
  
    if (!hasUpperCase) {
      return { valid: false, message: "Password must contain at least one uppercase letter." };
    }
  
    if (!hasLowerCase) {
      return { valid: false, message: "Password must contain at least one lowercase letter." };
    }
  
    if (!hasNumbers) {
      return { valid: false, message: "Password must contain at least one number." };
    }
  
    if (!hasSpecialChars) {
      return { valid: false, message: "Password must contain at least one special character." };
    }
  
    return { valid: true, message: "Valid password." };
  }
  
  // Function to validate email existence using your Node.js backend
  async function validateEmailExistence(email) {
    try {
      // Call your Node.js backend
      const response = await fetch('http://localhost:3001/validate-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email }) // Send the email to the backend
      });
  
      // Parse the response from the backend
      const data = await response.json();
  
      // Check if the email is valid
      if (data.valid) {
        return { valid: true, message: "Valid email." };
      } else {
        return { valid: false, message: data.message };
      }
    } catch (error) {
      console.error('Error validating email:', error);
      return { valid: false, message: "Failed to validate email. Please try again." };
    }
  }
  
  // Real-time validation for email field
  document.getElementById('email-field')?.addEventListener('input', function () {
    const email = this.value;
    const emailResult = validateEmail(email);
    const emailMsg = document.getElementById('email-msg');
  
    if (emailResult.valid) {
      emailMsg.textContent = "Valid email";
      emailMsg.style.color = "green";
    } else {
      emailMsg.textContent = "Invalid email: " + emailResult.message;
      emailMsg.style.color = "red";
    }
  });
  
  // Real-time validation for password field
  document.getElementById('password-field')?.addEventListener('input', function () {
    const password = this.value;
    const passwordResult = validatePassword(password);
    const passwordMsg = document.getElementById('password-msg');
  
    if (passwordResult.valid) {
      passwordMsg.textContent = "Valid password";
      passwordMsg.style.color = "green";
    } else {
      passwordMsg.textContent = "Invalid password: " + passwordResult.message;
      passwordMsg.style.color = "red";
    }
  });
  
  // Real-time validation for confirm password field
  document.getElementById('confirm-password-field')?.addEventListener('input', function () {
    const password = document.getElementById('password-field').value;
    const confirmPassword = this.value;
    const confirmPasswordMsg = document.getElementById('confirm-password-msg');
  
    if (!confirmPasswordMsg) {
      console.error('Confirm password message element not found!');
      return;
    }
  
    if (password === confirmPassword) {
      confirmPasswordMsg.textContent = "Passwords match";
      confirmPasswordMsg.style.color = "green";
    } else {
      confirmPasswordMsg.textContent = "Passwords do not match";
      confirmPasswordMsg.style.color = "red";
    }
  });
  
  // Handle sign-up form submission
  document.getElementById('signupForm')?.addEventListener('submit', async function (event) {
    event.preventDefault();
  
    const firstName = document.getElementById('firstName-field').value;
    const lastName = document.getElementById('lastName-field').value;
    const email = document.getElementById('email-field').value;
    const password = document.getElementById('password-field').value;
    const confirmPassword = document.getElementById('confirm-password-field').value;
  
    // Validate password match
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
  
    // Validate email format
    const emailResult = validateEmail(email);
    if (!emailResult.valid) {
      alert('Invalid email: ' + emailResult.message);
      return;
    }
  
    // Check if email exists in the real world
    const emailExistenceResult = await validateEmailExistence(email);
    if (!emailExistenceResult.valid) {
      alert('Email validation failed: ' + emailExistenceResult.message);
      return;
    }
  
    // Check if email already exists in db.json
    fetch('http://localhost:3000/users')
      .then(response => response.json())
      .then(users => {
        const emailExists = users.some(u => u.email === email);
        if (emailExists) {
          alert('Email already registered. Please use a different email.');
        } else {
          // Proceed with registration
          const newUser = {
            firstName,
            lastName,
            email,
            password
          };
  
          fetch('http://localhost:3000/users', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(newUser)
          })
            .then(response => {
              if (!response.ok) {
                throw new Error('Network response was not ok');
              }
              return response.json();
            })
            .then(data => {
              console.log('User created:', data); // Debugging
              alert('Sign-up successful!');
              window.location.href = 'dashboard.html';
            })
            .catch(error => {
              console.error('Error creating user:', error);
              alert('Failed to create user. Please try again.');
            });
        }
      })
      .catch(error => {
        console.error('Error fetching users:', error);
        alert('Failed to check email availability. Please try again.');
      });
  });
  
  // Theme toggle functionality
  const themeToggle = document.getElementById('theme-toggle-checkbox');
  
  if (themeToggle) {
    themeToggle.addEventListener('change', function () {
      const theme = this.checked ? 'dark' : 'light';
      localStorage.setItem('theme', theme);
      applyTheme(theme);
    });
  
    function applyTheme(theme) {
      document.body.classList.toggle('dark-theme', theme === 'dark');
    }
  
    // Apply saved theme on page load
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);
    themeToggle.checked = savedTheme === 'dark';
  }
  