require('express-async-errors');
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth"); // Authentication middleware
const isAdmin = require("../middleware/isAdmin"); // Admin authorization middleware
const emailService = require("../helpers/send-mail"); // Email service helper
const upload = require('../middleware/multer');
const config = require("config");

const { Category, validateCategory } = require("../models/category"); // Category model and validation
const {Book, Comment, validateBook} = require("../models/books"); // Book and Comment models and validation
const { User } = require('../models/user'); // User model



// Bu endpoint, tüm kitapları getirir ve yorumları hariç tutar, kategori bilgisini de içerir.
// This endpoint fetches all books, excluding comments, and populates category information.
router.get("/", async (req, res, next) => {
    const books = await Book.find().populate("category","bookName -_id").select("-comments._id");
    res.send(books);
});

// Bu endpoint, bir kitabın ID'sine göre detaylarını getirmek için kullanılır (kimlik doğrulama gerektirir).
// This endpoint is used to fetch details of a specific book by its ID (requires authentication).
router.get("/:id", auth, async (req, res) => {
    const book = await Book.findById(req.params.id).populate("category","bookName -_id"); 

    if(!book) {
        return res.status(404).send("Book not found."); // Return if book not found
    }
    res.send(book);
});

// Bu endpoint, yeni bir kitap eklemek için kullanılır (kimlik doğrulama ve yönetici yetkisi gerektirir).
// This endpoint is used to add a new book (requires authentication and admin privileges).
router.post("/", [auth, isAdmin, upload.single('file')], async (req, res) => {
    let coverImage = config.get('defaultBookImage') // Varsayılan dosya adı

    // req.file üzerinden dosya bilgilerine erişim sağlayabilirsiniz
    if (req.file) {
        coverImage = req.file.filename; // Dosya yüklendiyse, gerçek dosya adını alın
    }

    const { error } =  validateBook(req.body);

    if(error) {
        return res.status(400).send(error.details[0].message); // Return validation error
    }

    const book = new Book({
        bookName: req.body.bookName,
        bookAuthor: req.body.bookAuthor,
        description: req.body.description,
        pageCount: req.body.pageCount,
        publishedDate: req.body.publishedDate,
        language: req.body.language,
        inLibrary: req.body.inLibrary,
        category: req.body.category,
        comments: req.body.comments,
        bookImage: coverImage
    });
    
    

    const newBook = await book.save();

    const categoryId = req.body.category;

    // Find the category and push the book's ObjectId into the books array
    await Category.findByIdAndUpdate(categoryId, { $push: { books: newBook._id } });

    const users = await User.find({ interestedCategories: categoryId });

    // Send email to each user
    for (const user of users) {
        const mailOptions = {
            from: 'efenodemailer@gmail.com',
            to: user.email,
            subject: 'New Book Added',
            text: `Hello ${user.name},\n\nA new book "${newBook.bookName}" has been added to the category you are interested in our library. Would you like to take a look?\n\nThank you.`
        };

        // Send email
        await emailService.sendMail(mailOptions);
    }

    res.send(newBook);
});

// Bu endpoint, bir kitabın detaylarını güncellemek için kullanılır (kimlik doğrulama gerektirir).
// This endpoint is used to update book details (requires authentication).
router.put("/:id", [auth, isAdmin], async (req, res) => {
    const book = await Book.findById(req.params.id);
    if(!book) {
        return res.status(404).send("Book not found."); // Return if book not found
    }

    const { error } = validateBook(req.body);

    if(error) {
        return res.status(400).send(error.details[0].message); // Return validation error
    }

    book.bookName = req.body.bookName;
    book.bookAuthor = req.body.bookAuthor;
    book.description = req.body.description;
    book.pageCount = req.body.pageCount;
    book.publishedDate = req.body.publishedDate;
    book.language = req.body.language;
    book.inLibrary = req.body.inLibrary;
    book.category = req.body.category;
    book.comments = req.body.comments;

    const updatedBook = await book.save();

    res.send(updatedBook);
});

// Bu endpoint, bir kitabı silmek için kullanılır (kimlik doğrulama ve yönetici yetkisi gerektirir).
// This endpoint is used to delete a book (requires authentication).
router.delete("/:id", [auth, isAdmin],  async (req, res) => {
    const book = await Book.findByIdAndDelete(req.params.id);

    if(!book) {
        return res.status(404).send("Book not found."); // Return if book not found
    }

    res.send(book);
});

// Bu endpoint, kitap adı veya yazar adına göre kitap aramak için kullanılır.
// This endpoint is used to search for books by book name or author name.
router.post("/search", async (req, res, next) => {
    const query = req.body.query;
    const regex = new RegExp(query, 'i'); // 'i' parameter makes the search case-insensitive

    const books = await Book.find({
        $or: [
            { bookName: { $regex: regex } },
            { bookAuthor: { $regex: regex } }
        ]
    });
    
    if (!books) {
        return res.status(404).send("No books found matching your search."); // Return if no books found
    }

    res.json(books);
});

// Bu endpoint, bir kitabın ID'sine göre yorumlarını getirmek için kullanılır.
// This endpoint is used to fetch comments of a specific book by its ID.
router.get("/comments/:id", async (req, res, next) => {
    const book = await Book.findById(req.params.id);
    if (!book) {
        return res.status(404).send("Comment not found."); // Return if book not found
    }
    
    const comments = book.comments; // Retrieve only comments
    res.json(comments);
});

// Bu endpoint, bir kitaba yorum eklemek için kullanılır (kimlik doğrulama gerektirir).
// This endpoint is used to add a comment to a book (requires authentication).
router.put("/comment/:id", auth, async (req, res) => {
    const book = await Book.findById(req.params.id);
    if(!book) {
        return res.status(404).send("Book not found."); // Return if book not found
    }
    
    const comment = new Comment({
        text: req.body.text,
        username: req.body.username,
        point: req.body.point
    });

    book.comments.push(comment);
    let sumPoints = 0;
    book.comments.forEach(comment => {
        sumPoints+=comment.point;
    });
    let bookAvgPoint = sumPoints / book.comments.length;
    book.point = bookAvgPoint;
    const updatedBook = await book.save();
    res.send(updatedBook);
});

// Bu endpoint, bir kitaptan yorum silmek için kullanılır (kimlik doğrulama ve yönetici yetkisi gerektirir).
// This endpoint is used to delete a comment from a book (requires authentication).
router.delete("/comment/:id", [auth, isAdmin], async (req, res) => {
    const book = await Book.findById(req.params.id);
    if(!book) {
        return res.status(404).send("Book not found."); // Return if book not found
    }
    const comment = book.comments.id(req.body.commentid);
    comment.remove();

    const updatedBook = await book.save();
    res.send(updatedBook);
});


module.exports = router;
