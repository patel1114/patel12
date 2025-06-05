const db = require("../config/db");

exports.superadminLogin = async (req, res) => {
    const { email, password } = req.body;
    try {
        // ✅ Find superadmin in DB
        const [result] = await db.query(
            "SELECT * FROM admins WHERE email = ? AND role = 'superadmin'",
            [email]
        );

        if (result.length === 0) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const superadmin = result[0];

        // ✅ Store superadmin in session with all necessary information
        req.session.superadmin = { 
            id: superadmin.id, 
            email: superadmin.email,
            username: superadmin.username,
            is_superadmin: 1
        };
        console.log("Superadmin session created:", req.session.superadmin);

        res.redirect("/superadmin/dashboard"); // Redirect to dashboard
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// ✅ Logout function
exports.superadminLogout = (req, res) => {
    req.session.destroy(() => {
        res.redirect("/superadmin/login");
    });
};
