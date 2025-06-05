const db = require('../db');
const bcrypt = require('bcrypt');

// Register a new user
const registerUser = async (req, res) => {
    try {
        const { fullName, email, password, confirmPassword } = req.body;
        
        // Validate input
        if (!fullName || !email || !password || !confirmPassword) {
            return res.render('login', { 
                error: 'All fields are required',
                showRegisterForm: true
            });
        }
        
        // Check if passwords match
        if (password !== confirmPassword) {
            return res.render('login', { 
                error: 'Passwords do not match',
                showRegisterForm: true
            });
        }
        
        // Check if user already exists
        const checkUserQuery = 'SELECT * FROM users WHERE email = ?';
        const [existingUsers] = await db.query(checkUserQuery, [email]);
        
        if (existingUsers.length > 0) {
            return res.render('login', { 
                error: 'Email already registered',
                showRegisterForm: true
            });
        }
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Insert new user
        const insertUserQuery = 'INSERT INTO users (fullName, email, password_hash) VALUES (?, ?, ?)';
        await db.query(insertUserQuery, [fullName, email, hashedPassword]);
        
        // Set email in session
        req.session.email = email;
        
        // Redirect to login with success message
        return res.render('login', { 
            success: 'Registration successful! Please login.',
            showRegisterForm: false
        });
        
    } catch (error) {
        console.error('Registration error:', error);
        return res.render('login', { 
            error: 'An error occurred during registration. Please try again.',
            showRegisterForm: true
        });
    }
};

// Login user
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Validate input
        if (!email || !password) {
            return res.render('login', { 
                error: 'Email and password are required',
                showRegisterForm: false
            });
        }
        
        // Check if user exists
        const getUserQuery = 'SELECT * FROM users WHERE email = ?';
        const [users] = await db.query(getUserQuery, [email]);
        
        if (users.length === 0) {
            return res.render('login', { 
                error: 'Invalid email or password',
                showRegisterForm: false
            });
        }
        
        const user = users[0];
        
        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        
        if (!isPasswordValid) {
            return res.render('login', { 
                error: 'Invalid email or password',
                showRegisterForm: false
            });
        }
        
        // Set user session
        req.session.user = {
            id: user.id,
            fullName: user.fullName,
            email: user.email
        };
        
        // Set email in session for ticket creation
        req.session.email = user.email;
        
        // Redirect to index.html
        return res.redirect('/index.html');
        
    } catch (error) {
        console.error('Login error:', error);
        return res.render('login', { 
            error: 'An error occurred during login. Please try again.',
            showRegisterForm: false
        });
    }
};

// Logout user
const logoutUser = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        return res.redirect('/');
    });
};

module.exports = {
    register: registerUser,
    login: loginUser,
    logout: logoutUser
}; 