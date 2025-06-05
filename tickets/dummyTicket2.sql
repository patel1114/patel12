-- Create and use the database
CREATE DATABASE IF NOT EXISTS Dummy;
USE Dummy;

-- ✅ Create admins table
CREATE TABLE admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    role ENUM('admin', 'superadmin') DEFAULT 'admin',
    location ENUM('Head Office (HO)', 'Branch Office', 'Factory', 'Warehouse', 'Remote Work', 'Data Center') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ✅ Create tickets table
CREATE TABLE tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticketId VARCHAR(50) UNIQUE NOT NULL,
    fullName VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    type ENUM(
        'Technical Issue', 'Software Bug', 'Hardware Issue', 'Network Problem', 
        'Access Request', 'Password Reset', 'Feature Request', 'General Inquiry'
    ) NOT NULL,
    telephone VARCHAR(10) NOT NULL,
    location ENUM('Head Office (HO)', 'Branch Office', 'Factory', 'Warehouse', 'Remote Work', 'Data Center') NOT NULL,
    subject VARCHAR(255) NOT NULL,
    helpTopic ENUM(
        'Email Not Working', 'System Login Issue', 'VPN/Remote Access Problem', 
        'Hardware Repair Request', 'Software Installation Request', 
        'Data Access Issue', 'Billing & Payments Issue', 'Leave & Attendance Query'
    ) NOT NULL,
    message TEXT NOT NULL,
    attachment VARCHAR(255),
    status ENUM('Open', 'In Progress', 'Closed') NOT NULL DEFAULT 'Open',
    assigned ENUM('Yes','No') DEFAULT 'No',
    assigned_admin_id INT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_admin_id) REFERENCES admins(id) ON DELETE CASCADE
);

-- ✅ Create ticket_assignments table for assignment history
CREATE TABLE ticket_assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id INT NOT NULL,
    admin_id INT NOT NULL,
    assigned_by INT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Open', 'In Progress', 'Closed') DEFAULT 'Open',
    notes TEXT,
    UNIQUE KEY unique_ticket_assignment (ticket_id),
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES admins(id) ON DELETE CASCADE
);

-- ✅ Create ticket_updates table for status tracking (optional enhancement)
CREATE TABLE ticket_updates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id INT NOT NULL,
    admin_id INT NOT NULL,
    status ENUM('Open', 'In Progress', 'Resolved', 'Closed') NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
);
