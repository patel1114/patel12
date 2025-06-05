const express = require("express");
const session = require("express-session");
const path = require("path");
const app = express();
const cors = require("cors");
const db = require("./config/db");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../frontend/views"));

// Serve static files
app.use(express.static(path.join(__dirname, "../frontend/public")));

// Session configuration
app.use(session({
    secret: "your-secret-key", 
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true in production with HTTPS
}));

// Import Routes
const ticketRoutes = require("./routes/ticketRoutes");
const adminRoutes = require("./routes/adminRoutes");
const assignRoute = require("./routes/assignRoute");
const authRoutes = require('./routes/authRouter');

// Use Routes
app.use(ticketRoutes);
app.use(adminRoutes);
app.use('/assign', assignRoute);
app.use(authRoutes);

// Dashboard route
app.get("/", async (req, res) => {
    if (!req.session.superadmin) {
        return res.redirect("/superadmin/login");
    }
    res.render("dashboard");
});

// Start Server
const PORT = 5002;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});