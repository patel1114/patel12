const db = require("./config/db"); // Database connection
const bcrypt = require("bcrypt");

const superadminData = {
    username: "superadmin",
    email: "superadmin@example.com",
    password: "superadmin123", // Will be hashed before saving
    role: "superadmin"
};

// ✅ Insert Superadmin into `admins` table
async function addSuperadmin() {
    try {
        // Check if superadmin already exists
        const [existing] = await db.query("SELECT * FROM admins WHERE role = 'superadmin'");

        if (existing.length > 0) {
            console.log("❌ Superadmin already exists.");
            return;
        }

        // Hash password before storing
        const hashedPassword = await bcrypt.hash(superadminData.password, 10);

        // Insert new superadmin
        await db.query(
            "INSERT INTO admins (username, email, password_hash, role) VALUES (?, ?, ?, ?)",
            [superadminData.username, superadminData.email, hashedPassword, superadminData.role]
        );

        console.log("✅ Superadmin added successfully!");
    } catch (error) {
        console.error("❌ Error adding superadmin:", error);
    } finally {
        process.exit(); // Exit script
    }
}

addSuperadmin();
