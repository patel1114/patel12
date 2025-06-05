const db = require("../config/db");

// Get all tickets
exports.getTickets = async (req, res) => {
    try {
        const [tickets] = await db.query("SELECT * FROM tickets");
        res.render('view-tickets',{tickets})
    } catch (error) {
        console.error("Error fetching tickets:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// Delete closed tickets
exports.deleteClosedTickets = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query("DELETE FROM tickets WHERE id = ? AND status = 'Closed'", [id]);
        res.json({ message: "Closed ticket deleted successfully" });
    } catch (error) {
        console.error("Error deleting ticket:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
