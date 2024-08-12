const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function (req, res, next) {
    const token = req.header("x-auth-token");
    if(!token) {
        return res.status(401).send("Authentication token required");
    }

    try {
        const decodedToken = jwt.verify(token, config.get("auth.jwtPrivateKey"));
        req.user = decodedToken; // Assign decoded token to req.user
        res.user_id = req.user._id; // Extract user ID from decoded token and assign to res.user_id
        next(); // Proceed to the next middleware
    }
    catch(ex) {
        res.status(400).send("Invalid token");
    }
}
