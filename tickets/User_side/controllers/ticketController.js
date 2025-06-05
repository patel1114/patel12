const mysql = require("mysql2/promise");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const crypto = require("crypto");
const db = require("../db");
const { sendTicketEmail } = require("../utils/emailService");
const path = require('path');
const { assignAdmin } = require('../../admin-panel/admin/backend/controllers/ticketController');

// Find available admin based on location
async function findAvailableAdminByLocation(location) {
    try {
        console.log(`Finding available admin for location: ${location}`);
        
        // First try to find an admin with the same location who has the least number of assigned tickets
        const query = `
            SELECT a.*, COUNT(ta.ticket_id) as assigned_tickets
            FROM admins a
            LEFT JOIN ticket_assignments ta ON a.id = ta.admin_id
            WHERE a.location = ?
            GROUP BY a.id
            ORDER BY assigned_tickets ASC
            LIMIT 1
        `;
        
        const [admins] = await db.query(query, [location]);
        
        if (admins.length > 0) {
            console.log(`Found admin with matching location: ${admins[0].username}`);
            return admins[0];
        }
        
        // If no admin found with matching location, find any available admin
        console.log(`No admin found with location ${location}, searching for any available admin`);
        const fallbackQuery = `
            SELECT a.*, COUNT(ta.ticket_id) as assigned_tickets
            FROM admins a
            LEFT JOIN ticket_assignments ta ON a.id = ta.admin_id
            GROUP BY a.id
            ORDER BY assigned_tickets ASC
            LIMIT 1
        `;
        
        const [fallbackAdmins] = await db.query(fallbackQuery);
        
        if (fallbackAdmins.length > 0) {
            console.log(`Found fallback admin: ${fallbackAdmins[0].username}`);
            return fallbackAdmins[0];
        }
        
        console.log('No available admins found');
        return null;
    } catch (error) {
        console.error('Error finding available admin:', error);
        return null;
    }
}

// Generate a unique Ticket ID
async function generateUniqueTicketId() {
    let isUnique = false;
    let ticketId;

    while (!isUnique) {
        ticketId = `TICKET-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
        const [rows] = await db.execute("SELECT id FROM tickets WHERE ticketId = ?", [ticketId]);

        if (rows.length === 0) {
            isUnique = true;
        }
    }
    return ticketId;
}

// Generate PDF ticket
async function generateTicketPDF(ticketData) {
    try {
        console.log("Generating PDF for ticket:", ticketData.ticketId);
        
        // Create a new PDF document
        const doc = new PDFDocument();
        
        // Add content to the PDF
        doc.fontSize(20).text('Atul Limited - Support Ticket', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Ticket ID: ${ticketData.ticketId}`);
        doc.text(`Full Name: ${ticketData.fullName}`);
        doc.text(`Email: ${ticketData.email}`);
        doc.text(`Type: ${ticketData.type}`);
        doc.text(`Location: ${ticketData.location}`);
        doc.text(`Telephone: ${ticketData.telephone}`);
        doc.text(`Help Topic: ${ticketData.helpTopic}`);
        doc.text(`Subject: ${ticketData.subject}`);
        doc.moveDown();
        doc.text('Message:');
        doc.text(ticketData.message);
        doc.moveDown();
        doc.text(`Created At: ${new Date().toLocaleString()}`);
        
        return doc;
    } catch (error) {
        console.error("Error generating PDF:", error);
        throw error;
    }
}

exports.createTicket = async (req, res) => {
    try {
        console.log("Form data received:", req.body);
        console.log("Files received:", req.files);
        
        const { fullName, type, location, telephone, helpTopic, subject, message } = req.body;
        const email = req.session.email; // Get email from session
        
        console.log("Extracted data:", { fullName, type, location, telephone, helpTopic, subject, message, email });

        if (!email) {
            return res.status(400).json({ error: 'Email not found in session. Please log in again.' });
        }
        
        if (!fullName || !type || !location || !telephone || !helpTopic || !subject || !message) {
            return res.status(400).json({ error: 'All required fields must be provided' });
        }

        // Generate unique ticket ID
        const ticketId = await generateUniqueTicketId();
        console.log("Generated ticket ID:", ticketId);

        // Create ticket in database
        const query = `
            INSERT INTO tickets (ticketId, fullName, email, type, location, telephone, helpTopic, subject, message, status, assigned, createdAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Open', 'No', NOW())
        `;

        const params = [ticketId, fullName, email, type, location, telephone, helpTopic, subject, message];
        console.log("SQL query:", query);
        console.log("Parameters:", params);

        const [result] = await db.query(query, params);
        console.log("Ticket created successfully in database with ID:", result.insertId);

        // Find and assign admin based on location
        const admin = await findAvailableAdminByLocation(location);
        if (admin) {
            console.log(`Automatically assigning ticket ${result.insertId} to admin ${admin.username}`);
            
            // Create assignment record
            await db.query(
                'INSERT INTO ticket_assignments (ticket_id, admin_id, assigned_by, assigned_at) VALUES (?, ?, ?, NOW())',
                [result.insertId, admin.id, admin.id] // Using admin's own ID as assigned_by for automatic assignments
            );

            // Update ticket assignment
            await db.query(
                'UPDATE tickets SET assigned = "Yes", assigned_admin_id = ? WHERE id = ?',
                [admin.id, result.insertId]
            );

            console.log(`Ticket ${result.insertId} automatically assigned to admin ${admin.username}`);
        } else {
            console.log(`No available admin found for ticket ${result.insertId}, leaving unassigned`);
        }

        // Generate PDF for the ticket
        const ticketData = {
            ticketId,
            fullName,
            email,
            type,
            location,
            telephone,
            helpTopic,
            subject,
            message
        };
        
        // Send email to user
        try {
            await sendTicketEmail(email, fullName, ticketId);
            console.log("Ticket confirmation email sent successfully");
        } catch (emailError) {
            console.error("Error sending ticket confirmation email:", emailError);
            // Continue with the response even if email fails
        }

        res.redirect(`/success?ticketId=${ticketId}`);
    } catch (error) {
        console.error('Error creating ticket:', error);
        res.status(500).json({ error: 'Failed to create ticket' });
    }
};

exports.downloadTicket = async (req, res) => {
    try {
        console.log("Download route hit");
        const { ticketId } = req.params;  // Get ticket ID from request
        console.log(`Received TicketID: ${ticketId}`);
        
        // Get ticket data from database
        const [tickets] = await db.execute("SELECT * FROM tickets WHERE ticketId = ?", [ticketId]);
        
        if (tickets.length === 0) {
            console.error(`Ticket not found: ${ticketId}`);
            return res.status(404).json({ message: "Ticket not found" });
        }
        
        const ticket = tickets[0];
        console.log("Ticket data retrieved:", ticket);
        
        // Set response headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${ticketId}.pdf`);
        
        // Generate and stream PDF directly to response
        const doc = await generateTicketPDF(ticket);
        doc.pipe(res);
        doc.end();
        
        console.log("PDF streamed successfully");
    } catch (error) {
        console.error('Error in downloading the ticket:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.checkTicketStatus = async (req, res) => {
    try {
        console.log('Session:', req.session);
        const email = req.session.email;
        console.log('Email from session:', email);

        if (!email) {
            console.log('No email found in session');
            return res.render('status', { 
                error: 'Please log in to view your tickets',
                tickets: [],
                message: null
            });
        }

        const query = `
            SELECT 
                ticketId,
                type as subject,
                location,
                status,
                fullName
            FROM tickets 
            WHERE email = ?
            ORDER BY createdAt DESC
        `;
        
        console.log('Executing query:', query);
        console.log('Query parameters:', [email]);
        
        const [tickets] = await db.query(query, [email]);
        console.log('Query results:', tickets);
        console.log('Number of tickets found:', tickets.length);

        if (tickets.length === 0) {
            console.log('No tickets found for email:', email);
            return res.render('status', { 
                message: 'No tickets found for your email address.',
                tickets: [],
                error: null
            });
        }

        res.render('status', { 
            tickets,
            error: null,
            message: null
        });
    } catch (error) {
        console.error('Database error:', error);
        res.render('status', { 
            error: 'An error occurred while fetching your tickets.',
            tickets: [],
            message: null
        });
    }
}; 