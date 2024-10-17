const jwt = require('jsonwebtoken');
const User = require('../model/userModel');

module.exports = async (req, res, next) => {
    try {
        const token = req.header('auth-token');
        if (!token) {
            console.log("No token provided");
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }
       console.log('token: ',token);
        const decoded = jwt.verify(token, "123abc");
        console.log("Decoded token: ", decoded);

        const user = await User.findById(decoded.userId);
        if (!user) {
            console.log("User not found for ID:", decoded.userId);
            return res.status(401).json({ message: "Unauthorized: User not found" });
        }

        req.user = user;
        next();
    } catch (err) {
        console.error("Authentication Error:", err);
        res.status(401).json({ message: "Please Signin, Your token have expired" });
    }
};


