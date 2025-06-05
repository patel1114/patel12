-- Drop indexes
DROP INDEX IF EXISTS idx_ticket_assignments_ticket_id ON ticket_assignments;
DROP INDEX IF EXISTS idx_ticket_assignments_admin_id ON ticket_assignments;
DROP INDEX IF EXISTS idx_ticket_assignments_status ON ticket_assignments;

-- Drop triggers
DROP TRIGGER IF EXISTS after_ticket_assignment_insert;
DROP TRIGGER IF EXISTS after_ticket_assignment_delete; 