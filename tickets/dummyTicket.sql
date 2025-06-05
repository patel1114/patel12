create database Dummy ;
use Dummy;

CREATE TABLE tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticketId VARCHAR(50) UNIQUE NOT NULL,
    fullName VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    type ENUM('Technical Issue', 'Software Bug', 'Hardware Issue', 'Network Problem', 'Access Request', 'Password Reset', 'Feature Request', 'General Inquiry') NOT NULL,
    telephone VARCHAR(10) NOT NULL,
    location ENUM('Head Office (HO)', 'Branch Office', 'Factory', 'Warehouse', 'Remote Work', 'Data Center') NOT NULL,
    subject VARCHAR(255) NOT NULL,
    helpTopic ENUM('Email Not Working', 'System Login Issue', 'VPN/Remote Access Problem', 'Hardware Repair Request', 'Software Installation Request', 'Data Access Issue', 'Billing & Payments Issue', 'Leave & Attendance Query') NOT NULL,
    message TEXT NOT NULL,
    attachment VARCHAR(255),
    status ENUM('Open', 'In Progress', 'Resolved', 'Closed') DEFAULT 'Open',
    captcha varchar(20) not null,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
SELECT * FROM tickets WHERE status = 'Resolved';


ALTER TABLE tickets 
CHANGE COLUMN status status ENUM('Open', 'In Progress', 'Closed') NOT NULL DEFAULT 'Open';



alter table tickets add column assigned_admin_id int null;
alter table tickets add foreign key (assigned_admin_id) references admins(id) on delete cascade;

alter table tickets add column assigned enum('Yes','No') default 'No';

alter table tickets  drop column captcha;
select * from tickets;
describe tickets;
DROP TABLE tickets;
delete from tickets where id='25';
SHOW COLUMNS FROM tickets LIKE 'type';
