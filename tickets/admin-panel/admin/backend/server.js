const express = require('express');
const path = require('path');
// const db2=require('./models/db2');
const session = require('express-session');
const engine=require('ejs-mate')
const authRoutes = require('./routes/authRoutes')
const dashboardRoutes = require('./routes/dashboardRoutes')
const ticketRoutes = require('./routes/ticketRoutes')
const reportRoutes = require('./routes/reportRoutes')
// const superadminRoutes = require('./routes/superadminRoutes')
const app = express();



//Middleware
app.use(express.urlencoded({extended:true}))

// Serve static files
app.use(express.static(path.join(__dirname, '../frontend/public')));

// app.use(express.static(path.join(__dirname, '..', 'frontend', 'public')));
// app.use(superadminRoutes)
app.use(session({
    secret:'secret-key',
    resave : false,
    saveUninitialized:true,
    cookie:{secure:false}
}))

// Set EJS as the view engine
app.engine('ejs',engine)
app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, '..', 'admin/views'));
// app.set('views', path.join(__dirname, '..', 'frontend', 'views'));
app.set('views', path.join(__dirname, '../frontend/views'));  // Change this line



app.get('',(req,res)=>{
    res.redirect('/admin/login')
})

//use routes
app.use('/admin',authRoutes)
app.use('/admin',dashboardRoutes)
app.use('/admin',ticketRoutes)
app.use('/admin',reportRoutes)

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`✅ Server is running at http://localhost:${PORT}`);
});
