const nodemailer = require('nodemailer');

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'piyushpatel10012@gmail.com', // Your Gmail address
        pass: 'syao pwff bjmv kklx' // Your Gmail password or App Password
    }
});

// Function to send status update email
const sendStatusUpdateEmail = async (ticket, newStatus) => {
    try {
        const mailOptions = {
            from: 'piyushpatel10012@gmail.com',
            to: ticket.email,
            subject: `Ticket Status Update - ${ticket.ticketId}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2c3e50;">Ticket Status Update</h2>
                    <p>Dear ${ticket.fullName},</p>
                    <p>Your ticket has been updated with the following details:</p>
                    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
                        <p><strong>Ticket ID:</strong> ${ticket.ticketId}</p>
                        <p><strong>Subject:</strong> ${ticket.subject}</p>
                        <p><strong>New Status:</strong> <span style="color: ${getStatusColor(newStatus)}">${newStatus}</span></p>
                        <p><strong>Updated On:</strong> ${new Date().toLocaleString()}</p>
                    </div>
                    <p>You can view your ticket details by logging into the support portal.</p>
                    <p>Best regards,<br>Support Team</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`Status update email sent to ${ticket.email}`);
    } catch (error) {
        console.error('Error sending status update email:', error);
    }
};

// Helper function to get status color
const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
        case 'open':
            return '#28a745';
        case 'in progress':
            return '#ffc107';
        case 'closed':
            return '#dc3545';
        default:
            return '#6c757d';
    }
};

module.exports = {
    sendStatusUpdateEmail
}; 