const mongoose = require("mongoose");
const Joi = require("joi");
const { Schema } = mongoose;
const moment = require('moment-timezone');
const { User } = require("./user");

const commentSchema = mongoose.Schema({
    text: String,
    username: String,
    point: Number,
    date: {
        type: Date,
        default: Date.now()
    },
    // user: { type: Schema.Types.ObjectId, ref: "User"}
}, { autoCreate: false});

const bookSchema = mongoose.Schema({
    bookName: {
        type: String,
        required: true
    },
    bookAuthor: {
        type: String,
        required: true
    },
    description: String,
    pageCount: Number,
    publishedDate: Date,
    language: String,
    inLibrary: Boolean,
    point: {
        type: Number,
        default: 5
    },
    date: {
        type: Date,
        default: Date.now()
    },
    bookImage: String,
    category: { type: Schema.Types.ObjectId, ref: "Category" },
    comments: [commentSchema]
});

function validateBook(book) {
    const schema = Joi.object({
        bookName: Joi.string().min(3).max(255).required(),
        bookAuthor: Joi.string().min(3).max(255).required(),
        description: Joi.string().max(1024),
        pageCount: Joi.number().integer().min(1),
        publishedDate: Joi.date(),
        language: Joi.string().min(2).max(50),
        inLibrary: Joi.boolean(),
        category: Joi.string().length(24),
        comments: Joi.array()
    });

    return schema.validate(book);
}



const Book = mongoose.model("Book", bookSchema); 
const Comment = mongoose.model("Comment", commentSchema); 

module.exports = { Book, Comment, validateBook };
