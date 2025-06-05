const express = require("express");
const router = express.Router();
const { getAdmins, addAdmin, deleteAdmin, getManageAdmins } = require("../controllers/adminController");

// Get all admins
router.get("/superadmin/admins", getAdmins);

// Manage Support Agents Page
router.get("/superadmin/manage-admins", getManageAdmins);

// Add new admin
router.post("/superadmin/add-admin", addAdmin);

// Delete an admin
router.post("/superadmin/delete-admin/:id", deleteAdmin);

module.exports = router;
