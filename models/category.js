const { mongoose, Schema } = require("mongoose");
const Joi = require("joi");

const categorySchema = mongoose.Schema({
    name: String,
    books: [{type: Schema.Types.ObjectId, ref:"Book"}]
});

function validateCategory(category) {
    const schema = new Joi.object({
        name: Joi.string().min(3).max(30).required(),
        books: Joi.array()      
    });

    return schema.validate(category);
}

const Category = mongoose.model("Category", categorySchema);

module.exports = { Category, validateCategory };