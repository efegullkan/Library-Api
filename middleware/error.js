const logger = require("../startup/logger");

module.exports = function(err, req, res, next) {
    // logging
    // logger.log("error",err.message);
    logger.error(err.message, err);
    res.status(500).send("An error occurred.");
}