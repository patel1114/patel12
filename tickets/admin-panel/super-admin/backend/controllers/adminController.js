const db = require("../config/db");
const bcrypt = require('bcrypt')
// Get all admins
exports.getAdmins = async (req, res) => {
    try {
        const [admins] = await db.query("SELECT id,username,location FROM admins WHERE role != 'superadmin'");
        res.render('view-admins',{admins})
        } catch (error) {
        console.error("Error fetching admins:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// Render Manage Admins Page
exports.getManageAdmins = async (req, res) => {
    try {
        const [admins] = await db.query("SELECT id, email,username, location FROM admins WHERE role != 'superadmin'");
        res.render('manage-admins', { admins });
    } catch (error) {
        console.error("Error loading Manage Admins page:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// Add new admin
exports.addAdmin = async (req, res) => {
    const { username, email, password,location } = req.body;
    try {

        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password,saltRounds)
        await db.query("INSERT INTO admins (username, email, password_hash,location) VALUES (?, ?, ?,?)", [username, email,passwordHash, location]);
        res.json({ message: "Support Agent added successfully" });
    } catch (error) {
        console.error("Error adding admin:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// Delete an admin
// exports.deleteAdmin = async (req, res) => {
//     const { id } = req.params;
//     try {
//         await db.query("DELETE FROM admins WHERE id = ?", [id]);
//         res.redirect("/superadmin/admins?message=Admin deleted successfully");
//     } catch (error) {
//         console.error("Error deleting admin:", error);
//         res.redirect("/superadmin/admins?error=Failed to delete admin");
//     }
// };

exports.deleteAdmin = async (req, res) => {
    const { id } = req.params;
    
    try {
        // Assuming you have a database connection and an Admin model/table
        const result = await db.query("DELETE FROM admins WHERE id = ?", [id]);

        if (result.affectedRows > 0) {
            return res.status(200).json({ success: true, message: "Admin deleted successfully." });
        } else {
            return res.status(404).json({ success: false, message: "Admin not found." });
        }
    } catch (error) {
        console.error("Error deleting admin:", error);
        return res.status(500).json({ success: false, message: "An error occurred while deleting the admin." });
    }
};



// module.exports = {deleteAdmin}