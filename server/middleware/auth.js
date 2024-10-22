const jwt = require('jsonwebtoken');
const User = require('../model/userModel');

module.exports = async (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) {
        return res.status(401).json("Unauthorized: No token provided" );
    }
    try {
        const decoded = jwt.verify(token, "123abc");
        const currentTime = Math.floor(Date.now() / 1000);

        if (currentTime > decoded.exp) {
        
          return res.status(401).json({ error: 'Token expired' });
        }
      
        next();
    } catch (err) {
        
            return res.status(401).json({ error: 'Invalid token' });
    }
};


