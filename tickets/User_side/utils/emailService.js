const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail", 
  secure:true,
  port:465,
  auth: {
    user: "piyushpatel10012@gmail.com",
    pass: "syao pwff bjmv kklx",
  }
});

exports.sendTicketEmail = async (email, fullName, ticketId, pdfPath) => {
  const reciver = {
    from: "piyushpatel10012@gmail.com",
    to: email,
    subject: `Your ticket ${ticketId}`,
    text: `Dear ${fullName},

Your ticket (ID: ${ticketId}) has been successfully created.

Please find your ticket details attached as PDF.

Thank You!`,
    attachments: [
      {
        filename: `ticket_${ticketId}.pdf`,
        path: pdfPath,
      }
    ]
  };

  // Return the promise from sendMail
  return transporter.sendMail(reciver);
};
