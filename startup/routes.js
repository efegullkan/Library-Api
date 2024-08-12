const express = require("express");
const books = require("../routes/books");
const categories = require("../routes/categories");
const users = require("../routes/users");
const admin = require("../routes/admin");
const loan = require("../routes/loan");
const home = require("../routes/home");
const error = require("../middleware/error");
const isAdmin = require("../middleware/isAdmin");
const auth = require("../middleware/auth");
const apiKeyAuthMiddleware  = require("../middleware/apiAuthMiddleware");
const rateLimiter  = require("../middleware/rateLimiter");


module.exports = function(app) {
    app.use(express.json());
    app.use(apiKeyAuthMiddleware);
    app.use(rateLimiter);
    app.use("/api/books" ,books);
    app.use("/api/categories" ,categories);
    app.use("/api/admin", auth, isAdmin ,admin);
    app.use("/api/users" ,users);
    app.use("/api/loan" ,loan);
    app.use("/", home);
    app.use(error);
}