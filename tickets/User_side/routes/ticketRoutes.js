// routes/ticketRoutes.js
const express = require("express");
const router = express.Router();
const ticketController = require("../controllers/ticketController");
const path = require('path');
// const { isAuthenticated } = require('../middleware/auth');

// Define routes
router.get('/', (req, res) => {
    // If user is logged in, redirect to index.html
    if (req.session.user) {
        return res.sendFile(path.join(__dirname, '../views', 'index.html'));
    }
    // Otherwise, show login page
    res.render('login', { error: null, success: null });
});

// Add login route handler
router.post('/login', (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        return res.render('login', { error: 'Email is required', success: null });
    }
    
    // Store email in session
    req.session.email = email;
    
    // Redirect to index.html after login
    res.sendFile(path.join(__dirname, '../views', 'index.html'));
});

// Add success route
router.get('/success', (req, res) => {
    res.render('success', { ticketId: req.query.ticketId });
});

// Show status check form and automatically check status using session email
router.get('/check-status', ticketController.checkTicketStatus);

// Get status for specific ticket
router.get('/status/:ticketId', ticketController.checkTicketStatus);

// Download ticket
router.get('/download/:ticketId', ticketController.downloadTicket);

// Create new ticket
router.post('/create-ticket', ticketController.createTicket);

module.exports = router;