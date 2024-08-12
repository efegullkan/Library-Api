const mongoose = require("mongoose");
const Joi = require("joi");
const moment = require('moment-timezone');

const { Schema } = mongoose;

// Ödünç (Loan) Şeması
const loanSchema = new Schema({
    book: {
        type: Schema.Types.ObjectId,
        ref: "Book",
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    borrowedDate: {
        type: Date,
        default: () => moment().tz('Europe/Istanbul').toDate()
    },
    returnDate: Date,
    dueDate: {
        type: Date,
        required: true
    },
    returned: {
        type: Boolean,
        default: false
    },
    notified: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Ödünç doğrulama işlevi
function validateLoan(loan) {
    const schema = Joi.object({
        book: Joi.string().required(), // Book ID'si
        user: Joi.string().required(), // User ID'si
        borrowedDate: Joi.date(),
        returnDate: Joi.date(),
        dueDate: Joi.date().required(),
        returned: Joi.boolean()
    });

    return schema.validate(loan);
}

// Model oluşturma
const Loan = mongoose.model("Loan", loanSchema);

module.exports = { Loan, validateLoan };
