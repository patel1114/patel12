const bcrypt = require('bcrypt');
const db = require('./models/db2'); // Ensure this points to your database connection

const username = 'admin3';
const email = 'admin3@example.com';
const plainPassword = 'admin1234'; // Set your actual password

bcrypt.hash(plainPassword, 10, (err, hash) => {
    if (err) {
        console.error("Error hashing password:", err);
        return;
    }

    const sql = 'INSERT INTO admins (username, email, password_hash, role) VALUES (?, ?, ?, ?)';
    const values = [username, email, hash, 'admin'];

    db.query(sql, values, (error, results) => {
        if (error) {
            console.error("Error inserting admin:", error);
        } else {
            console.log("✅ Admin inserted successfully!");
        }
        process.exit();
    });
});
