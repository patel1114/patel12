const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../models/db2');

const router = express.Router();

// ✅ Render Login Page
router.get('/login', (req, res) => {
    res.render('login', { error: null });
});

// ✅ Handle Login Form Submission
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const [rows] = await db.query('SELECT * FROM admins WHERE username = ?', [username]);

        // console.log('DB query result:', rows);

        if (rows.length === 0) {
            console.log('Username not found');
            return res.render('login', { error: 'Invalid username or password' });
        }

        const admin = rows[0];

        // ✅ Compare hashed password
        const isMatch = await bcrypt.compare(password, admin.password_hash);
        console.log('Password match status:', isMatch);

        if (!isMatch) {
            console.log('Incorrect password');
            return res.render('login', { error: 'Invalid username or password' });
        }

        // ✅ Set session for admin
        req.session.admin = { id: admin.id, username: admin.username, role: admin.role };
        console.log('Admin logged in successfully');

        // ✅ Redirect to admin dashboard
        res.redirect('/admin/dashboard');

    } catch (error) {
        console.error('Login error:', error);
        res.render('login', { error: 'Something went wrong. Please try again.' });
    }
});

// ✅ Logout Route
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).send('Error logging out');
        }
        res.redirect('/admin/login');
    });
});

module.exports = router;
