const express = require('express');
const router = express.Router();
const { Loan, validateLoan } = require('../models/loan');
const { Book } = require('../models/books');
const { User } = require('../models/user');
const auth = require('../middleware/auth'); // Auth middleware
const isAdmin = require('../middleware/isAdmin'); // Admin middleware
const emailService = require("../helpers/send-mail");

// Tüm ödünç almaları sorgula
// Fetch all loans
router.get('/', auth, isAdmin, async (req, res) => {
    // Find overdue and not returned loan records
    const loans = await Loan.find().populate('book user'); // Include book and user details
    res.status(200).send(loans);
});

// Kitap ödünç alma
// Borrow a book
router.post('/borrow', auth, isAdmin, async (req, res) => {
    const { bookId, dueDate, userId} = req.body;

    // Check existence of book and user
    const book = await Book.findById(bookId);
    const user = await User.findById(userId);
    if (!book || !user) {
        return res.status(404).send("Book or user not found.");
    }

    // Update user's reading list
    const updatedReadingList = user.readingList.filter(bookIdl => bookIdl.toString() !== bookId);
    user.readingList = updatedReadingList;
    await user.save();

    // Check if the book is already borrowed by someone else
    const existingLoan = await Loan.findOne({
        book: bookId,
        returned: false
    });

    if (existingLoan) {
        if (existingLoan.user == userId) {
            return res.status(400).send('The book is already borrowed by this user.');
        } else {
            return res.status(400).send('The book is already borrowed by someone else.');
        }
    }

    // Create a new loan record
    const loan = new Loan({
        book: book._id,
        user: user._id,
        dueDate: new Date(dueDate)
    });

    // Notify users from reading list except the borrower
    const users = await User.find({ readingList: bookId });
    for (const readingListUser of users) {
        if (readingListUser._id != userId) {
            const mailOptions = {
                from: 'efenodemailer@gmail.com',
                to: readingListUser.email,
                subject: 'A book from your Reading List has been borrowed.',
                text: `Hello ${readingListUser.name},\n\nThe book '${book.bookName}' from your Reading List has been borrowed by another user. You will be notified when the book is returned to the library.\n\nThank you.`
            };

            // Send email
            await emailService.sendMail(mailOptions);
        }
    }

    await loan.save();
    res.status(201).send(loan);
});

// Kitap iade etme
// Return a book
router.post('/return', auth, isAdmin, async (req, res) => {
    const { loanId } = req.body;

    // Find the loan record
    const loan = await Loan.findById(loanId);
    if (!loan) {
        return res.status(404).send("Loan record not found.");
    }

    // Update the book as returned
    loan.returned = true;
    loan.returnDate = Date.now();

    // Notify users from reading list except the borrower
    const users = await User.find({ readingList: loan.book });
    const book = await Book.findById(loan.book);
    for (const readingListUser of users) {
        if (readingListUser._id != loan.user) {
            const mailOptions = {
                from: 'efenodemailer@gmail.com',
                to: readingListUser.email,
                subject: 'A book from your reading list has been returned.',
                text: `Hello ${readingListUser.name},\n\nThe book '${book.bookName}' from your reading list has been returned to our library. You can visit our library to borrow the book again.\n\nThank you.`
            };

            // Send email
            await emailService.sendMail(mailOptions);
        }
    }

    await loan.save();
    res.status(200).send(loan);
});

// Geç kalmış kitapları bulma
// Find overdue books
router.get('/overdue', auth, isAdmin, async (req, res) => {
    const now = new Date();

    // Find overdue and not returned loan records
    const overdueLoans = await Loan.find({
        dueDate: { $lt: now },
        returned: false
    }).populate('book user'); // Include book and user details

    res.status(200).send(overdueLoans);
});

module.exports = router;
