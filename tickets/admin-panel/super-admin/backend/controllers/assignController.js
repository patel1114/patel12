const db = require("../config/db");

// Get all unassigned tickets and admins
exports.getManageTickets = async (req, res) => {
    console.log("getManageTickets called");
    console.log("Session info:", req.session);
    
    if (!req.session.superadmin) {
        console.log("No superadmin in session, redirecting to login");
        return res.redirect('/superadmin/login');
    }
    
    try {
        // Fetch unassigned tickets
        console.log("Fetching unassigned tickets...");
        const [tickets] = await db.query(`
            SELECT t.*, t.location
            FROM tickets t
            LEFT JOIN ticket_assignments ta ON t.id = ta.ticket_id
            WHERE ta.ticket_id IS NULL
            ORDER BY t.createdAt DESC
        `);
        console.log(`Found ${tickets.length} unassigned tickets`);
        
        // Fetch admins (excluding superadmins)
        console.log("Fetching admins...");
        const [admins] = await db.query(`
            SELECT a.*, a.location
            FROM admins a
            WHERE a.role != 'superadmin'
            ORDER BY a.username ASC
        `);
        console.log(`Found ${admins.length} admins`);

        res.render("manage-tickets-new", { 
            tickets, 
            admins
        });

    } catch (error) {
        console.error("Error fetching tickets and admins:", error);
        res.status(500).render("error", { 
            message: "Failed to load tickets and admins",
            error: error.message 
        });
    }
};

// Assign ticket to admin
exports.assignTicket = async (req, res) => {
    console.log("assignTicket called with body:", req.body);
    console.log("Session info:", req.session);
    
    if (!req.session.superadmin) {
        console.log("No superadmin in session, returning unauthorized");
        return res.status(401).json({ 
            success: false,
            message: 'Unauthorized - Please login' 
        });
    }
    
    const { ticketId, adminId } = req.body;
    
    if (!ticketId || !adminId) {
        console.log("Missing required fields");
        return res.status(400).json({ 
            success: false,
            message: 'Ticket ID and Admin ID are required' 
        });
    }

    try {
        // Check if ticket exists
        console.log(`Checking if ticket ${ticketId} exists...`);
        const [tickets] = await db.query(
            'SELECT * FROM tickets WHERE id = ?',
            [ticketId]
        );

        if (tickets.length === 0) {
            console.log(`Ticket ${ticketId} not found`);
            return res.status(404).json({ 
                success: false,
                message: 'Ticket not found' 
            });
        }
        console.log(`Ticket ${ticketId} found`);

        // Check if admin exists and is not a superadmin
        console.log(`Checking if admin ${adminId} exists...`);
        const [admins] = await db.query(
            'SELECT * FROM admins WHERE id = ? AND role != "superadmin"',
            [adminId]
        );

        if (admins.length === 0) {
            console.log(`Admin ${adminId} not found or is a superadmin`);
            return res.status(404).json({ 
                success: false,
                message: 'Admin not found or is a superadmin' 
            });
        }
        console.log(`Admin ${adminId} found`);

        // Check if ticket is already assigned
        console.log(`Checking if ticket ${ticketId} is already assigned...`);
        const [existingAssignments] = await db.query(
            'SELECT * FROM ticket_assignments WHERE ticket_id = ?',
            [ticketId]
        );

        if (existingAssignments.length > 0) {
            console.log(`Ticket ${ticketId} is already assigned`);
            return res.status(400).json({ 
                success: false,
                message: 'Ticket is already assigned' 
            });
        }
        console.log(`Ticket ${ticketId} is not already assigned`);

        // Create assignment record
        console.log(`Creating assignment record for ticket ${ticketId} and admin ${adminId}...`);
        await db.query(
            'INSERT INTO ticket_assignments (ticket_id, admin_id, assigned_by, assigned_at) VALUES (?, ?, ?, NOW())',
            [ticketId, adminId, req.session.superadmin.id]
        );
        console.log(`Assignment record created successfully`);

        return res.status(200).json({ 
            success: true,
            message: 'Ticket assigned successfully',
            ticketId,
            adminId
        });
    } catch (error) {
        console.error('Error assigning ticket:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Error assigning ticket',
            error: error.message
        });
    }
};