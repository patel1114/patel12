const express = require('express');
const db = require('../models/db2');
const router = express.Router();
const { getAssignedTickets } = require('../controllers/ticketController');
// const { get } = require('mongoose');

// Middleware to check if admin is logged in
function requireAdminAuth(req, res, next) {
    if (!req.session.admin) {
        return res.redirect('/admin/login');
    }
    next();
}

router.get('/dashboard', requireAdminAuth, async (req, res) => {
    try {

        const adminId = req.session.admin.id

        const tickets = await getAssignedTickets(adminId)

        const [totalTickets] = await db.query(
            `SELECT COUNT(*) AS count 
             FROM tickets t
             JOIN ticket_assignments ta ON t.id = ta.ticket_id
             WHERE ta.admin_id = ?`, 
            [adminId]
        );

        const [openTickets] = await db.query(
            `SELECT COUNT(*) AS count 
             FROM tickets t
             JOIN ticket_assignments ta ON t.id = ta.ticket_id
             WHERE ta.admin_id = ? AND t.status = 'open'`, 
            [adminId]
        );

        const [inProgressTickets] = await db.query(
            `SELECT COUNT(*) AS count 
             FROM tickets t
             JOIN ticket_assignments ta ON t.id = ta.ticket_id
             WHERE ta.admin_id = ? AND t.status = 'In Progress'`, 
            [adminId]
        );

        const [closedTickets] = await db.query(
            `SELECT COUNT(*) AS count 
             FROM tickets t
             JOIN ticket_assignments ta ON t.id = ta.ticket_id
             WHERE ta.admin_id = ? AND t.status = 'closed'`, 
            [adminId]
        );

        res.render('dashboard', {
            totalTickets: totalTickets[0].count,
            openTickets: openTickets[0].count,
            inProgressTickets: inProgressTickets[0].count,
            closedTickets: closedTickets[0].count,
            tickets: tickets
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching dashboard data');
    }
});

module.exports = router;
