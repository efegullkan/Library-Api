const express = require("express");
const router = express.Router();
const { User, validateLogin, validateRegister } = require("../models/user");
const bcrypt = require("bcrypt");
const auth = require("../middleware/auth");

// İlgi alanlarını güncelleme
// Update user interests
router.put('/update-interests/', auth, async (req, res) => {
    const userId = res.user_id;
    let interestedCategories = req.body.interestedCategories; // [categoryId1, categoryId2, ...]

    if (!Array.isArray(interestedCategories)) {
        interestedCategories = [interestedCategories];
    }

    const user = await User.findByIdAndUpdate(
        userId,
        { $addToSet: { interestedCategories: { $each: interestedCategories } } },
        { new: true }
    );

    res.send(user);
});

// İlgi alanlarını kaldırma
// Remove user interests
router.put('/remove-interests/', auth, async (req, res) => {
    const userId = res.user_id;
    let interestedCategories = req.body.interestedCategories;

    // Eğer interestedCategories bir dizi değilse, onu bir diziye çevirin
    if (!Array.isArray(interestedCategories)) {
        interestedCategories = [interestedCategories];
    }
    const user = await User.findByIdAndUpdate(
        userId,
        { $pull: { interestedCategories: { $in: interestedCategories } } },
        { new: true }
    );

    res.send(user);
});

// Okuma listesi ekleme
// Add to reading list
router.post("/reading-list/", auth, async (req, res) => {
    const userId = res.user_id;
    const bookId = req.body.bookId;

    const user = await User.findById(userId);

    if (user.readingList.includes(bookId)) {
        return res.status(400).send("The book is already in your reading list.");
    }

    user.readingList.push(bookId);
    await user.save();

    res.send(user.readingList);
});

// Okuma listesinden kaldırma
// Remove from reading list
router.delete("/reading-list/", auth, async (req, res) => {
    const userId = res.user_id;
    const bookId = req.body.bookId;

    const user = await User.findById(userId);

    const updatedReadingList = user.readingList.filter(id => id.toString() !== bookId);
    if (updatedReadingList.length === user.readingList.length) {
        return res.status(400).send("The book is not found in your reading list.");
    }
    user.readingList = updatedReadingList;
    await user.save();

    res.send(user.readingList);
});

// Favorilere ekleme
// Add to favorites
router.post("/favorites/", auth, async (req, res) => {
    const userId = res.user_id;
    const bookId = req.body.bookId;

    const user = await User.findById(userId);

    if (user.favorites.includes(bookId)) {
        return res.status(400).send("The book is already in your favorites.");
    }

    user.favorites.push(bookId);
    await user.save();

    res.send(user.favorites);
});

// Favorilerden kaldırma
// Remove from favorites
router.delete("/favorites/", auth, async (req, res) => {
    const userId = res.user_id;
    const bookId = req.body.bookId;

    const user = await User.findById(userId);

    const updatedFavorites = user.favorites.filter(id => id.toString() !== bookId);
    if (updatedFavorites.length === user.favorites.length) {
        return res.status(400).send("The book is not found in your favorites.");
    }
    user.favorites = updatedFavorites;
    await user.save();

    res.send(user.favorites);
});

// Kullanıcı silme
// User Delete
router.delete("/delete", auth, async (req, res) => {
    const userId = res.user_id;
    const user = await User.findByIdAndDelete(userId);

    res.send(user);
});

// Kullanıcı oluşturma
// User creation
router.post("/create", async (req, res) => {
    const { error } = validateRegister(req.body);

    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    let user = await User.findOne({ email: req.body.email });

    if (user) {
        return res.status(400).send("User already registered with this email.");
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword
    });

    await user.save();

    const token = user.createAuthToken();

    res.header("x-auth-token", token).send(user);
});

// Kullanıcı girişi
// User login
router.post("/auth", async (req, res) => {
    const { error } = validateLogin(req.body);

    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    let user = await User.findOne({ email: req.body.email });
    if (!user) {
        return res.status(400).send("Invalid email or password.");
    }

    const isValidPassword = await bcrypt.compare(req.body.password, user.password);
    if (!isValidPassword) {
        return res.status(400).send("Invalid email or password.");
    }

    const token = user.createAuthToken();

    res.send(token);
});

// Kullanıcı bilgilerini güncelleme
// Update user information
router.put("/update", auth, async (req, res) => {
    const { error } = validateRegister(req.body);

    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    let user = await User.findOne({ _id: res.user_id });
    if (req.body.email !== user.email) {
        let existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).send("Email already in use.");
        }
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    user.name = req.body.name;
    user.email = req.body.email;
    user.password = hashedPassword;

    const updatedUser = await user.save();
    res.send(updatedUser);
});

module.exports = router;
