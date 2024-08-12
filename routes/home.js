const express = require("express");
const router = express.Router();
const {Book, Comment, validateBook} = require("../models/books");


router.get("/", async (req, res) => {
    const books = await Book.find().populate("category","bookName -_id").select("-comments._id");
    res.send(books);
});

module.exports = router;