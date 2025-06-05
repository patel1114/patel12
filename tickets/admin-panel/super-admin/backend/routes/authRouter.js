const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// ✅ Render Superadmin Login Page
router.get("/superadmin/login", (req, res) => {
    res.render("superadmin-login", { error: null });
});

// ✅ Handle Superadmin Login
router.post("/superadmin/login", authController.superadminLogin);

// ✅ Handle Logout
router.get("/superadmin/logout", authController.superadminLogout);

// Dashboard route
router.get("/superadmin/dashboard", (req, res) => {
    if (!req.session.superadmin) {
        return res.redirect("/superadmin/login"); // ✅ Redirect if not logged in
    }
    res.render("dashboard"); // ✅ Ensure dashboard.ejs exists in /views
});

module.exports = router;
