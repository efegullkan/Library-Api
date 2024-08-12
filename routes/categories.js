const express = require("express");
const router = express.Router();
const { Category, validateCategory } = require("../models/category");
const { Book } = require("../models/books");

const auth = require("../middleware/auth"); // Authentication middleware
const isAdmin = require("../middleware/isAdmin"); // Admin authorization middleware

// Bu endpoint, tüm kategorileri getirir ve bu kategorilere ait ürünleri adı ve fiyatıyla birlikte içerir.
// This endpoint fetches all categories and populates products of each category with their name and price.
router.get("/", async (req, res) => {
    const categories = await Category.find().populate("products","name price -_id");
    res.send(categories);
});

// Bu endpoint, belirli bir kategoriye ait kitapları getirmek için kullanılır.
// This endpoint is used to fetch books belonging to a specific category.
router.post("/books", async (req, res) => {
    const categoryName = req.body.categoryName;
    const regex = new RegExp(categoryName, 'i');
    const category = await Category.findOne({ name: { $regex: regex } });

    if (!category) {
        return res.send([]); // Return empty array if category not found
    }

    const books = await Book.find({ category: category._id });
    res.send(books);
});

// Bu endpoint, bir kategorinin ID'sine göre detaylarını getirmek için kullanılır.
// This endpoint is used to fetch details of a specific category by its ID.
router.get("/:id", async (req, res) => {
    const category = await Category.findById(req.params.id);
    if(!category) {
        return res.status(404).send("Category not found.");
    }
    res.send(category);
});

// Bu endpoint, yeni bir kategori eklemek için kullanılır (kimlik doğrulama ve yönetici yetkisi gerektirir).
// This endpoint is used to add a new category.
router.post("/", [auth, isAdmin], async (req, res) => {
    const { error } = validateCategory(req.body);

    if(error) {
        return res.status(400).send(error.details[0].message);
    }

    const category = new Category({
        name: req.body.name,
        books: req.body.books
    });

    const newCategory = await category.save();
    res.send(newCategory);
});

// Bu endpoint, bir kategoriyi güncellemek için kullanılır (kimlik doğrulama ve yönetici yetkisi gerektirir).
// This endpoint is used to update a category.
router.put("/:id", [auth, isAdmin], async (req, res) => {
    const category = await Category.findById(req.params.id);

    if(!category) {
        return res.status(404).send("Category not found.");
    }

    const { error } = validateCategory(req.body);

    if(error) {
        return res.status(400).send(error.details[0].message);
    }

    category.name = req.body.name;

    const updatedCategory = await category.save();
    res.send(updatedCategory);
});

// Bu endpoint, bir kategoriyi silmek için kullanılır (kimlik doğrulama ve yönetici yetkisi gerektirir).
// This endpoint is used to delete a category.
router.delete("/:id", [auth, isAdmin], async (req, res) => {
    const category = await Category.findByIdAndDelete(req.params.id);

    if(!category) {
        return res.status(404).send("Category not found.");
    }
    res.send(category);
});

module.exports = router;
