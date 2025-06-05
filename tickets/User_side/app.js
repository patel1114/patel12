//app.js
//importing necessary modules and files
const express = require("express");
const path = require("path");
const ticketRoutes = require("./routes/ticketRoutes");
const userRoutes = require("./routes/userRoutes");
const bodyParser = require("body-parser");
const session = require("express-session");
const { generateCaptcha, verifyCaptcha } = require("./utils/captcha");
const app = express();
const multer = require("multer");
const ticketController = require("./contollers/ticketController");
const db = require('./db')
const captchaController = require("./utils/captcha"); // Make sure the path is correct

// const util = require('util');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const upload = multer({ dest: "uploads/" });

app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

// Mount routes
app.use('/', userRoutes); // Mount user routes first
app.use('/', ticketRoutes);

// Define the index.html route
app.get("/index.html", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "index.html"));
});

// Define the new-ticket route
app.get("/new-ticket", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "index2.html"));
});

// Generate CAPTCHA
app.get("/captcha", generateCaptcha);

// Use verifyCaptcha middleware here
app.post(
  "/new-ticket",
  upload.single("attachment"),
  verifyCaptcha,
  ticketController.createTicket
);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});