-- Check if ticket_assignments table exists and create it if it doesn't
CREATE TABLE IF NOT EXISTS ticket_assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id INT NOT NULL,
    admin_id INT NOT NULL,
    assigned_by INT NOT NULL,
    assigned_at DATETIME NOT NULL,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES admins(id) ON DELETE CASCADE,
    UNIQUE KEY unique_ticket_assignment (ticket_id)
);

-- Add status column to tickets table if it doesn't exist
ALTER TABLE tickets
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'Open';

-- Update existing tickets to have 'Open' status if they don't have one
UPDATE tickets
SET status = 'Open'
WHERE status IS NULL; 