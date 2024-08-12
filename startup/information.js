const cron = require('node-cron');
const emailService = require("../helpers/send-mail");
const { Loan } = require('../models/loan'); // Doğru yola göre düzenleyin
const { User } = require('../models/user'); // Doğru yola göre düzenleyin
const moment = require('moment-timezone');


// Her gün öğlen 2'de çalışacak cron job (cron job to run every day at 2pm)
cron.schedule('0 14 * * *', async () => {
    const today = moment().tz('Europe/Istanbul').startOf('day').toDate();
    const dueDate = moment().tz('Europe/Istanbul').add(3, 'days').startOf('day').toDate();
    console.log("mail yollandı")
    const loans = await Loan.find({
        dueDate: { $lte: dueDate, $gte: today },
        returned: false,
        notified: false
    }).populate('user book');

    for (const loan of loans) {
        const user = loan.user;
        const book = loan.book;

        // E-posta içeriği (Email content)
        const mailOptions = {
            from: 'efenodemailer@gmail.com',
            to: user.email,
            subject: 'Book Return Reminder',
            text: `Hello ${user.name},\n\nYour deadline to return the book "${book.bookName}" is approaching. Please return the book by ${moment(loan.dueDate).format('DD MMM YYYY')}.\n\nThank you.`
        };

        // E-posta gönder (Send email)
        await emailService.sendMail(mailOptions);

        // Bildirim gönderildi olarak işaretle (Mark as notified)
        loan.notified = true;
        await loan.save();
    }
});