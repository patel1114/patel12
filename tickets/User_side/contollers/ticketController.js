const mysql = require("mysql2/promise");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const crypto = require("crypto");
const db = require("../db");
const { sendTicketEmail } = require("../utils/emailService");
const path = require('path');
const { assignAdmin } = require('../../admin-panel/admin/backend/controllers/ticketController');

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
        
        // Create directory if it doesn't exist
        const pdfDir = path.join(__dirname, "..", "GeneratedTicket");
        if (!fs.existsSync(pdfDir)) {
            fs.mkdirSync(pdfDir, { recursive: true });
        }
        
        // Create PDF file path
        const pdfPath = path.join(pdfDir, `${ticketData.ticketId}.pdf`);
        
        // Create a new PDF document
        const doc = new PDFDocument();
        
        // Pipe the PDF to a file
        doc.pipe(fs.createWriteStream(pdfPath));
        
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
        
        // Finalize the PDF
        doc.end();
        
        console.log("PDF generated successfully at:", pdfPath);
        return pdfPath;
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

        await db.query(query, params);
        console.log("Ticket created successfully in database");

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
        
        // Create a new PDF document
        const doc = new PDFDocument();
        
        // Pipe the PDF directly to the response
        doc.pipe(res);
        
        // Add content to the PDF
        doc.fontSize(20).text('Atul Limited - Support Ticket', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Ticket ID: ${ticket.ticketId}`);
        doc.text(`Full Name: ${ticket.fullName}`);
        doc.text(`Email: ${ticket.email}`);
        doc.text(`Type: ${ticket.type}`);
        doc.text(`Location: ${ticket.location}`);
        doc.text(`Telephone: ${ticket.telephone}`);
        doc.text(`Help Topic: ${ticket.helpTopic}`);
        doc.text(`Subject: ${ticket.subject}`);
        doc.moveDown();
        doc.text('Message:');
        doc.text(ticket.message);
        doc.moveDown();
        doc.text(`Created At: ${new Date(ticket.createdAt).toLocaleString()}`);
        doc.text(`Status: ${ticket.status}`);
        
        // Finalize the PDF
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
                tickets: []
            });
        }

        const query = `
            SELECT 
                ticketId,
                status,
                type as subject,
                message,
                createdAt
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
                tickets: []
            });
        }

        res.render('status', { tickets });
    } catch (error) {
        console.error('Database error:', error);
        res.render('status', { 
            error: 'An error occurred while fetching your tickets.',
            tickets: []
        });
    }
};