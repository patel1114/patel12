const express = require("express");
const router = express.Router();
const { assignTicket, getManageTickets } = require("../controllers/assignController");
const { isAuthenticated, isSuperAdmin } = require("../middleware/auth");

// Get all unassigned tickets and admins
router.get("/manage-tickets", isAuthenticated, isSuperAdmin, getManageTickets);

// Assign a ticket to an admin
router.post("/tickets", isAuthenticated, isSuperAdmin, assignTicket);

module.exports = router;
