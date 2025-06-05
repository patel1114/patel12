const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.superadmin) {
        return next();
    }
    
    // Check if it's an API request
    if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
        return res.status(401).json({ 
            success: false, 
            message: 'Unauthorized - Please login' 
        });
    }
    
    // For page requests, redirect to login
    res.redirect('/superadmin/login');
};

const isSuperAdmin = (req, res, next) => {
    if (req.session && req.session.superadmin && req.session.superadmin.is_superadmin === 1) {
        return next();
    }
    
    // Check if it's an API request
    if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
        return res.status(403).json({ 
            success: false, 
            message: 'Forbidden - Superadmin access required' 
        });
    }
    
    // For page requests, redirect to login
    res.redirect('/superadmin/login');
};

module.exports = {
    isAuthenticated,
    isSuperAdmin
}; 