const db = require('../models/db2')



//Fetch tickets assigned to logged-in admin
const getAssignedTickets = async (adminId) => {
    try {
        const [tickets] = await db.query(
            `SELECT t.*, ta.assigned_by
             FROM tickets t
             JOIN ticket_assignments ta ON t.id = ta.ticket_id
             WHERE ta.admin_id = ?`, [adminId]
        );
        console.log("Assigned Tickets for Admin:", tickets);
        return tickets;
    } catch (error) {
        console.error('Error fetching assigned tickets:', error);
        return [];
    }
};  

// This function is now only used for manual assignments through the superadmin panel
const assignAdmin = async (ticketId, adminId) => {
    try {
        // Check if ticket exists and is unassigned
        const [tickets] = await db.query(
            'SELECT * FROM tickets WHERE id = ? AND status = "Unassigned"',
            [ticketId]
        );

        if (tickets.length === 0) {
            console.log(`❌ Ticket ${ticketId} not found or already assigned`);
            return null;
        }

        // Check if admin exists and is not a superadmin
        const [admins] = await db.query(
            'SELECT * FROM admins WHERE id = ? AND role != "superadmin"',
            [adminId]
        );

        if (admins.length === 0) {
            console.log(`❌ Admin ${adminId} not found or is a superadmin`);
            return null;
        }

        // Assign the ticket to the admin
        await db.query(
            `INSERT INTO ticket_assignments (ticket_id, admin_id, assigned_at) VALUES (?, ?, NOW())`,
            [ticketId, adminId]
        );

        // Update ticket status
        await db.query(
            'UPDATE tickets SET status = "Assigned" WHERE id = ?',
            [ticketId]
        );

        console.log(`✅ Ticket ${ticketId} assigned to Admin ID: ${adminId}`);
        return adminId;
    } catch (error) {
        console.error("❌ Error assigning admin:", error);
        return null;
    }
};


module.exports = {getAssignedTickets,assignAdmin}