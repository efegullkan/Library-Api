module.exports = function(req, res, next) {
    if (!req.user.isAdmin) {
        return res.status(403).send("You do not have access authorization.");
    }
    next();
}