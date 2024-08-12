const mongoose = require('mongoose');
const { Schema } = mongoose;

const apiKeySchema = new Schema({
    key: { type: String, required: true, unique: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
});

const ApiKey = mongoose.model('ApiKey', apiKeySchema);
module.exports = ApiKey;
