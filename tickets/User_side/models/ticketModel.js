const db = require("../db");

const createTicket = async (ticketData) => {
    const { fullName, email, type, telephone, location,  subject, helpTopic, message, attachment,captcha,ticketId } = ticketData;

    const query = `
        INSERT INTO tickets 
        (ticketId, fullName, email, type, telephone, location,  subject, helpTopic, message, attachment, status,captcha, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Open', NOW())
    `;

    try {
        const [result] = await db.execute(query, [
            ticketId, fullName, email, type, telephone, location,  subject, helpTopic, message, attachment,captcha
        ]);
        return result;
    } catch (error) {
        console.error("Error inserting ticket:", error);
        throw error;
    }
};

module.exports = { createTicket };
