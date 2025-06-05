const express = require('express')
const db = require('../models/db2')
const router = express.Router()
const { getAssignedTickets } = require('../controllers/ticketController');
//Moiddleware to check if admin is logged in\

function requireAdminAuth(req,res,next){
    if(!req.session.admin){
        return res.redirect('/admin/login')
    }
    next()
}

//reports page 
router.get('/reports',requireAdminAuth,async(req,res)=>{
    try{

        const adminId = req.session.admin.id;

        // Fetch assigned tickets
        const tickets = await getAssignedTickets(adminId);
        
        // Fetch ticket counts by help topic for assigned tickets
        const [ticketByHelpTopic] = await db.query(
            `SELECT helpTopic, COUNT(*) AS count 
             FROM tickets t
             JOIN ticket_assignments ta ON t.id = ta.ticket_id
             WHERE ta.admin_id = ?
             GROUP BY helpTopic`, 
            [adminId]
        );
        
        // Fetch ticket counts by location for assigned tickets
        const [ticketByLocation] = await db.query(
            `SELECT location, COUNT(*) AS count 
             FROM tickets t
             JOIN ticket_assignments ta ON t.id = ta.ticket_id
             WHERE ta.admin_id = ?
             GROUP BY location`, 
            [adminId]
        );
        
        // Fetch ticket counts by type for assigned tickets
        const [ticketByType] = await db.query(
            `SELECT type, COUNT(*) AS count 
             FROM tickets t
             JOIN ticket_assignments ta ON t.id = ta.ticket_id
             WHERE ta.admin_id = ?
             GROUP BY type`, 
            [adminId]
        );
        
        // Fetch all tickets assigned to this admin, ordered by latest
        const [allTickets] = await db.query(
            `SELECT t.* 
             FROM tickets t
             JOIN ticket_assignments ta ON t.id = ta.ticket_id
             WHERE ta.admin_id = ?
             ORDER BY t.id DESC`, 
            [adminId]
        );
        

        res.render('reports',{
            ticketByHelpTopic : ticketByHelpTopic,
            ticketByLocation : ticketByLocation,
            ticketByType : ticketByType,
            allTickets : allTickets,
            tickets:tickets
        })
    }
    catch(error){
        console.error(error)
        res.status(500).send('Error fetching reports data')
    }
})

module.exports=router