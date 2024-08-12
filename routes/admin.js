const express = require("express");
const router = express.Router();
const { User, validateLogin, validateRegister } = require("../models/user");
const { ObjectId } = require('mongoose').Types;

// Kullanıcı arama işlemi için (/user/search)
// Search for users based on query (name, email, or ID)
router.post("/user/search", async (req, res) => {
    const query = req.body.query;
    const regex = new RegExp(query, 'i');

    // Arama sorgusu oluşturma
    // Creating search query
    if (ObjectId.isValid(query)) {
        users = await User.find({
            $or: [
                { name: { $regex: regex } },
                { email: { $regex: regex } },
                { _id: ObjectId(query) }
            ]
        });
    } else {
        users = await User.find({
            $or: [
                { name: { $regex: regex } },
                { email: { $regex: regex } }
            ]
        });
    }

    if (users.length === 0) {
        return res.status(404).send("No users found matching your search.");
        // Aramanıza uygun kullanıcı bulunamadı.
    }

    res.json(users);
});

// Kullanıcı listesi alma işlemi için (/user/list)
// Get a list of all users
router.get("/user/list", async (req, res) => {
    let users = await User.find();
    res.send(users);
});

// Kullanıcı silme işlemi için (/user/delete/:id)
// Delete a user by ID
router.delete("/user/delete/:id", async (req, res) => {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
        return res.status(404).send("User not found.");
        // Aradığınız kullanıcı bulunamadı.
    }

    res.send(user);
});

// Kullanıcıyı yönetici yapma işlemi için (/user/make/admin)
// Make a user an admin by user ID
router.post("/user/make/admin", async (req, res) => {
    const userId = req.body.userId;
    let user = await User.findById(userId);
    if (!user) {
        console.log('User not found');
        // Kullanıcı bulunamadı
        return res.status(404).send("User not found.");
        // Kullanıcı bulunamadı.
    }
    user.isAdmin = true;
    await user.save();
    res.send(user)
});

module.exports = router;
