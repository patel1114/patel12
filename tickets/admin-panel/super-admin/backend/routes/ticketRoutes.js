const express = require("express");
const router = express.Router();
const { getTickets, deleteClosedTickets } = require("../controllers/ticketController");

// Get all tickets
router.get("/superadmin/tickets", getTickets);

// Delete closed tickets
router.delete("/superadmin/delete-ticket/:id", deleteClosedTickets);

module.exports = router;
