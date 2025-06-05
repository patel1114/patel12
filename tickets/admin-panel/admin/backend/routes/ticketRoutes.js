const express = require('express');
const db = require('../models/db2');
const router = express.Router();
const { getAssignedTickets } = require('../controllers/ticketController');
const { sendStatusUpdateEmail } = require('../utils/emailServices');

// Middleware to check if admin is logged in
function requireAdminAuth(req, res, next) {
    if (!req.session.admin) {
        return res.redirect('/admin/login');
    }
    next();
}

// Tickets Page
router.get('/tickets', requireAdminAuth, async (req, res) => {
    try {
        const adminId = req.session.admin.id;
        const tickets = await getAssignedTickets(adminId);
        res.render('tickets', { tickets });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching tickets');
    }
});

// Ticket details page
router.get('/tickets/:id', requireAdminAuth, async (req, res) => {
    const ticketId = req.params.id;
    try {
        const [ticket] = await db.query(
            'SELECT * FROM tickets WHERE id = ?', [ticketId]
        );
        if (ticket.length === 0) {
            return res.status(400).send('Ticket not found');
        }
        res.render('ticket-details', { ticket: ticket[0], successMessage: null });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching ticket details');
    }
});

// Update ticket status
router.post('/tickets/update/:id', requireAdminAuth, async (req, res) => {
    const ticketId = req.params.id;
    const { status } = req.body;
    const adminId = req.session.admin ? req.session.admin.id : null;

    console.log("Received Update Request for Ticket:", ticketId);
    console.log("Request Body:", req.body);
    console.log("Admin Session Data:", req.session.admin);

    if (!adminId) {
        return res.status(403).send("Unauthorized: Admin not logged in.");
    }

    try {
        // Get ticket details first
        const [tickets] = await db.query(
            'SELECT * FROM tickets WHERE id = ?', [ticketId]
        );

        if (tickets.length === 0) {
            return res.status(404).send("Ticket not found");
        }

        const ticket = tickets[0];

        // Update ticket status
        await db.query(
            `UPDATE tickets SET status = ? WHERE id = ?`, [status, ticketId]
        );

        // Record the status update
        await db.query(
            `INSERT INTO ticket_updates (ticket_id, admin_id, status) VALUES (?, ?, ?)`,
            [ticketId, adminId, status]
        );

        // Send email notification to user
        try {
            await sendStatusUpdateEmail(ticket, status);
            console.log(`Status update email sent to ${ticket.email}`);
        } catch (emailError) {
            console.error("Error sending status update email:", emailError);
            // Continue with the response even if email fails
        }

        // Redirect back to ticket details with success message
        res.redirect(`/admin/tickets/${ticketId}?message=Status updated successfully`);
    } catch (error) {
        console.error("Error updating ticket:", error);
        res.redirect(`/admin/tickets/${ticketId}?error=Failed to update status`);
    }
});

            // ✅ Fetch user email from database
        // const [user] = await db.promise().query(
        //     `SELECT email FROM users WHERE id = (SELECT user_id FROM tickets WHERE id = ?)`, 
        //     [ticketId]
        // );

        // if (user.length > 0) {
        //     const userEmail = user[0].email;

        //     await sendEmail(userEmail, `Ticket #${ticketId} Updated`, 'ticketStatus', { ticketId, status });
        // }

        // router.get('/assigned', requireAdminAuth, async (req, res) => {
        //     const adminId = req.session.admin.id;
        //     const tickets = await getAssignedTickets(adminId);
        //     res.render('tickets', { tickets });
        // });
        

module.exports = router;
